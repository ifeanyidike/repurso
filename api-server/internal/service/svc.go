package service

import (
	"context"
	"mime/multipart"

	pb "github.com/ifeanyidike/improv/internal/proto"
	"github.com/ifeanyidike/improv/internal/repository"
	"github.com/ifeanyidike/improv/internal/types"
)

type UploadServicer interface {
	ProcessUpload(ctx context.Context, file multipart.File, projectId, file_name, bucket, upload_dir string) (*UploadResult, error)
	ProcessChildAudioUpload(ctx context.Context, file multipart.File, videoId, file_name, bucket, upload_dir string) (*AudioUploadResult, error)
	ProcessChildImageUpload(ctx context.Context, file multipart.File, videoId, file_name, bucket, upload_dir string) (string, error)
	ProcessChildVideoUpload(ctx context.Context, file multipart.File, videoId, file_name, bucket, upload_dir string) (*types.ChildVideo, error)
	GetUploadData(ctx context.Context, uniq_id string) (map[string]interface{}, error)
	AutoSaveVideo(ctx context.Context, bucket, videoID string, updates *types.VideoGetParams) error
	GenerateTranscript(ctx context.Context, bucket, videoId string) (string, error)
	AutoGenerateTranscript(ctx context.Context, bucket, audioUrl, videoId string) (string, error)
	GetKeyMoments(ctx context.Context, bucket, videoId string, moment string) ([]*pb.KeyMoment, error)
	DetectSilence(ctx context.Context, bucket, videoId string) ([]*pb.Silence, error)
	SetJobProcessor(processor JobProcessor)
	SampleJob(context.Context)
}

type UploadService struct {
	AWSService           AWSService
	Repo                 repository.Repo
	FFmpegService        FFmpegServicer
	AudioWaveformService AudioWaveformServicer
	grpcClient           *pb.MediaAnalysisServiceClient
	ctx                  context.Context
	jobProcessor         JobProcessor
	// grpcService          GrpcServicer
}

type UploadResult struct {
	S3URI            string              `json:"s3Uri"`
	TranscriptionURL string              `json:"transcriptionURL"`
	AudioFile        string              `json:"audioFile"`
	WaveformFile     string              `json:"waveformFile"`
	ThumbnailURL     string              `json:"thumbnailURL"`
	FileMetadata     *types.FileMetadata `json:"fileMetadata"`
}

type AudioUploadResult struct {
	AudioURL     string              `json:"audioURL"`
	FileMeta     *types.FileMetadata `json:"fileMetadata"`
	WaveformFile string              `json:"waveformFile"`
}

type ImageUploadResult struct {
	AudioURL     string              `json:"audioURL"`
	FileMeta     *types.FileMetadata `json:"fileMetadata"`
	WaveformFile string              `json:"waveformFile"`
}

func NewUploadService(
	repo repository.Repo,
	awsService AWSService,
	ffmpegService FFmpegServicer,
	waveformService AudioWaveformServicer,
	grpcClient *pb.MediaAnalysisServiceClient,
	ctx context.Context,
	jobProcessor JobProcessor,
) UploadServicer {
	return &UploadService{
		Repo:                 repo,
		AWSService:           awsService,
		FFmpegService:        ffmpegService,
		AudioWaveformService: waveformService,
		grpcClient:           grpcClient,
		ctx:                  ctx,
		jobProcessor:         jobProcessor,
	}
}

func (s *UploadService) SetJobProcessor(processor JobProcessor) {
	s.jobProcessor = processor
}
