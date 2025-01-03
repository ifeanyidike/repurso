
# from typing import Union
# from fastapi import FastAPI, File, UploadFile
# from fastapi.responses import JSONResponse
# from openai import OpenAI
# from docx import Document
# from deepface import DeepFace
# import shutil
# import os, glob, pickle
# from pydub import AudioSegment
# from pyAudioAnalysis import ShortTermFeatures as aF
# from scipy.io import wavfile
# import numpy as np
# import librosa
# from sklearn.metrics import accuracy_score
# from sklearn.neural_network import MLPClassifier
# from sklearn.model_selection import train_test_split
# import soundfile
# import sys
# import json
# from transcribe import upload_and_transcribe, download_transcript
# from httpx import AsyncClient, Timeout


# sys.set_int_max_str_digits(50000)
# openaiAPIKey = os.getenv('OPENAI_API_KEY')

# openaiClient = OpenAI(api_key=openaiAPIKey)


# ass_header = """[Script Info]
# Title: Video Subtitles
# ScriptType: v4.00+
# PlayDepth: 0

# [V4+ Styles]
# Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
# Style: Default,Open Sans,28,&H00FFFFFF,&H00000000,-1,0,1,1,0,2,10,10,10,1

# [Events]
# Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
# """

# #DataFlair - Emotions in the RAVDESS dataset
# emotions={
#   '01':'neutral',
#   '02':'calm',
#   '03':'happy',
#   '04':'sad',
#   '05':'angry',
#   '06':'fearful',
#   '07':'disgust',
#   '08':'surprised'
# }

# #DataFlair - Emotions to observe
# observed_emotions=['calm', 'happy', 'fearful', 'disgust']

# @app.get("/")
# def read_root():
#     return {"message": "Hello, World!"}

# @app.get("/items/{item_id}")
# def read_item(item_id: int, q: Union[str, None] = None):
#     return {"item_id": item_id, "q": q}

# @app.get("/detect-emotion/")
# def detect_emotion(image_name: str):
#     try:
#         # Assuming the image is in the current directory
#         image_path = os.path.join(os.getcwd(), image_name)

#         # Check if the image exists
#         if not os.path.exists(image_path):
#             return JSONResponse(status_code=404, content={"error": "Image not found"})

#         # Run DeepFace emotion detection
#         analysis = DeepFace.analyze(image_path, actions=['emotion'], enforce_detection=False)

#         # DeepFace.analyze returns a list, access the first item
#         analysis_result = analysis[0]  # Accessing the first dictionary in the list

#         # Get the dominant emotion
#         dominant_emotion = analysis_result['dominant_emotion']

#         return {"dominant_emotion": dominant_emotion, "details": analysis_result['emotion']}

#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})
    
# @app.post("/detect-voice-emotion/")
# async def detect_voice_emotion(file: UploadFile = File(...)):
#     try:
#         # Save the uploaded MP3 file temporarily
#         temp_file = f"temp_{file.filename}"
#         with open(temp_file, "wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)
        
#         # Convert the MP3 file to WAV format using pydub
#         audio = AudioSegment.from_mp3(temp_file)
#         wav_file = temp_file.replace(".mp3", ".wav")
#         audio.export(wav_file, format="wav")
        
#         # Load the WAV file with librosa
#         signal, sampling_rate = librosa.load(wav_file, sr=None)
        
#         # Extract features using librosa (e.g., MFCCs)
#         mfccs = librosa.feature.mfcc(y=signal, sr=sampling_rate, n_mfcc=13)
        
#         # Clean up: remove the temporary files after detection
#         os.remove(temp_file)
#         os.remove(wav_file)
#         print( mfccs.shape, mfccs.size)

#         return {"features": ""}

#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})
    
# def extract_audio_features(file_name, mfcc, chroma, mel):
#     with soundfile.SoundFile(file_name) as sound_file:
#         X = sound_file.read(dtype="float32")
#         sample_rate = sound_file.samplerate
#         if chroma:
#             stft = np.abs(librosa.stft(X))
#         result = np.array([])
#         if mfcc:
#             mfccs = np.mean(librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=mfcc).T, axis=0)
#             result = np.hstack((result, mfccs))
#         if chroma:
#             chroma = np.mean(librosa.feature.chroma_stft(S=stft, sr=sample_rate).T, axis=0)
#             result = np.hstack((result, chroma))
#         if mel:
#             mel = np.mean(librosa.feature.melspectrogram(y=X, sr=sample_rate).T,axis=0)
#             result = np.hstack((result, mel))
#     return result

# def extract_audio_features(file_name, mfcc=True, chroma=True, mel=True):
#     """Extract features from an audio file and ensure they are of consistent shape."""
#     try:
#         with soundfile.SoundFile(file_name) as sound_file:
#             X = sound_file.read(dtype="float32")
#             if len(X) == 0:
#                 print(f"File {file_name} is empty or corrupted.")
#                 return None  # Skip empty files
#             sample_rate = sound_file.samplerate
#             if chroma:
#                 stft = np.abs(librosa.stft(X))
#             result = np.array([])

#             # Extract MFCC features and average over time
#             if mfcc:
#                 mfccs = librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=13)
#                 if mfccs.shape[1] == 0:
#                     print(f"MFCC extraction failed for {file_name}")
#                     return None
#                 mfccs_mean = np.mean(mfccs.T, axis=0)
#                 result = np.hstack((result, mfccs_mean))

#             # Extract Chroma features and average over time
#             if chroma:
#                 chroma = librosa.feature.chroma_stft(S=stft, sr=sample_rate)
#                 if chroma.shape[1] == 0:
#                     print(f"Chroma extraction failed for {file_name}")
#                     return None
#                 chroma_mean = np.mean(chroma.T, axis=0)
#                 result = np.hstack((result, chroma_mean))

#             # Extract Mel-spectrogram features and average over time
#             if mel:
#                 mel = librosa.feature.melspectrogram(y=X, sr=sample_rate)
#                 if mel.shape[1] == 0:
#                     print(f"Mel extraction failed for {file_name}")
#                     return None
#                 mel_mean = np.mean(mel.T, axis=0)
#                 result = np.hstack((result, mel_mean))

#         # Check if the result has data
#         if result.shape[0] == 0:
#             print(f"Failed to extract any features from {file_name}")
#             return None

#         return result

#     except Exception as e:
#         print(f"Error processing {file_name}: {e}")
#         return None


# def convert_mp3_to_wav(mp3_file):
#     """Convert MP3 file to WAV using pydub."""
#     sound = AudioSegment.from_mp3(mp3_file)
#     wav_file = mp3_file.replace(".mp3", ".wav")
#     sound.export(wav_file, format="wav")
#     return wav_file

# def load_data(test_size=0.2):
#     x, y = [], []
#     for file in glob.glob("./speechdata/Actor_*/*.wav"):
#         file_name = os.path.basename(file)
#         emotion = emotions[file_name.split("-")[2]]
#         if emotion not in observed_emotions:
#             continue
#         feature = extract_audio_features(file, mfcc=True, chroma=True, mel=True)
#         if feature is None:
#             print(f"Skipping file {file_name} due to feature extraction failure.")
#             continue  # Skip files with no features

#         x.append(feature)
#         y.append(emotion)

#     # Ensure no None or empty features are passed into train_test_split
#     x = [feature for feature in x if feature is not None and len(feature) > 0]

#     if len(x) == 0:
#         raise ValueError("No valid feature data to train on.")

#     # Ensure that `y` is filtered similarly to match valid feature data
#     return train_test_split(np.array(x), np.array(y), test_size=test_size, random_state=9)



# async def emotion_voice_detection():
#     x_train,x_test,y_train,y_test=load_data(test_size=0.25)
#     print((x_train.shape[0], x_test.shape[0]))
#     print(f'Features extracted: {x_train.shape[1]}')
#     model=MLPClassifier(alpha=0.01, batch_size=256, epsilon=1e-08, hidden_layer_sizes=(300,), learning_rate='adaptive', max_iter=500)

#     model.fit(x_train,y_train)
#     y_pred=model.predict(x_test)
#     accuracy=accuracy_score(y_true=y_test, y_pred=y_pred)

#     print("Accuracy: {:.2f}%".format(accuracy*100))
#     print(y_pred)

# # New function to predict the emotion of a single file
# @app.post("/emotion-voice-detection")
# def predict_emotion_of_file(file_path):
#     """Predict emotion from an audio file (MP3 or WAV)."""
#     # Convert MP3 to WAV if necessary
#     if file_path.endswith(".mp3"):
#         file_path = convert_mp3_to_wav(file_path)

#     # Load the model and train it
#     model = MLPClassifier(alpha=0.01, batch_size=256, epsilon=1e-08, hidden_layer_sizes=(300,), learning_rate='adaptive', max_iter=500)
#     x_train, x_test, y_train, y_test = load_data(test_size=0.25)
#     model.fit(x_train, y_train)

#     # Extract features from the test file
#     features = extract_audio_features(file_path, mfcc=True, chroma=True, mel=True)


#     # Reshape the feature to match the model input
#     features = features.reshape(1, -1)

#     # Predict the emotion
#     prediction = model.predict(features)
#     print(prediction)
#     return prediction[0]

# @app.post("/emotion-over-time")
# def predict_emotions_over_time(file_path, chunk_duration=2):
#     """Predict emotion from an audio file at different time intervals."""
#     # Convert MP3 to WAV if necessary
#     if file_path.endswith(".mp3"):
#         file_path = convert_mp3_to_wav(file_path)

#     # Load and preprocess the audio file
#     y, sr = librosa.load(file_path, sr=None)

#         # Load the model and train it (ensure you train the model beforehand)
#     model = MLPClassifier(alpha=0.01, batch_size=256, epsilon=1e-08, hidden_layer_sizes=(300,), learning_rate='adaptive', max_iter=500)
#     x_train, x_test, y_train, y_test = load_data(test_size=0.25)
#     model.fit(x_train, y_train)

#     # Ensure sr and y are correct types
#     if not isinstance(sr, (int, float)) or not isinstance(y, np.ndarray):
#         raise ValueError("Sample rate (sr) or audio data (y) is not of the expected type.")

#     # Determine the number of samples per chunk (based on chunk_duration)
#     samples_per_chunk = int(chunk_duration * sr)
#     total_chunks = 1

#     # Handle the case where the audio file is shorter than the chunk size
#     if len(y) < samples_per_chunk:
#         print(f"Audio file is shorter than the chunk size. Treating the entire audio as one chunk.")
#         total_chunks = 1
#         samples_per_chunk = len(y)  # Use the entire length of the audio
#     else:
#         total_chunks = len(y) // samples_per_chunk
#         if len(y) % samples_per_chunk != 0:
#             total_chunks += 1  # Include any remaining audio as an additional chunk

#     emotions_over_time = []

#     # Process each chunk of the audio file
#     for i in range(total_chunks):
#         start_sample = i * samples_per_chunk
        
#         end_sample = min(start_sample + samples_per_chunk, len(y))  # Ensure end_sample does not exceed len(y)
#         chunk = y[start_sample:end_sample]

#         # Extract features from the chunk
#         features = extract_audio_features_from_array(chunk, sr, mfcc=True, chroma=True, mel=True)
        
#         # Check if feature extraction was successful
#         if features is None or len(features) == 0:
#             print(f"Feature extraction failed for chunk {i}. Skipping.")
#             continue
        
#         # Reshape the feature to match the model input
#         features = features.reshape(1, -1)

#         # Predict the emotion for the chunk
#         emotion = model.predict(features)[0]
        
#         # Calculate the time range for this chunk
#         start_time = i * chunk_duration
#         print("start_time", start_time, "chunk_duration", chunk_duration, "len(y)", len(y), "sr", sr, "diff", start_time + chunk_duration, ) 
        
#         end_time = min(float(start_time + chunk_duration), len(y) / float(sr))  # Ensure end_time does not exceed the audio length

#         # Append the result as a tuple (start_time, end_time, emotion)
#         emotions_over_time.append((start_time, end_time, emotion))

#     return emotions_over_time


# def predict_emotions_over_time(file_path, chunk_duration=2):
#     """Predict emotion from an audio file at different time intervals."""
#     # Convert MP3 to WAV if necessary
#     if file_path.endswith(".mp3"):
#         file_path = convert_mp3_to_wav(file_path)

#     # Load and preprocess the audio file
#     y, sr = librosa.load(file_path, sr=None)

    # # Load the model and train it (ensure you train the model beforehand)
    # model = MLPClassifier(alpha=0.01, batch_size=256, epsilon=1e-08, hidden_layer_sizes=(300,), learning_rate='adaptive', max_iter=500)
    # x_train, x_test, y_train, y_test = load_data(test_size=0.25)
    # model.fit(x_train, y_train)

#     # Determine the number of samples per chunk (based on chunk_duration))
#     samples_per_chunk = int(chunk_duration * sr)
#     print("sample_per_chunk: ", len(y))
#     total_chunks = len(y) // samples_per_chunk

#     if len(y) < samples_per_chunk:
#         print(f"Audio file is shorter than the chunk size. Treating the entire audio as one chunk.")
#         total_chunks = 1

#     emotions_over_time = []
#     print(total_chunks)

#     # Process each chunk of the audio file
#     for i in range(total_chunks):
#         start_sample = i * samples_per_chunk
#         end_sample = start_sample + samples_per_chunk
#         chunk = y[start_sample:end_sample]

#         # Extract features from the chunk
#         features = extract_audio_features_from_array(chunk, sr, mfcc=True, chroma=True, mel=True)
        
#         # Check if feature extraction was successful
#         if features is None or len(features) == 0:
#             print(f"Feature extraction failed for chunk {i}. Skipping.")
#             continue
        
#         # Reshape the feature to match the model input
#         features = features.reshape(1, -1)

#         # Predict the emotion for the chunk
#         emotion = model.predict(features)[0]
        
#         # Calculate the time range for this chunk
#         start_time = i * chunk_duration
#         end_time = start_time + chunk_duration

#         # Append the result as a tuple (start_time, end_time, emotion)
#         emotions_over_time.append((start_time, end_time, emotion))

#     return emotions_over_time


# def extract_audio_features_from_array(audio_data, sample_rate, mfcc=True, chroma=True, mel=True):
#     """Extract features from an audio array (already loaded)."""
#     try:
#         if chroma:
#             stft = np.abs(librosa.stft(audio_data))
#         result = np.array([])

#         # Extract MFCC features and average over time
#         if mfcc:
#             mfccs = librosa.feature.mfcc(y=audio_data, sr=sample_rate, n_mfcc=13)
#             if mfccs.shape[1] == 0:
#                 return None
#             mfccs_mean = np.mean(mfccs.T, axis=0)
#             result = np.hstack((result, mfccs_mean))

#         # Extract Chroma features and average over time
#         if chroma:
#             chroma = librosa.feature.chroma_stft(S=stft, sr=sample_rate)
#             if chroma.shape[1] == 0:
#                 return None
#             chroma_mean = np.mean(chroma.T, axis=0)
#             result = np.hstack((result, chroma_mean))

#         # Extract Mel-spectrogram features and average over time
#         if mel:
#             mel = librosa.feature.melspectrogram(y=audio_data, sr=sample_rate)
#             if mel.shape[1] == 0:
#                 return None
#             mel_mean = np.mean(mel.T, axis=0)
#             result = np.hstack((result, mel_mean))

#         if result.shape[0] == 0:
#             return None

#         return result

#     except Exception as e:
#         print(f"Error processing audio chunk: {e}")
#         return None
    
# def transcribe_audio(audio_file_path):
#     with open(audio_file_path, 'rb') as audio_file:
#         transcription = openaiClient.audio.transcriptions.create(
#             model = "whisper-1", 
#             file = audio_file
#         )
    
#     return transcription
    
# def key_point_extraction(transcription):
#     response = openaiClient.chat.completions.create(
#         model="gpt-4o-mini-2024-07-18",
#         temperature=0,
#         messages=[
#             {
#                 "role": "system",
#                 "content": "You are a proficient AI with a specialty in distilling information into key points. Based on the following text, identify and list the main points that were discussed or brought up. These should be the most important ideas, findings, or topics that are crucial to the essence of the discussion. Your goal is to provide a list that someone could read to quickly understand what was talked about.",
#             },
#             {
#                 "role": "user",
#                 "content": transcription,
#             }
#         ]
#     )
#     return response.choices[0].message.content

# def save_as_docx(minutes, filename):
#     doc = Document()
#     print("minutes", minutes)
#     doc.add_paragraph(minutes)
#     doc.save(filename)
#     # for key, value in minutes:
#     #     # Replace underscores with spaces and capitalize each word for the heading
#     #     heading = ' '.join(word.capitalize() for word in key.split('_'))
#     #     doc.add_heading(heading, level=1)
#     #     doc.add_paragraph(value)
#     #     # Add a line break between sections
#     #     doc.add_paragraph()
#     # doc.save(filename)

# @app.get("/speech-extraction")
# def speech_to_text():
#     transcription = transcribe_audio("./output.mp3")
#     keypoints = key_point_extraction(transcription.text)
#     save_as_docx(keypoints, "audio-keypoints.docx")
#     return {"transcription": transcription, "key_points": keypoints}


# def format_time(seconds):
#     h = int(seconds // 3600)
#     m = int((seconds % 3600) // 60)
#     s = seconds % 60
#     return f"{h:01}:{m:02}:{s:05.2f}".replace('.', ',')

# @app.get("/convert-to-ass")
# def convertToAss():
#     file_path = './StreamingTranscriptResults.json'
#     with open(file_path, 'r') as f:
#         transcript_data = json.load(f)

#     ass_content = ass_header
#     unique_entries = set()  # To store unique entries

#     for result in transcript_data:
#         try:
#             for item in result["Transcript"]["Results"]:
#                 start_time = format_time(item["StartTime"])
#                 end_time = format_time(item["EndTime"])
#                 text = item["Alternatives"][0]["Transcript"]

#                 # Check for duplicates using a tuple (text, start_time, end_time)
#                 if (text, start_time, end_time) not in unique_entries:
#                     unique_entries.add((text, start_time, end_time))

#                     # Add formatted text to .ass content
#                     ass_content += f"Dialogue: 0,{start_time},{end_time},Default,,0,0,0,,{text}\n"
#         except KeyError:
#             continue

#         # Save as .ass file
#         with open('output_subtitles_unique.ass', 'w') as subtitle_file:
#             subtitle_file.write(ass_content)

#     print("ASS subtitle file with unique entries has been created.")

# @app.post("/upload-and-transcribe")
# def upload_and_transcribe_video():
#     result = upload_and_transcribe()
#     return result

# @app.post("/download-srt")
# def download_srt():
#     download_transcript()