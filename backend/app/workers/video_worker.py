import time
from datetime import datetime
from app.models.processing_queue import ProcessingQueue
from app.extensions import db
import torch
import torchvision
import torch.nn as nn
from torchvision.models.detection import FasterRCNN
from torchvision.models.detection.backbone_utils import resnet_fpn_backbone
import cv2
from torchvision import transforms
import os
import numpy as np
from norfair import Detection, Tracker
import gdown
import subprocess
import random

# Init directory and model vars
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "ml_models/final_model_fasterRcnn_resnet50_customhead_customdataset_lowdropout_epoch_8.pth")
GDRIVE_FILE_ID = "1msshCMWch0CuzKc4uo_s2F4h4yVHHU4y"
GDRIVE_URL = f"https://drive.google.com/uc?id={GDRIVE_FILE_ID}"

# If model does not exist, download it from gdrive
if not os.path.exists(MODEL_PATH):
    os.makedirs(os.path.join(BASE_DIR, "ml_models"), exist_ok=True)
    gdown.download(GDRIVE_URL, MODEL_PATH, quiet=False)

# Define custom classifier head for FRCNN model
class CustomFastRCNNPredictor(nn.Module):
    def __init__(self, in_channels, num_classes):
        super().__init__()
        self.classifier = nn.Sequential(
            nn.Linear(in_channels, 512),
            nn.ReLU(),
            nn.BatchNorm1d(512),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.BatchNorm1d(256),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )
        self.bbox_regressor = nn.Linear(in_channels, num_classes * 4)

    def forward(self, x):
        scores = self.classifier(x)
        bbox_deltas = self.bbox_regressor(x)
        return scores, bbox_deltas

# Helper to get model
def get_model(num_classes):
    backbone = resnet_fpn_backbone(backbone_name='resnet50', weights='DEFAULT')
    model = FasterRCNN(backbone, num_classes=num_classes)
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = CustomFastRCNNPredictor(in_features, num_classes)
    return model

# Helper to encode video after processing
# This is a workaround for macOS devices as MacOS hardware encoding is not possible in docker container
def run_ffmpeg_encoding(input_video_path, output_video_path):
    command = [
        "ffmpeg", 
        "-i", input_video_path,
        "-vcodec", "libx264",
        "-acodec", "aac",
        "-strict", "-2",
        output_video_path
    ]
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        pass

# Helper function to assign random colours to detected objects
def get_colour(track_id, id_color_map):
    if track_id not in id_color_map:
        random.seed(track_id)
        id_color_map[track_id] = (
            random.randint(50, 255),
            random.randint(50, 255),
            random.randint(50, 255)
        )
    return id_color_map[track_id]

# Initialise the Norfair tracker
tracker = Tracker(
    distance_function="euclidean",
    distance_threshold=30,
    hit_counter_max=60,
    initialization_delay=3
)

# Initialise classes and device vars
NUM_CLASSES = 2
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Get model and move to device
try:
    model = get_model(NUM_CLASSES)
    checkpoint = torch.load(MODEL_PATH, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()
except Exception as e:
    pass

transform = transforms.Compose([
    transforms.ToTensor()
])

# Main processor worker loop
def process_video_worker_loop():
    while True:
        try:
            # If there is a queued task, fetch the first one
            task = ProcessingQueue.query.filter_by(status='QUEUED').first()

            if task:
                # Set input/output paths
                INPUT_VIDEO_PATH = os.path.join(BASE_DIR, f"videos/uploads/{task.file_name}")
                OUTPUT_VIDEO_PATH = os.path.join(os.path.dirname(BASE_DIR), f"static/assets/videos/processed/{task.file_name}")

                # Array to store prediction scores to calculate confidence
                pred_scores_all = []

                # Open video and get core metrics
                cap = cv2.VideoCapture(INPUT_VIDEO_PATH)

                if not cap.isOpened():
                    task.status = 'FAILED'
                    db.session.commit()
                    continue

                fps = cap.get(cv2.CAP_PROP_FPS)
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                duration_seconds = total_frames / fps if fps > 0 else 0

                # Set task value to processing
                task.status = 'PROCESSING'
                task.start_time = datetime.utcnow()
                db.session.commit()

                # Ensure output directory exists, init encoders and writer
                os.makedirs("../videos/processed", exist_ok=True)
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                out = cv2.VideoWriter(OUTPUT_VIDEO_PATH, fourcc, fps, (width, height))

                if not out.isOpened():
                    raise RuntimeError(f"VideoWriter failed: {OUTPUT_VIDEO_PATH}")

                # Initialise vars for core frame loop
                unique_ids = set()
                id_color_map = {}
                frame_index = 0
                progress_update_threshold = 5
                last_logged_progress = 0
                last_frame = None

                while cap.isOpened():
                    ret, frame = cap.read()
                    if not ret:
                        break

                    last_frame = frame
                    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    input_tensor = transform(image).to(device)

                    # Get predictions
                    try:
                        with torch.no_grad():
                            predictions = model([input_tensor])[0]
                    except Exception as e:
                        break

                    # Feed filtered predictions to tracker
                    detections = []
                    for box, score, label in zip(predictions["boxes"], predictions["scores"], predictions["labels"]):
                        if score > 0.95:
                            score_val = score.cpu().item()
                            pred_scores_all.append(score_val)
                            box = box.cpu().numpy()
                            x1, y1, x2, y2 = box
                            cx = (x1 + x2) / 2
                            cy = (y1 + y2) / 2
                            detections.append(Detection(points=np.array([[cx, cy]]), scores=np.array([score_val]), data=box))

                    tracked_objects = tracker.update(detections=detections)

                    # Drawer bounding boxes on tracked objects
                    for obj in tracked_objects:
                        unique_ids.add(obj.id)
                        if hasattr(obj.last_detection, "data"):
                            x1, y1, x2, y2 = obj.last_detection.data
                        else:
                            cx, cy = obj.estimate[0]
                            x1, y1, x2, y2 = cx - 20, cy - 20, cx + 20, cy + 20

                        # Normalize box coordinates to integers
                        x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])

                        # Assign color
                        color = get_colour(obj.id, id_color_map)
                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

                        # Prepare label
                        label = f"Sheep #{obj.id}"
                        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)

                        # Draw filled label background
                        label_bg_topleft = (x1, y1 - th - 8)
                        label_bg_bottomright = (x1 + tw + 4, y1)
                        cv2.rectangle(frame, label_bg_topleft, label_bg_bottomright, color, -1)

                        # Draw label text
                        cv2.putText(frame, label, (x1 + 2, y1 - 4),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

                    # Write out frame
                    out.write(frame)
                    frame_index += 1

                    # Update progress percentage for UI
                    progress_percentage = int((frame_index / total_frames) * 100)
                    if progress_percentage >= last_logged_progress + progress_update_threshold:
                        last_logged_progress = progress_percentage
                        task.progress_percentage = progress_percentage
                        task.processing_time = (datetime.utcnow() - task.start_time).total_seconds()
                        db.session.commit()

                cap.release()
                out.release()

                # If it is the last frame, save ax thumbnail for UI use
                if last_frame is not None:
                    thumbnail_rel_path = f"static/assets/thumbnails/processed/{task.file_name}.jpg"
                    thumbnail_abs_path = os.path.join(os.path.dirname(BASE_DIR), thumbnail_rel_path)
                    os.makedirs(os.path.dirname(thumbnail_abs_path), exist_ok=True)
                    cv2.imwrite(thumbnail_abs_path, last_frame)
                    task.thumbnail_path = thumbnail_rel_path
                    db.session.commit()

                # Define output path and encode video for correct format for UI rendering
                final_output_video_path = os.path.join(os.path.dirname(BASE_DIR), f"static/assets/videos/processed/encoded_{task.file_name}")
                run_ffmpeg_encoding(OUTPUT_VIDEO_PATH, final_output_video_path)

                # Calculate metrics and save to DB
                avg_conf = sum(pred_scores_all) / len(pred_scores_all) if pred_scores_all else 0.0
                task.final_output_video_path = f"static/assets/videos/processed/encoded_{task.file_name}"
                task.duration_seconds = duration_seconds
                task.detected_objects = len(unique_ids)
                task.average_confidence = avg_conf
                task.resolution = f"{width}x{height}"
                task.processed_frames = total_frames
                task.status = 'COMPLETED'
                task.end_time = datetime.utcnow()
                db.session.commit()
            else:
                time.sleep(2)
        except Exception as e:
            db.session.rollback()
            time.sleep(2)
