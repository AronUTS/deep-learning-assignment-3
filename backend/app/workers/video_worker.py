import time
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

# If model doesnt exist in container, load it from google drive
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "ml_models/checkpoint_fasterRcnn_customhead_customdataset_epoch_3.pth")
GDRIVE_FILE_ID = "1msshCMWch0CuzKc4uo_s2F4h4yVHHU4y"
GDRIVE_URL = f"https://drive.google.com/uc?id={GDRIVE_FILE_ID}"

if not os.path.exists(MODEL_PATH):
    os.makedirs(os.path.join(BASE_DIR, "ml_models"), exist_ok=True)
    print("Downloading model checkpoint from Google Drive...")
    gdown.download(GDRIVE_URL, MODEL_PATH, quiet=False)
    print(f"Model downloaded to {MODEL_PATH}")
else:
    print(f"Model already exists at {MODEL_PATH}")

# Custom classifier head
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

# Helper method to Load model
def get_model(num_classes):
    backbone = resnet_fpn_backbone(backbone_name='resnet50', weights='DEFAULT')
    model = FasterRCNN(backbone, num_classes=num_classes)
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = CustomFastRCNNPredictor(in_features, num_classes)
    return model

# Custom distance function for Norfair motion tracking based on center points
def custom_distance(detection, tracked_object):
    det_center = detection.points[0]
    trk_center = tracked_object.estimate[0]
    return np.linalg.norm(det_center - trk_center)

# Initialise Norfair tracker with center-based distance
tracker = Tracker(
    distance_function=custom_distance,
    distance_threshold=30,  # Higher for center-only tracking
    hit_counter_max=60,
    initialization_delay=3
)

# Initialise device and load trained model
NUM_CLASSES = 2
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = get_model(NUM_CLASSES)
checkpoint = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(checkpoint["model_state_dict"])
model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.ToTensor()
])

# Main process worker loop - queries processing table for 'QUEUED' videos to process
def process_video_worker_loop():
    print("[Worker] Starting background video processor.")
    while True:
        try:
            # Get the next video with status 'QUEUED'
            task = ProcessingQueue.query.filter_by(status='QUEUED').first()

            if task:

                # Define input and output variables
                INPUT_VIDEO_PATH = os.path.join(BASE_DIR, "videos/uploads/video_02.mp4")
                OUTPUT_VIDEO_PATH = os.path.join(BASE_DIR, "videos/processed/video_02.mp4")

                # Open video and grab processing metrics
                print(f"[Worker] Opening video file: {INPUT_VIDEO_PATH}")
                cap = cv2.VideoCapture(INPUT_VIDEO_PATH)
                fps = cap.get(cv2.CAP_PROP_FPS)
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

                # If video opened successfully, update tasks status to processing
                print(f"[Worker] Processing: {task.file_name}")
                task.status = 'PROCESSING'
                db.session.commit()

                print(f"[Worker] Video properties - Total frames: {total_frames}, FPS: {fps}, Resolution: {width}x{height}")

                os.makedirs("../videos/processed", exist_ok=True)
                fourcc = cv2.VideoWriter_fourcc(*'MJPG')
                out = cv2.VideoWriter(OUTPUT_VIDEO_PATH, fourcc, fps, (width, height))

                if not out.isOpened():
                    print(f"[Worker] Error: Failed to open VideoWriter at: {OUTPUT_VIDEO_PATH}")
                    raise RuntimeError(f"Failed to open VideoWriter with path: {OUTPUT_VIDEO_PATH}")

                print("[Worker] Starting video processing loop...")

                # Set to store unique ids for object counts
                unique_ids = set()
                frame_index = 0

                # While frames exist, run detection on video
                while cap.isOpened():
                    ret, frame = cap.read()
                    if not ret:
                        print("[Worker] End of video stream reached.")
                        break

                    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    input_tensor = transform(image).to(device)

                    # Get prediections, avoid computing gradient
                    with torch.no_grad():
                        predictions = model([input_tensor])[0]

                    # Get detections
                    detections = []
                    for box, score, label in zip(predictions["boxes"], predictions["scores"], predictions["labels"]):
                        if score > 0.97:
                            box = box.to("cpu").numpy()
                            x1, y1, x2, y2 = box
                            cx = (x1 + x2) / 2
                            cy = (y1 + y2) / 2
                            detections.append(Detection(points=np.array([[cx, cy]]), scores=np.array([score]), data=box))

                    # Load detections into tracker
                    tracked_objects = tracker.update(detections=detections)

                    # Create bounding boxes per frame, calculate unique identifications
                    for obj in tracked_objects:
                        unique_ids.add(obj.id)
                        if hasattr(obj.last_detection, "data"):
                            x1, y1, x2, y2 = obj.last_detection.data
                        else:
                            cx, cy = obj.estimate[0]
                            x1, y1, x2, y2 = cx - 20, cy - 20, cx + 20, cy + 20

                        cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
                        center_x = (x1 + x2) / 2
                        center_y = (y1 + y2) / 2
                        cv2.putText(frame, f"Sheep #{obj.id}", (int(center_x), int(center_y) - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)

                    # Write frame out to video file
                    out.write(frame)
                    frame_index += 1

                    if frame_index % 30 == 0:
                        print(f"[Worker] Processed {frame_index}/{total_frames} frames...")

                print(f"[Worker] Finished processing. Unique sheep IDs detected: {len(unique_ids)}")

                cap.release()
                out.release()

                # Update tasks status to COMPLETED
                task.status = 'COMPLETED'
                db.session.commit()
                print(f"[Worker] Completed: {task.file_name}")
            else:
                # Nothing to do, sleep a bit
                print(f"[Worker] Nothing to process, sleeping...")
                time.sleep(2)
        except Exception as e:
            print(f"[Worker] Error: {str(e)}")
            db.session.rollback()
            time.sleep(2)
