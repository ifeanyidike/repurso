import os
import boto3
from botocore.exceptions import NoCredentialsError
import uuid
import json
from dataclasses import dataclass
import requests

@dataclass
class UploadUtils():
    def __init__(self, bucket_name):
        self.bucket_name = bucket_name
        self.s3 = boto3.client('s3', 
                               aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID'), 
                               aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
                               )
        
    def _save_transcription_to_temp_file(self, transcription) -> str:
        """
        Takes in the transcription returns the temporary file path

        Args:
            - transcription:
                - segments:
                - word_segments:
                - speakers:
        Returns:
            - str
        """

        uniq_id = str(uuid.uuid4())
        transcript_file = f"transcript_{uniq_id}.json"

        with open(transcript_file, "w") as f:
            json.dump(transcription, f, indent=4)
        return transcript_file
            

    def upload_transcription_to_s3(self, transcription, media_url):
        """
            Upload a file to S3.
            :param file_path: Local path of the file to upload
            :param bucket: S3 bucket name
            :param key: S3 key (path in the bucket)
        """

        transcript_file = self._save_transcription_to_temp_file(transcription)
            
        key = f"transcripts/{media_url.split('/')[-1].replace('.mp3', '.json')}"

        try:
            self.s3.upload_file(transcript_file, self.bucket_name, key)
            s3_url = f"https://{self.bucket_name}.s3.amazonaws.com/{key}"
            print(f"Transcript available at: {s3_url}")
            return s3_url
        finally:
            if os.path.exists(transcript_file):
                os.remove(transcript_file)
                print("Deleted local file", transcript_file)


    def parse_s3_url(self, s3_url: str) -> tuple[str, str]:
        """
            Parse an S3 URL into bucket name and key.
        """
        assert s3_url.startswith("s3://"), "URL must start with 's3://'"
        parts = s3_url[5:].split("/", 1)
        return parts[0], parts[1]

    def fetch_object_from_s3(self, url:str, use_boto: bool = False):
        """
            Fetch the transcript from an S3 URL.
            If use_boto is True, use boto3; otherwise, use requests for public URLs.
        """
        if use_boto:
            # parse s3 url
            bucket_name, key = self.parse_s3_url(url)

            # download object
            obj = self.s3.get_object(Bucket=bucket_name, Key=key)
            return json.load(obj["Body"])
        else:
            # use request for public URLs
            response = requests.get(url)
            response.raise_for_status()
            return response.json()