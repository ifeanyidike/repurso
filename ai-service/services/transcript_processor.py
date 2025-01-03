import os
# First, set up torch and torchvision properly
import torch
import torchvision
import torchvision.transforms as transforms  # This helps initialize torchvision properly

# Then import the rest of the dependencies
import whisperx
import requests
from typing import Dict
import torch.hub
from services import upload_utils

HF_TOKEN = os.getenv("HF_TOKEN")


class TranscriptionProcessor:
    def __init__(self, bucket: str):
        """
        Initialize the TranscriptionProcessor with required models and configurations.

        Args:
            hf_token (str): Hugging Face API token for authentication
        """
        # Ensure CUDA is properly initialized
        torch.cuda.empty_cache()

        self.hf_token = HF_TOKEN
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.upload_utils = upload_utils.UploadUtils(bucket_name=bucket)
        print(f"Using device: {self.device}")

        self.cache_dir = os.path.join(os.path.expanduser("~"), ".cache", "whisperx")
        os.makedirs(self.cache_dir, exist_ok=True)

        try:
            # Initialize WhisperX model with minimal options
            print("Loading WhisperX model...")
            self.model = whisperx.load_model(
                "large-v2",
                device=self.device,
                compute_type="float16" if self.device == "cuda" else "int8",
                language="en"
            )
            print("WhisperX model loaded successfully")

            # Load alignment model
            print("Loading alignment model...")
            self.alignment_model, self.metadata = whisperx.load_align_model(
                language_code="en",
                device=self.device
            )
            print("Alignment model loaded successfully")

        except Exception as e:
            print(f"Error during model initialization: {e}")
            raise

    def transcribe_audio(self, audio_path: str) -> Dict:
        """
        Transcribe audio with speaker diarization.

        Args:
            audio_path: Path to audio file

        Returns:
            Dictionary containing transcription results
        """
        try:
            print(f"Starting transcription for: {audio_path}")

            # Initial transcription
            result = self.model.transcribe(
                audio_path,
                batch_size=16 if self.device == "cuda" else 1
            )
            print("Initial transcription completed")

            # Align whisper output
            result = whisperx.align(
                result["segments"],
                self.alignment_model,
                self.metadata,
                audio_path,
                device=self.device
            )
            print("Alignment completed")

            # try:
            #     # Initialize diarization pipeline with auth token
            #     print("Starting diarization...")
            #     diarization_pipeline = whisperx.DiarizationPipeline(
            #         use_auth_token=self.hf_token,
            #         device=self.device
            #     )
            #     print("Diarization pipeline initialized")
            #     diarization = diarization_pipeline(audio_path)
            #     print("Diarization completed")

            #     # Assign speaker labels
            #     result = whisperx.assign_word_speakers(diarization, result)
            #     print("Speaker assignment completed")
            # except Exception as e:
            #     print(f"Warning: Diarization failed: {e}")
            #     print("Continuing with basic transcription results")

            transcript_url = self.upload_utils.upload_transcription_to_s3(result, audio_path)
            print("Transcript uploaded to S3", transcript_url)
            return {
                "transcript_url": transcript_url,
                "segments": result["segments"],
                "word_segments": result.get("word_segments", []),
                # "speakers": list(set(segment.get("speaker", "UNKNOWN")
                #                      for segment in result["segments"]))
            }

        except Exception as e:
            print(f"Transcription error: {e}")
            return {
                "segments": [],
                "word_segments": [],
                # "speakers": [],
                "error": str(e)
            }