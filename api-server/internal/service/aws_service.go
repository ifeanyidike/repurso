package service

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/transcribe"
	"github.com/aws/aws-sdk-go-v2/service/transcribe/types"
)

type S3ClientInterface interface {
	PutObject(ctx context.Context, input *s3.PutObjectInput, opts ...func(*s3.Options)) (*s3.PutObjectOutput, error)
	GetObject(ctx context.Context, input *s3.GetObjectInput, opts ...func(*s3.Options)) (*s3.GetObjectOutput, error)
}

type TranscribeClientInterface interface {
	StartTranscriptionJob(ctx context.Context, input *transcribe.StartTranscriptionJobInput, opts ...func(*transcribe.Options)) (*transcribe.StartTranscriptionJobOutput, error)
	GetTranscriptionJob(ctx context.Context, input *transcribe.GetTranscriptionJobInput, opts ...func(*transcribe.Options)) (*transcribe.GetTranscriptionJobOutput, error)
}

type AWSService struct {
	S3Client         S3ClientInterface
	TranscribeClient TranscribeClientInterface
}

func NewAWSService(s3Client S3ClientInterface, transcribeClient TranscribeClientInterface) AWSService {
	return AWSService{S3Client: s3Client, TranscribeClient: transcribeClient}
}

func (awsSvc AWSService) UploadToS3(file_path, bucket, upload_dir, uniq_id, file_name string) (string, error) {
	// defer file.Close()
	file, err := os.Open(file_path)
	if err != nil {
		return "", fmt.Errorf("failed to open file for S3 upload: %v", err)
	}
	defer file.Close()

	key := fmt.Sprintf("%s/%s-%s", upload_dir, uniq_id, strings.ReplaceAll(file_name, " ", "_"))
	return awsSvc.UploadToS3FromBlob(bucket, key, file)
}

func (awsSvc AWSService) UploadToS3FromBlob(bucket, key string, file io.Reader) (string, error) {
	_, err := awsSvc.S3Client.PutObject(context.Background(), &s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
		Body:   file,
	})

	if err != nil {
		return "", fmt.Errorf("failed to upload file %s to S3, %v", key, err)
	}
	return fmt.Sprintf("https://%s.s3.amazonaws.com/%s", bucket, key), nil
}

func (awsSvc AWSService) StartTranscriptionJob(jobName, s3Uri, bucket, transcriptFileName string) (*transcribe.StartTranscriptionJobOutput, error) {
	input := &transcribe.StartTranscriptionJobInput{
		TranscriptionJobName: aws.String(jobName),
		Media: &types.Media{
			MediaFileUri: aws.String(s3Uri),
		},
		MediaFormat:      "mp3",
		LanguageCode:     "en-US",
		OutputBucketName: aws.String(bucket),
		OutputKey:        aws.String(transcriptFileName),
		Subtitles: &types.Subtitles{
			Formats: []types.SubtitleFormat{"srt", "vtt"},
		},
	}
	return awsSvc.TranscribeClient.StartTranscriptionJob(context.Background(), input)
}

func (awsSvc AWSService) CheckTranscriptionJobStatus(jobName string) (string, error) {
	for {
		result, err := awsSvc.TranscribeClient.GetTranscriptionJob(context.Background(), &transcribe.GetTranscriptionJobInput{
			TranscriptionJobName: aws.String(jobName),
		})
		if err != nil {
			return "", fmt.Errorf("failed to get transcription job status, %v", err)
		}
		status := result.TranscriptionJob.TranscriptionJobStatus
		if status == types.TranscriptionJobStatusCompleted {
			return *result.TranscriptionJob.Transcript.TranscriptFileUri, nil
		} else if status == types.TranscriptionJobStatusFailed {
			return "", fmt.Errorf("transcription job failed")
		}
		time.Sleep(10 * time.Second)
	}
}

func (awsSvc AWSService) DownloadTranscript(bucket, transcriptFileUri string) ([]byte, error) {
	input := &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(transcriptFileUri),
	}
	result, err := awsSvc.S3Client.GetObject(context.Background(), input)
	if err != nil {
		return nil, fmt.Errorf("failed to download transcript, %v", err)
	}
	defer result.Body.Close()

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(result.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read transcript body, %v", err)
	}

	return buf.Bytes(), nil
}
