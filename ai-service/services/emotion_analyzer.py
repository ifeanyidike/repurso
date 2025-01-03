from facenet_pytorch import MTCNN, InceptionResnetV1
from typing import List, Dict, Tuple, Optional
import torch
from transformers import pipeline
import librosa
import numpy as np
import cv2
from PIL import Image



class EmotionAnalyzer:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.face_detector = MTCNN(device=self.device)
        self.emotion_classifier = pipeline(
            "image-classification",
            model="dima806/facial_emotions_image_detection",
            device=0 if self.device == "cuda" else -1
        )

    def _extract_face(self, frame: np.ndarray,
                    box: np.ndarray) -> Optional[np.ndarray]:
        """
        Extract face region from frame

        Args:
            frame: Input frame
            box: Bounding box coordinates [x1, y1, x2, y2]

        Returns:
            Face image if extraction successful, None otherwise
        """
        try:
            x1, y1, x2, y2 = [int(coord) for coord in box]

            # Add padding
            padding = 20
            h, w = frame.shape[:2]
            x1 = max(0, x1 - padding)
            y1 = max(0, y1 - padding)
            x2 = min(w, x2 + padding)
            y2 = min(h, y2 + padding)

            face = frame[y1:y2, x1:x2]

            # Ensure minimum size
            if face.shape[0] < 64 or face.shape[1] < 64:
                return None

            # Resize to consistent size
            face = cv2.resize(face, (224, 224))

            return face
        except Exception as e:
            print(f"Face extraction: {e}")
            return None

    def _process_emotions(self, video_path: str) -> List[Dict]:
        """Process facial emotions in video"""
        emotions = []
        video = cv2.VideoCapture(video_path)
        fps = video.get(cv2.CAP_PROP_FPS)

        frame_count = 0
        while video.isOpened():
            ret, frame = video.read()
            if not ret:
                break

            # Process every 5th frame for efficiency
            if frame_count % 5 == 0:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                faces = self.face_detector.detect(frame_rgb)

                if faces[0] is not None:
                    for box in faces[0]:
                        face = self.emotion_analyzer._extract_face(frame_rgb, box)
                        if face is not None:
                            # Convert the face image to PIL Image format before passing to the emotion_classifier
                            face_pil = Image.fromarray(face)
                            emotion_pred = self.emotion_analyzer.emotion_classifier(face_pil)[0]
                            emotions.append({
                                "timestamp": frame_count / fps,
                                "emotion": emotion_pred["label"],
                                "confidence": emotion_pred["score"],
                                "box": box.tolist()
                            })

            frame_count += 1

        video.release()
        return emotions