import numpy as np
import librosa
import requests
import logging
import json
from typing import List, Dict
from dataclasses import dataclass
import io

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AudioSegment:
    start: float
    end: float
    confidence: float

class SilenceDetector:
    def __init__(
        self,
        silence_threshold: float = -30.0, 
        min_silence_duration: float = 0.3, 
        padding: float = 0.1,
        sample_rate: int = 16000
    ):
        self.silence_threshold = silence_threshold
        self.min_silence_duration = min_silence_duration
        self.padding = padding
        self.sample_rate = sample_rate

    def _get_audio_data(self, url: str) -> np.ndarray:
        logger.info(f"Downloading audio from {url}")
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        audio_data = io.BytesIO(response.content)
        y, sr = librosa.load(audio_data, sr=self.sample_rate, mono=True)
        logger.info(f"Audio data loaded successfully. Duration: {len(y)/sr:.2f} seconds")
        return y


    def _detect_segments(self, audio: np.ndarray) -> List[AudioSegment]:
        logger.info("Detecting segments...")
    
        # Convert to dB
        audio_db = 20 * np.log10(np.abs(audio) + 1e-6)  # Convert normalized audio to dB
    
        # Log audio statistics
        logger.info(f"Audio statistics:")
        logger.info(f"Max dB: {np.max(audio_db):.2f}")
        logger.info(f"Min dB: {np.min(audio_db):.2f}")
        logger.info(f"Mean dB: {np.mean(audio_db):.2f}")
        logger.info(f"Threshold dB: {self.silence_threshold}")
    
        # Find points below threshold (silence)
        silence_mask = audio_db < self.silence_threshold
        logger.debug(f"Silence mask sample: {silence_mask[:100]}")
    
        # Find silent regions
        silent_regions = []
        start_idx = None
    
        for i in range(len(silence_mask)):
            if silence_mask[i] and start_idx is None:
                start_idx = i
            elif (not silence_mask[i] or i == len(silence_mask) - 1) and start_idx is not None:
                end_idx = i
                duration = (end_idx - start_idx) / self.sample_rate
                if duration >= self.min_silence_duration:
                    silent_regions.append((start_idx, end_idx))
                    logger.debug(f"Silent region: Start index {start_idx}, End index {end_idx}, Duration: {duration:.2f}s")
                start_idx = None
    
        logger.info(f"Found {len(silent_regions)} silent regions")
    
        # Convert silent regions to speech segments
        segments = []
        last_end = 0
        audio_length = len(audio)
    
        for start_idx, end_idx in silent_regions:
            if start_idx > last_end:
                # There's speech between last_end and start_idx
                speech_start = max(0, last_end / self.sample_rate - self.padding)
                speech_end = min(audio_length / self.sample_rate, 
                               start_idx / self.sample_rate + self.padding)
            
                # Calculate average amplitude for confidence
                segment_db = audio_db[last_end:start_idx]
                confidence = float(np.mean(segment_db > self.silence_threshold))
            
                segments.append(AudioSegment(
                    start=speech_start,
                    end=speech_end,
                    confidence=confidence
                ))
            last_end = end_idx
    
        # Add final segment if needed
        if last_end < audio_length:
            segments.append(AudioSegment(
                start=last_end / self.sample_rate - self.padding,
                end=audio_length / self.sample_rate,
                confidence=float(np.mean(audio_db[last_end:] > self.silence_threshold))
            ))
    
        logger.info(f"Extracted {len(segments)} speech segments")
        return segments

    def _merge_segments(self, segments: List[AudioSegment], 
                       max_gap: float = 0.3) -> List[AudioSegment]:
        if not segments:
            return []
        
        merged = []
        current = segments[0]
        
        for next_seg in segments[1:]:
            if next_seg.start - current.end <= max_gap:
                current.end = next_seg.end
                current.confidence = max(current.confidence, next_seg.confidence)
            else:
                merged.append(current)
                current = next_seg
        
        merged.append(current)
        logger.info(f"Merged into {len(merged)} segments")
        return merged

    def detect_speech_segments(self, audio_url: str) -> List[Dict[str, float]]:
        try:
            # Get audio data
            audio = self._get_audio_data(audio_url)
            
            # Detect segments
            segments = self._detect_segments(audio)
            
            # Merge close segments
            segments = self._merge_segments(segments)  # Fixed the method name here
            
            # Convert to dict format
            result = [
                {
                    "start": segment.start,
                    "end": segment.end,
                    "confidence": segment.confidence
                }
                for segment in segments
            ]
            
            logger.info(f"Final result: {len(result)} segments")
            for i, seg in enumerate(result):
                logger.info(f"Segment {i+1}: {seg['start']:.2f}s - {seg['end']:.2f}s (conf: {seg['confidence']:.2f})")
            
            return result
            
        except Exception as e:
            logger.error(f"Error in detect_speech_segments: {e}")
            raise