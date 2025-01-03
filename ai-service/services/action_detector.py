from dataclasses import dataclass
from typing import List, Dict
import cv2
import numpy as np
import torch
from collections import deque
import warnings

# Suppress specific warnings
warnings.filterwarnings("ignore", category=FutureWarning)

@dataclass
class ActionDetector:
    def __init__(self):
        self.model = torch.hub.load('ultralytics/yolov5', 'yolov5s')
        self.motion_threshold = 50.0
        self.object_confidence_threshold = 0.5  # Minimum confidence for detected objects
        self.grouping_window = 1.0  # Time window (in seconds) to group similar detections

    def detect_actions(self, video_path: str) -> List[Dict]:
        """
        Detect significant actions/movements in video

        Args:
            video_path: Path to video file

        Returns:
            List of dictionaries containing action detection results
        """
        actions = []
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        prev_frame = None
        frame_count = 0

        # Queue to store detections for grouping
        grouped_actions = deque()

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % 5 == 0:  # Process every 5th frame
                # Object detection
                results = self.model(frame)
                detections = results.xyxy[0].cpu().numpy()

                # Motion detection
                if prev_frame is not None:
                    frame_diff = cv2.absdiff(frame, prev_frame)
                    motion_score = np.mean(frame_diff)

                    if motion_score > self.motion_threshold:
                        objects = []
                        for det in detections:
                            confidence = float(det[4])
                            if confidence >= self.object_confidence_threshold:
                                objects.append({
                                    "class": results.names[int(det[5])],
                                    "confidence": confidence,
                                    "box": det[:4].tolist()
                                })

                        if objects:
                            timestamp = frame_count / fps

                            # Check for grouping within the specified time window
                            if grouped_actions and abs(grouped_actions[-1]['timestamp'] - timestamp) <= self.grouping_window:
                                # Merge objects into the previous detection
                                grouped_actions[-1]['objects'].extend(objects)
                                grouped_actions[-1]['motion_score'] = max(grouped_actions[-1]['motion_score'], motion_score)
                            else:
                                grouped_actions.append({
                                    "timestamp": timestamp,
                                    "motion_score": float(motion_score),
                                    "objects": objects
                                })

                prev_frame = frame

            frame_count += 1

        cap.release()

        # Convert grouped actions to a list of unique detections
        actions = list(grouped_actions)

        return actions