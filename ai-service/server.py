
import grpc
from concurrent import futures
from protobuf import media_analysis_pb2
from protobuf import media_analysis_pb2_grpc
from services import transcript_processor
from services import moment_processor
from services import moment_type_utils



class MediaAnalysisService(media_analysis_pb2_grpc.MediaAnalysisServiceServicer):
    def GenerateTranscript(self, request, context):
        """Function to generate transcript"""
        # transcripts = utility.generate_transcript(request.audioUrl)
        base = request.base
        transcriptProcessor = transcript_processor.TranscriptionProcessor(base.bucket)
       
        response = transcriptProcessor.transcribe_audio(base.media_url)
        transcript_url = response.get("transcript_url", "")
     
        return media_analysis_pb2.TranscriptResponse(transcript_url=transcript_url, error=None)
    
    def DetectKeyMoments(self, request, context):
        """Function to detect key moments"""
        # moments = utility.detect_key_moments(request.transcript, request.keywords)
        # subtitle_text = moments.get("subtitle_text", "")  # Placeholder
        base = request.base
        moment_types = moment_type_utils.get_proto_moment_type(request.moment_types)
        momentProcessor = moment_processor.MomentProcessor(base.bucket)
        key_moments = momentProcessor.analyze_moments(base.media_url, moment_types=moment_types)
        return media_analysis_pb2.KeyMomentsResponse(moments=key_moments, error=None)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    print("Starting server on port 50051...")
    media_analysis_pb2_grpc.add_MediaAnalysisServiceServicer_to_server(MediaAnalysisService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()

    try:
        print("Server started on port 50051")
        server.wait_for_termination()
    except KeyboardInterrupt:
        print("Shutting down server...")
        server.stop(0)