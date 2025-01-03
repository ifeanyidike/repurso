import boto3
from botocore.exceptions import NoCredentialsError
import os

aws_secret = os.getenv('AWS_SECRET')
aws_key = os.getenv('AWS_KEY')

bucket_name = "repurposerapp-bucket"
video_file_name = "output.mp4"
transcript_file_name = "transcribed"

s3 = boto3.client('s3', aws_access_key_id = aws_key, aws_secret_access_key = aws_secret)
def upload_to_s3(file_name, bucket, object_name=None):
    try:
        if object_name is None:
            object_name = file_name

        response = s3.upload_file(file_name, bucket, object_name)
        print(response)
        print(f"File {file_name} uploaded to {bucket}")

    except FileNotFoundError:
        print(f"The file {file_name} does not exist.")
        return None
    except NoCredentialsError:
        print("Credentials not available.")
        return None
    

transcribe = boto3.client('transcribe', aws_access_key_id = aws_key, aws_secret_access_key = aws_secret)
    
def start_transcription_job(job_name, s3_uri, language_code='en-US'):
    return transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={'MediaFileUri': s3_uri},
        MediaFormat='mp3',
        LanguageCode=language_code,
        OutputBucketName=bucket_name,
        OutputKey=transcript_file_name,
        Subtitles={'Formats': ['srt']}
    )


def upload_and_transcribe():
    s3_uri = upload_to_s3(video_file_name, bucket_name)
    print("file", s3_uri)
    transcription_job = start_transcription_job("output_file_job", f's3://{bucket_name}/{video_file_name}')
    while True:
        job = transcribe.get_transcription_job(TranscriptionJobName=transcription_job['TranscriptionJob']['TranscriptionJobName'])
        if job['TranscriptionJob']['TranscriptionJobStatus'] in ['COMPLETED', 'FAILED']:
            break
    return {"status": job['TranscriptionJob']['TranscriptionJobStatus'], "uri": job['TranscriptionJob']['Transcript']['TranscriptFileUri']}

# def get_transcription_results(job_arn):
#     response = transcribe.get_transcription_job(TranscriptionJobArn=job_arn)
#     return response['TranscriptionJob']['Transcript']['TranscriptFileUri']

# def download_transcription_results(job_arn, file_name):
#     transcript_file_uri = get_transcription_results(job_arn)
#     s3.download_file(bucket_name, transcript_file_uri, file_name)
#     print(f"Transcription results downloaded to {file_name}")

def get_transcription_job_status(job_name):
    response = transcribe.get_transcription_job(TranscriptionJobName=job_name)
    return response['TranscriptionJob']['TranscriptionJobStatus']

def download_transcript(bucket = bucket_name):
    s3.download_file(bucket, f"{transcript_file_name}.srt", f"{transcript_file_name}_transcription.srt")
    print(f"Transcription results downloaded to {transcript_file_name}_transcription.srt")




    #  def detect_emotional_moments(self, entry):
    #     """Detect emotional moments."""
    #     # Initialize the emotion classifier
    #     emotion_classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", return_all_scores=True)
    
    #     # Extract text from the entry
    #     text = entry["text"]
    
    #     # Run the classifier and get results
    #     emotion_results = emotion_classifier(text)  # Returns a list of lists
    
    #     # Ensure we are working with the first result in the list
    #     if len(emotion_results) > 0:
    #         top_emotion = max(emotion_results[0], key=lambda x: x["score"])  # Find emotion with the highest score
        
    #         # Only return if the top emotion's score is above 0.8
    #         if top_emotion["score"] > 0.7:
    #             return {
    #                 "text": text,
    #                 "start_time": entry["start_time"],
    #                 "end_time": entry["end_time"],
    #                 "emotion": top_emotion["label"],
    #                 "confidence": top_emotion["score"],
    #             }
    
    #     # Return None if no high-confidence emotion is found
    #     return None

    # def detect_entertaining_moments(self, entry):
    #     """Detect humorous or entertaining moments."""
    #     text = entry["text"]
    #     humor_model = "microsoft/deberta-v3-small"
    #     humor_labels = ["funny", "serious", "sarcastic"]
    #     humor_classifier = pipeline("text-classification", model=humor_model, tokenizer="microsoft/deberta-v3-small")
    #     humor_result = humor_classifier(text, candidate_labels=humor_labels)
    #     humor_label = humor_result["labels"][0]
    #     humor_score = humor_result["scores"][0]
    #     if humor_label == "funny" and humor_score > 0.7:
    #         return {
    #             "text": text,
    #             "start_time": entry["start_time"],
    #             "end_time": entry["end_time"],
    #             "humor_type": humor_label,
    #             "confidence": humor_score,
    #         }
    #     return None

    # # def detect_entertaining_moments(self, entry):
    # #     """Detect humorous or entertaining moments."""
    # #     text = entry["text"]
    
    # #     # Ensure candidate_labels are defined
    # #     if not hasattr(self, "humor_labels"):
    # #         self.humor_labels = ["funny", "serious"]
    
    # #     # Classify the text
    # #     humor_result = self.humor_classifier(text, candidate_labels=self.humor_labels)
    
    # #     # Extract the top label and its score
    # #     humor_label = humor_result["labels"][0]
    # #     humor_score = humor_result["scores"][0]
    
    # #     # Check if the top label is "funny" with sufficient confidence
    # #     if humor_label == "funny" and humor_score > 0.7:
    # #         return {
    # #             "text": text,
    # #             "start_time": entry["start_time"],
    # #             "end_time": entry["end_time"],
    # #             "humor_type": humor_label,
    # #             "confidence": humor_score,
    # #         }
    
    # #     return None


    # # def detect_thematic_moments(self, entry):
    # #     """Detect moments based on thematic labels."""
    # #     text = entry["text"]
    # #     zero_shot_result = self.zero_shot_classifier(text, candidate_labels=self.zero_shot_labels)
    # #     thematic_moments = []
    # #     for label, score in zip(zero_shot_result["labels"], zero_shot_result["scores"]):
    # #         if score > 0.7:
    # #             thematic_moments.append({
    # #                 "text": text,
    # #                 "start_time": entry["start_time"],
    # #                 "end_time": entry["end_time"],
    # #                 "label": label,
    # #                 "confidence": score,
    # #             })
    # #     return thematic_moments

    # # def detect_questions(self, entry):
    # #     """Detect questions in the transcript."""
    # #     text = entry["text"]
    # #     doc = self.nlp(text)
    # #     if any(token.tag_ == "WP" for token in doc):  # Question words like what, why, how
    # #         return {
    # #             "text": text,
    # #             "start_time": entry["start_time"],
    # #             "end_time": entry["end_time"],
    # #         }
    # #     return None

    # # def detect_inspirational_moments(self, entry, inspirational_references):
    # #     """Detect inspirational moments using sentence similarity."""
    # #     text = entry["text"]
    # #     embeddings1 = self.sentence_encoder.encode(inspirational_references, convert_to_tensor=True)
    # #     embeddings2 = self.sentence_encoder.encode(text, convert_to_tensor=True)
    # #     cosine_similarities = util.cos_sim(embeddings1, embeddings2)
    # #     if max(cosine_similarities) > 0.8:
    # #         return {
    # #             "text": text,
    # #             "start_time": entry["start_time"],
    # #             "end_time": entry["end_time"],
    # #             "similarity": max(cosine_similarities).item(),
    # #         }
    # #     return None

    # def detect_quotes(self, entry):
    #     """Detect quotes in the text."""
    #     text = entry["text"]
    #     if len(text) < 100 and text[0] == '"' and text[-1] == '"':
    #         return {
    #             "text": text,
    #             "start_time": entry["start_time"],
    #             "end_time": entry["end_time"],
    #         }
    #     return None
    
    # def detect_key_moments(self, transcript, types):
    #     """Main function to detect all key moments."""
    #     key_moments = {
    #         "emotional": [],
    #         "entertaining": [],
    #         "inspirational": [],
    #         "questions": [],
    #         "quotes": [],
    #         "thematic": [],
    #     }

    #     inspirational_references = ["You can do it!", "Never give up!", "Believe in yourself!"]

    #     for entry in transcript:
    #         # Detect emotional moments
    #         if not len(types) or "emotional" in types or "all" in types:
    #             emotional_moment = self.detect_emotional_moments(entry)
    #             if emotional_moment:
    #                 key_moments["emotional"].append(emotional_moment)

    #         # Detect entertaining moments
    #         # if not len(types) or "entertaining" in types or "all" in types:
    #         #     entertaining_moment = self.detect_entertaining_moments(entry)
    #         #     if entertaining_moment:
    #         #         key_moments["entertaining"].append(entertaining_moment)

    #         # # Detect thematic moments
    #         # if not len(types) or "thematic" in types or "all" in types:
    #         #     thematic_moments = self.detect_thematic_moments(entry)
    #         #     if thematic_moments:
    #         #         key_moments["thematic"].extend(thematic_moments)

    #         # # Detect questions
    #         # if not len(types) or "questions" in types or "all" in types:
    #         #     question_moment = self.detect_questions(entry)
    #         #     if question_moment:
    #         #         key_moments["questions"].append(question_moment)

    #         # # Detect inspirational moments
    #         # if not len(types) or "inspirational" in types or "all" in types:
    #         #     inspirational_moment = self.detect_inspirational_moments(entry, inspirational_references)
    #         #     if inspirational_moment:
    #         #         key_moments["inspirational"].append(inspirational_moment)

    #         # # Detect quotes
    #         # if not len(types) or "quotes" in types or "all" in types:
    #         #     quote_moment = self.detect_quotes(entry)
    #         #     if quote_moment:
    #         #         key_moments["quotes"].append(quote_moment)

    #     return key_moments