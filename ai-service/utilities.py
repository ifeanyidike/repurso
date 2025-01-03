
import requests
import tempfile
import os
import boto3
from botocore.exceptions import NoCredentialsError
import torch
import re
import spacy
import whisper
import uuid
import json
from sentence_transformers import SentenceTransformer, util
from transformers import pipeline, AutoModelForSpeechSeq2Seq, AutoProcessor


aws_secret = os.getenv('AWS_SECRET_ACCESS_KEY')
aws_key = os.getenv('AWS_ACCESS_KEY_ID')
s3 = boto3.client('s3', aws_access_key_id = aws_key, aws_secret_access_key = aws_secret)

class Utility():
    """Utility class to contain implementation of helper functions"""

    # audio_model = "openai/whisper-medium"
    # emotion_model = "j-hartmann/emotion-english-distilroberta-base"
    # # humor_model = "microsoft/deberta-v3-small"
    # generic_model="facebook/bart-large-mnli"
    # humor_labels = ["funny", "serious", "sarcastic"]
    # zero_shot_labels = ["inspirational", "educational", "emotional", "motivational", "conflict", "calm", "suspense", "climax"]


    # def __init__(self):
        # self.emotion_classifier = pipeline("text-classification", model=self.emotion_model)
        # # self.humor_classifier = pipeline("text-classification", model=self.generic_model, tokenizer="microsoft/deberta-v3-small")
        # self.sentiment_classifier = pipeline("sentiment-analysis")
        # self.zero_shot_classifier = pipeline("zero-shot-classification", model=self.generic_model)
        # Sentence embeddings for similarity (e.g., for quotes, cultural references)
        # self.sentence_encoder = SentenceTransformer("all-MiniLM-L6-v2")
        # # Load spaCy for question and entity detection
        # self.nlp = spacy.load("en_core_web_sm")



    def get_file_from_s3(self, url, filename):
        """download file from s3"""
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            with open(filename, 'wb') as f:
                f.write(response.content)
                print(f"Downloaded {filename}")
            return filename
        
    def stream_audio_from_s3(self, bucket_name, file_key) -> tempfile._TemporaryFileWrapper:
        """streaming audio from s3 instead of downloading it"""
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
                s3.download_fileobj(bucket_name, file_key, temp_file)
                temp_audio_path = temp_file
            print(f"streaming audio file to: {temp_audio_path}")
            return temp_audio_path
        except Exception as e:
            print(f"Error streaming audio from S3: {e}")
            raise

    def upload_to_s3(self, file_path, bucket, key) -> None:
        """
        Upload a file to S3.
        :param file_path: Local path of the file to upload
        :param bucket: S3 bucket name
        :param key: S3 key (path in the bucket)
        """
        try:
            s3.upload_file(file_path, bucket, key)
            print(f"File uploaded successfully to s3://{bucket}/{key}")
        except NoCredentialsError:
            print("No AWS credentials found.")
            raise
        except Exception as e:
            print(f"Error uploading file to S3: {str(e)}")
            raise
    
    def generate_transcript(self, audioUrl, bucket):
        """
            Transcribes audio to text and extracts word-level timestamps using OpenAI Whisper.
            Args:
                audio_file (str): Path to the audio file.
            Returns:
                List[Dict]: Transcription with word-level timestamps.
        """
        model = whisper.load_model("medium", device="cuda" if torch.cuda.is_available() else "cpu")
        
        # TODO: Transcription with word-level timestamps
        result = model.transcribe(audioUrl, word_timestamps=True)
        print("Transcription completed.")

        unique_id = str(uuid.uuid4())
        transcript_file = f"transcript_{unique_id}.json"

        with open(transcript_file, "w") as f:
            json.dump(result["segments"], f, indent=4)
        print(f"Transcript saved locally as {transcript_file}")

        s3_key = f"transcripts/{audioUrl.split('/')[-1].replace('.mp3', '.json')}"

        try:
            self.upload_to_s3(transcript_file, bucket, s3_key)
            s3_url = f"https://{bucket}.s3.amazonaws.com/{s3_key}"
            print(f"Transcript available at: {s3_url}")
            return s3_url
        finally:
            # Clean up: Delete local files
            if os.path.exists(transcript_file):
                os.remove(transcript_file)
                print(f"Deleted local transcript file: {transcript_file}")
        return result["segments"]


    def generate_subtitles_direct(self, audio_path):
        """Implementation to generate subtitles"""
        audio_model = "openai/whisper-medium"
        speech_model = AutoModelForSpeechSeq2Seq.from_pretrained(
            audio_model,
            torch_dtype=torch.float16,
            low_cpu_mem_usage=True,
            use_safetensors=True
        )
        
        if torch.cuda.is_available():
            speech_model.to("cuda")
        processor = AutoProcessor.from_pretrained(audio_model)
        
        pipe = pipeline(
            task="automatic-speech-recognition",
            model=speech_model,
            tokenizer=processor.tokenizer,
            feature_extractor=processor.feature_extractor,
            torch_dtype=torch.float16,
            return_timestamps=True,
            chunk_length_s=30,
            device="cuda" if torch.cuda.is_available() else "cpu",
        )

        # process audio and generate timestamps
        results = pipe(audio_path)
        subtitles = []
        subtitle_texts = ""

        if "chunks" in results:
            for i, segment in enumerate(results["chunks"]):
                start_time = self.format_timestamps(segment["timestamp"][0])
                end_time = self.format_timestamps(segment["timestamp"][1])
                text = segment["text"].strip()
                subtitle_text = f"{i + 1}\n{start_time} --> {end_time}\n{text}\n"
                subtitles.append(subtitle_text)
                subtitle_texts += subtitle_text

            print(f"subtitle array: {subtitles}")
            return subtitle_texts
            # Save to file
            # subtitle_file = f"{os.path.splitext(audio_path)[0]}.srt"
            # with open(subtitle_file, 'w') as f:
            #     f.writelines(subtitles)

            # print(f"Subtitles saved to {subtitle_file}")
        else:
            print("No chunks found in the pipeline result.")

    
        
    def format_timestamps(self, seconds):
        """Format seconds to HH:MM:SS,MS"""
        ms = int(seconds * 1000)
        hrs, ms = divmod(ms, 3600000)
        mins, ms = divmod(ms, 60000)
        secs, ms = divmod(ms, 1000)
        return f"{hrs:02}:{mins:02}:{secs:02},{ms:03}"
    
    def parse_srt_timestamp(self, timestamp):
        def to_seconds(h, m, s, ms):
            return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000

        # Split into start and end parts
        start_str, end_str = timestamp.split(" --> ")

        # Parse hours, minutes, seconds, and milliseconds for each part
        start_parts = start_str.replace(",", ":").split(":")
        end_parts = end_str.replace(",", ":").split(":")

        # Convert to seconds
        start_time = to_seconds(*start_parts)
        end_time = to_seconds(*end_parts)

        return start_time, end_time
    
    def convert_srt_to_transcript(self, subtitle_text):
        subtitle_pattern = r'(\d+)\n([\d:,]+ --> [\d:,]+)\n(.+?)(?=\n\d+\n|$)'
        matches = re.findall(subtitle_pattern, subtitle_text, re.DOTALL)
        subtitles = []
        for match in matches:
            index = int(match[0])
            timestamp = match[1]
            text = match[2].replace("\n", " ").strip()
            start_time, end_time = self.parse_srt_timestamp(timestamp)
            subtitles.append({"index": index, "start_time": start_time, "end_time":end_time, "text": text})
        return subtitles
    

    def parse_srt_timestamp(self, timestamp):
        def to_seconds(h, m, s, ms):
            return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000

        # Split into start and end parts
        start_str, end_str = timestamp.split(" --> ")

        # Parse hours, minutes, seconds, and milliseconds for each part
        start_parts = start_str.replace(",", ":").split(":")
        end_parts = end_str.replace(",", ":").split(":")

        # Convert to seconds
        start_time = to_seconds(*start_parts)
        end_time = to_seconds(*end_parts)

        return start_time, end_time

    def process_srt_from_s3(self, bucket_name, s3_key):
        s3_object = s3.get_object(Bucket=bucket_name, Key=s3_key)
        srt_content = s3_object["Body"].read().decode("utf-8")
        transcript = self.convert_srt_to_transcript(srt_content)
        return transcript
    
   
        

