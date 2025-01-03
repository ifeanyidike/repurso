
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
import librosa
from scipy.signal import find_peaks
from audio_analyzer import AudioAnalyzer
from emotion_analyzer import EmotionAnalyzer
import numpy as np

@dataclass
class HighlightSegment:
    start_time: float
    end_time: float
    score: float
    type: str
    metadata: dict

class HighlightDetector:
    def __init__(self):
        self.audio_analyzer = AudioAnalyzer()
        self.emotion_analyzer = EmotionAnalyzer()

    def detect_highlights(self, video_path: str) -> List[HighlightSegment]:
        """
        Detect potential highlight moments using multiple features

        Args:
            video_path: Path to video file

        Returns:
            List of HighlightSegment objects
        """
        # Extract audio
        y, sr = librosa.load(video_path)

        # Get various features
        speech_segments = self.audio_analyzer.detect_speech_segments(y, sr)
        music_segments = self.audio_analyzer.detect_music_segments(y, sr)

        # Analyze audio energy
        hop_length = 512
        energy = librosa.feature.rms(y=y, hop_length=hop_length)[0]
        peaks, _ = find_peaks(energy, height=np.mean(energy) * 1.5, distance=sr//2)

        highlights = []
        for peak in peaks:
            time = librosa.frames_to_time(peak, sr=sr, hop_length=hop_length)

            # Check if peak occurs during speech or music
            is_speech = any(s.start_time <= time <= s.end_time for s in speech_segments)
            is_music = any(s.start_time <= time <= s.end_time for s in music_segments)

            if is_speech or is_music:
                # Create highlight segment around peak
                highlight = HighlightSegment(
                    start_time=max(0, time - 1.5),  # 1.5 seconds before peak
                    end_time=time + 1.5,            # 1.5 seconds after peak
                    score=float(energy[peak] / np.max(energy)),
                    type="speech" if is_speech else "music",
                    metadata={
                        "energy_level": float(energy[peak]),
                        "has_speech": is_speech,
                        "has_music": is_music
                    }
                )
                highlights.append(highlight)

        return highlights