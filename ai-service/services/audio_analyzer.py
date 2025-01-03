import requests
import librosa
import soundfile as sf
import numpy as np
from io import BytesIO
import matplotlib.pyplot as plt


def load_audio_from_url(audio_url: str, target_sr: int = 22050):
    """
    Loads audio from a remote URL and processes it for use with Librosa.

    Parameters:
        audio_url (str): The URL of the audio file.
        target_sr (int): Target sampling rate for the audio. Defaults to 22050.

    Returns:
        tuple: A tuple containing the audio time series (`y`) and sampling rate (`sr`).
    """
    try:
        # Fetch audio data from the URL
        response = requests.get(audio_url)
        response.raise_for_status()  # Raise an error for failed requests

        # Create a file-like object from the response content
        audio_data = BytesIO(response.content)

        # Read audio using soundfile
        y, sr = sf.read(audio_data, always_2d=False)

        # Convert to mono if audio has multiple channels
        if y.ndim > 1:
            y = np.mean(y, axis=1)

        # Resample to the target sampling rate if necessary
        if sr != target_sr:
            y = librosa.resample(y, orig_sr=sr, target_sr=target_sr)
            sr = target_sr

        return y, sr

    except Exception as e:
        print(f"Error loading audio from URL: {e}")
        return None, None


@dataclass
class AudioSegment:
    start_time: float
    end_time: float
    type: str
    confidence: float
    metadata: dict


class AudioAnalyzer:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.speech_model = pipeline("audio-classification",
                                     model="facebook/wav2vec2-base-960h",
                                     device=0 if self.device == "cuda" else -1)

    def detect_speech_segments(self, y: np.ndarray, sr: int) -> List[AudioSegment]:
        frame_length = int(sr * 0.025)  # 25ms frames
        hop_length = int(sr * 0.010)  # 10ms hop

        # Calculate energy
        energy = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]

        # Debugging energy values
        print(f"Energy values: {energy[:10]}")  # Print first 10 energy values for debugging

        # Find segments with significant energy
        threshold = np.mean(energy) * 0.5 + 0.01  # Adjusted threshold
        peaks, _ = find_peaks(energy, height=threshold, distance=sr // 4)

        print(f"Threshold: {threshold}")
        print(f"Detected peaks: {peaks}")

        segments = []
        current_segment = None

        for i, peak in enumerate(peaks):
            time = librosa.frames_to_time(peak, sr=sr, hop_length=hop_length)

            if current_segment is None:
                current_segment = {"start": time}
            elif time - librosa.frames_to_time(peaks[i - 1], sr=sr, hop_length=hop_length) > 0.3:
                current_segment["end"] = time - 0.15

                segment_samples = self._get_audio_segment(y, sr, current_segment["start"], current_segment["end"])
                if segment_samples is not None:
                    if self._verify_speech_segment(segment_samples, sr):
                        segments.append(AudioSegment(
                            start_time=current_segment["start"],
                            end_time=current_segment["end"],
                            type="speech",
                            confidence=0.85,
                            metadata={}
                        ))
                current_segment = {"start": time}

        # Handle last segment
        if current_segment is not None:
            current_segment["end"] = librosa.get_duration(y=y, sr=sr)
            segment_samples = self._get_audio_segment(y, sr, current_segment["start"], current_segment["end"])
            if segment_samples is not None and self._verify_speech_segment(segment_samples, sr):
                segments.append(AudioSegment(
                    start_time=current_segment["start"],
                    end_time=current_segment["end"],
                    type="speech",
                    confidence=0.85,
                    metadata={}
                ))

        print(f"Speech segments detected: {segments}")
        return segments

    # def detect_speech_segments(self, y: np.ndarray, sr: int) -> List[AudioSegment]:
    #     """
    #     Detect speech segments in audio using energy-based detection and ML verification

    #     Args:
    #         y: Audio signal
    #         sr: Sample rate

    #     Returns:
    #         List of AudioSegment objects containing speech segments
    #     """
    #     # 1. Energy-based pre-filtering
    #     frame_length = int(sr * 0.025)  # 25ms frames
    #     hop_length = int(sr * 0.010)    # 10ms hop

    #     # Calculate energy
    #     energy = librosa.feature.rms(y=y, frame_length=frame_length,
    #                                hop_length=hop_length)[0]
    #     print("energy", energy)

    #     # Find segments with significant energy
    #     threshold = np.mean(energy) * 0.5
    #     print("threshold", threshold)
    #     peaks, _ = find_peaks(energy, height=threshold, distance=sr//2)
    #     print("peaks", peaks)

    #     # Convert peaks to time segments
    #     segments = []
    #     current_segment = None

    #     for i, peak in enumerate(peaks):
    #         time = librosa.frames_to_time(peak, sr=sr, hop_length=hop_length)

    #         if current_segment is None:
    #             current_segment = {"start": time}
    #         elif time - librosa.frames_to_time(peaks[i-1], sr=sr,
    #                                          hop_length=hop_length) > 0.3:
    #             current_segment["end"] = time - 0.15

    #             # Verify segment using ML model
    #             segment_samples = self._get_audio_segment(y, sr,
    #                                                     current_segment["start"],
    #                                                     current_segment["end"])
    #             if segment_samples is not None:
    #                 if self._verify_speech_segment(segment_samples, sr):
    #                     segments.append(AudioSegment(
    #                         start_time=current_segment["start"],
    #                         end_time=current_segment["end"],
    #                         type="speech",
    #                         confidence=0.85,  # ML model confidence
    #                         metadata={}
    #                     ))
    #             current_segment = {"start": time}

    #     # Handle last segment
    #     if current_segment is not None:
    #         current_segment["end"] = librosa.get_duration(y=y, sr=sr)
    #         segment_samples = self._get_audio_segment(y, sr,
    #                                                 current_segment["start"],
    #                                                 current_segment["end"])
    #         if segment_samples is not None and self._verify_speech_segment(segment_samples, sr):
    #             segments.append(AudioSegment(
    #                 start_time=current_segment["start"],
    #                 end_time=current_segment["end"],
    #                 type="speech",
    #                 confidence=0.85,
    #                 metadata={}
    #             ))
    #     plt.plot(energy)
    #     plt.axhline(y=threshold, color='r', linestyle='--')
    #     plt.show()

    #     return segments

    def _get_audio_segment(self, y: np.ndarray, sr: int, start_time: float,
                           end_time: float) -> Optional[np.ndarray]:
        """
        Get a segment of audio as a numpy array

        Args:
            y: Audio signal
            sr: Sample rate
            start_time: Start time of the segment in seconds
            end_time: End time of the segment in seconds

        Returns:
            Numpy array containing the audio segment, or None if segment is invalid
        """
        start_sample = int(start_time * sr)
        end_sample = int(end_time * sr)

        if start_sample >= len(y) or end_sample > len(y) or start_sample >= end_sample:
            return None

        return y[start_sample:end_sample]

    def _verify_speech_segment(self, audio_segment: np.ndarray, sr: int) -> bool:
        """Verify if segment contains speech using ML model"""
        # Convert to tensor
        waveform = torch.from_numpy(audio_segment).float()

        # Resample if necessary (wav2vec2 expects 16kHz)
        if sr != 16000:
            resampler = torchaudio.transforms.Resample(sr, 16000)
            waveform = resampler(waveform)

        # Get prediction
        # Pass the waveform and sampling rate in the expected format
        with torch.no_grad():
            # Convert the tensor back to a NumPy array
            waveform_np = waveform.numpy()
            result = self.speech_model({"raw": waveform_np, "sampling_rate": 16000})

        # Check if speech probability is high enough
        return any(pred["label"] == "speech" and pred["score"] > 0.6
                   for pred in result)

    def detect_music_segments(self, y: np.ndarray, sr: int) -> List[AudioSegment]:
        """
        Detect music segments using spectral features

        Args:
            y: Audio signal
            sr: Sample rate

        Returns:
            List of AudioSegment objects containing music segments
        """
        # Calculate features
        frame_length = 2048
        hop_length = 512

        # Spectral features
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr,
                                                            hop_length=hop_length)
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr,
                                                              hop_length=hop_length)
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr,
                                                                hop_length=hop_length)

        # Rhythmic features
        onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_length)
        tempo, beats = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr,
                                               hop_length=hop_length)

        # Combine features for music detection
        music_likelihood = np.zeros_like(onset_env)

        # High spectral rolloff and consistent rhythm indicate music
        for i in range(len(music_likelihood)):
            rhythm_score = 0
            if i > 0:
                rhythm_score = abs(onset_env[i] - onset_env[i - 1])

            music_likelihood[i] = (
                    (spectral_rolloff[0][i] > np.mean(spectral_rolloff) * 1.2) * 0.4 +
                    (spectral_centroid[0][i] > np.mean(spectral_centroid) * 1.1) * 0.3 +
                    (rhythm_score < np.mean(onset_env) * 0.5) * 0.3
            )

        # Find continuous segments of music
        segments = []
        in_music = False
        start_time = 0

        for i, likelihood in enumerate(music_likelihood):
            time = librosa.frames_to_time(i, sr=sr, hop_length=hop_length)

            if likelihood > 0.6 and not in_music:
                start_time = time
                in_music = True
            elif likelihood <= 0.6 and in_music:
                if time - start_time > 1.0:  # Minimum 1 second segments
                    segments.append(AudioSegment(
                        start_time=start_time,
                        end_time=time,
                        type="music",
                        confidence=np.mean(music_likelihood[
                                           librosa.time_to_frames(start_time, sr=sr,
                                                                  hop_length=hop_length):
                                           librosa.time_to_frames(time, sr=sr,
                                                                  hop_length=hop_length)
                                           ]),
                        metadata={
                            "tempo": tempo,
                            "spectral_centroid": float(np.mean(spectral_centroid)),
                            "spectral_bandwidth": float(np.mean(spectral_bandwidth))
                        }
                    ))
                in_music = False

        # plt.figure()
        # plt.plot(librosa.times_like(spectral_rolloff[0], sr=sr, hop_length=hop_length), spectral_rolloff[0])
        # plt.axhline(y=np.mean(spectral_rolloff) * 1.2, color='r', linestyle='--')
        # plt.show()

        return segments