import cv2
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
import numpy as np


@dataclass
class SceneDetector:
    def __init__(self):
        self.threshold = 30.0  # Base threshold
        self.min_scene_duration = 1.0  # Minimum scene duration in seconds
        self.window_size = 5  # Size of sliding window for smoothing

    def _smooth_differences(self, differences: List[float]) -> np.ndarray:
        """Smooth frame differences using moving average"""
        return np.convolve(differences, np.ones(self.window_size) / self.window_size, mode='valid')

    def _find_peaks(self, smooth_diffs: np.ndarray, min_distance: int) -> List[int]:
        """Find peaks in smoothed differences that are local maxima"""
        # Get indices of local maxima
        peaks = []
        for i in range(1, len(smooth_diffs) - 1):
            if (smooth_diffs[i] > smooth_diffs[i - 1] and
                    smooth_diffs[i] > smooth_diffs[i + 1] and
                    smooth_diffs[i] > self.threshold):
                peaks.append(i)

        # Filter peaks that are too close together
        filtered_peaks = []
        if peaks:
            filtered_peaks = [peaks[0]]
            for peak in peaks[1:]:
                if peak - filtered_peaks[-1] >= min_distance:
                    filtered_peaks.append(peak)

        return filtered_peaks

    def detect_scenes(self, video_path: str) -> List[Dict]:
        """
        Detect major scene changes in video using smoothed pixel differences

        Args:
            video_path: Path to video file

        Returns:
            List of dictionaries containing scene change timestamps
        """
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_differences = []
        prev_frame = None
        frame_count = 0

        # Collect all frame differences
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if prev_frame is not None:
                # Calculate mean absolute difference between frames
                diff = np.mean(np.abs(frame - prev_frame))
                frame_differences.append(diff)

            prev_frame = frame
            frame_count += 1

        cap.release()

        # Apply smoothing to reduce noise
        smoothed_diffs = self._smooth_differences(frame_differences)

        # Find peaks with minimum distance based on min_scene_duration
        min_distance = int(self.min_scene_duration * fps)
        peak_indices = self._find_peaks(smoothed_diffs, min_distance)

        # Convert peaks to scene information
        scenes = []
        for idx in peak_indices:
            # Add window_size//2 to compensate for smoothing offset
            actual_frame = idx + self.window_size // 2
            scenes.append({
                "timestamp": actual_frame / fps,
                "difference_score": float(smoothed_diffs[idx]),
                "original_score": float(frame_differences[actual_frame])
            })

        return scenes

    def visualize_differences(self, frame_differences: List[float], scenes: List[Dict]):
        """
        Visualize frame differences and detected scene changes
        Returns a dictionary with plot data
        """
        timestamps = np.arange(len(frame_differences)) / fps
        smoothed = self._smooth_differences(frame_differences)

        return {
            "timestamps": timestamps.tolist(),
            "original": frame_differences,
            "smoothed": smoothed.tolist(),
            "scenes": scenes
        }