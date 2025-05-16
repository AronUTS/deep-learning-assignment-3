# Utility script to sample and extract frames to a specified directory for use with dataset creation from video.

import cv2
import os

VIDEO_NAME = "original_video_01"

def extract_frames(video_path, output_dir, interval_seconds=5):
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Load the video
    video = cv2.VideoCapture(video_path)
    if not video.isOpened():
        print("Error: Cannot open video file.")
        return

    # Get video properties
    fps = video.get(cv2.CAP_PROP_FPS)
    total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    print(f"Video duration: {duration:.2f} seconds, FPS: {fps}, Total frames: {total_frames}")

    # Calculate frame interval
    frame_interval = int(fps * interval_seconds)
    frame_count = 0
    saved_count = 0

    while True:
        # Set video position
        video.set(cv2.CAP_PROP_POS_FRAMES, frame_count)
        success, frame = video.read()
        if not success:
            break

        # Save frame
        filename = os.path.join(output_dir, f"frame_{saved_count:05d}.jpg")
        cv2.imwrite(filename, frame)
        print(f"Saved: {filename}")
        saved_count += 1

        # Move to next interval
        frame_count += frame_interval
        if frame_count >= total_frames:
            break

    video.release()
    print("Frame extraction complete.")

# Example usage:
extract_frames(f"videos/{VIDEO_NAME}.mp4", F"frame_extract_outputs/{VIDEO_NAME}", interval_seconds=2)
