package service

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	pb "github.com/ifeanyidike/improv/internal/proto"
	"github.com/ifeanyidike/improv/internal/types"
)

func (u *UploadService) ProcessVideoForAutoSave(ctx context.Context, bucket, videoID string, updates *types.VideoGetParams) (*types.VideoGetParams, error) {
	// Fetch video blob
	fetchedVideo, err := fetchBlobFromURL(updates.VideoURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch video from blob URL: %v", err)
	}

	// Create temporary video file
	tempVideoFile := fmt.Sprintf("/tmp/%s_temp.mp4", uuid.New().String())
	if err := u.createTemporaryFile(bytes.NewBuffer(fetchedVideo), tempVideoFile); err != nil {
		return nil, fmt.Errorf("failed to create temporary file: %v", err)
	}

	// Perform upload workflow
	uploadResult, err := u.performUpload(ctx, tempVideoFile, bucket)
	if err != nil {
		return nil, err
	}

	// Update metadata
	metadata := uploadResult.FileMetadata
	duration, _ := strconv.ParseFloat(metadata.Duration, 64)
	fileSize, _ := strconv.Atoi(metadata.Size)
	bitrate, _ := strconv.Atoi(metadata.Bitrate)

	updates.VideoURL = uploadResult.S3URI
	updates.Duration = duration
	updates.FileSize = int64(fileSize)
	updates.Format = metadata.Format
	updates.Resolution = metadata.Resolution
	updates.PosterURL = uploadResult.ThumbnailURL
	updates.WaveformDataURL = uploadResult.WaveformFile
	updates.AudioURL = uploadResult.AudioFile
	updates.Height = metadata.Height
	updates.Width = metadata.Width
	updates.Bitrate = bitrate

	return updates, nil
}

func (u *UploadService) ProcessChildVideos(ctx context.Context, bucket, videoID string, childVideos []types.ChildVideo) error {
	var wg sync.WaitGroup
	errChan := make(chan error, len(childVideos)) // Buffered channel
	mu := &sync.Mutex{}

	for i := range childVideos {
		childVideo := &childVideos[i]
		if strings.HasPrefix(childVideo.VideoURL, "blob:") {
			wg.Add(1)
			go func(cv *types.ChildVideo) {
				defer wg.Done()
				// Fetch blob data
				fetchedVideo, err := fetchBlobFromURL(cv.VideoURL)
				if err != nil {
					errChan <- fmt.Errorf("failed to fetch video from blob URL: %v", err)
					return
				}

				// Process video upload
				uniqID := uuid.New().String()
				fileName := fmt.Sprintf("%s.mp4", uniqID)
				result, err := u.HandleProcessChildVideoUpload(ctx, bytes.NewBuffer(fetchedVideo), videoID, fileName, bucket, "childvideos")
				if err != nil {
					errChan <- err
					return
				}

				// Update metadata
				mu.Lock()
				cv.VideoURL = result.VideoURL
				cv.AudioURL = result.AudioURL
				cv.Duration = result.Duration
				cv.FileSize = result.FileSize
				cv.Format = result.Format
				cv.WaveformDataURL = result.WaveformDataURL
				mu.Unlock()
			}(childVideo)
		}
	}

	wg.Wait()
	close(errChan)

	// Collect errors
	for err := range errChan {
		if err != nil {
			return err
		}
	}

	return nil
}

func (u *UploadService) AutoSaveVideo(ctx context.Context, bucket, videoID string, updates *types.VideoGetParams) error {
	var wg sync.WaitGroup
	errChan := make(chan error, 1)

	if strings.HasPrefix(updates.VideoURL, "blob:") {
		wg.Add(1)
		go func() {
			defer wg.Done()
			// Process main video
			res, err := u.ProcessVideoForAutoSave(ctx, bucket, videoID, updates)
			if err != nil {
				errChan <- err
				return
			}
			// Update metadata
			*updates = *res
		}()
	}

	// Process child videos
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := u.ProcessChildVideos(ctx, bucket, videoID, updates.ChildVideos); err != nil {
			errChan <- err
		}
	}()

	wg.Wait()
	close(errChan)

	// Handle errors
	for err := range errChan {
		return err
	}

	// Save video metadata
	if err := u.Repo.AutoSaveVideo(ctx, videoID, updates); err != nil {
		return fmt.Errorf("failed to save video metadata: %v", err)
	}

	return nil
}

// Helper function to perform the upload workflow
func (u *UploadService) performUpload(ctx context.Context, tempVideoFile, bucket string) (*UploadResult, error) {
	uniqID := uuid.New().String()
	fileName := fmt.Sprintf("%s.mp4", uniqID)
	uploadDir := "videos"

	result, err := u.performUploadWorkflow(ctx, tempVideoFile, fileName, bucket, uploadDir, uniqID)
	if err != nil {
		return nil, fmt.Errorf("upload workflow failed: %v", err)
	}

	return result, nil
}

func (u *UploadService) GenerateTranscript(ctx context.Context, bucket, videoId string) (string, error) {
	// audioUrl, err := u.Repo.GetVideoAudio(ctx, videoId)
	// if err != nil {
	// 	return "", fmt.Errorf("failed to get audio URL: %v", err)
	// }
	audioUrl := "https://repurposerapp-bucket.s3.eu-west-1.amazonaws.com/audios/audio-example-2.mp3"
	fmt.Println("audio url:", audioUrl)

	// conn, err := grpc.NewClient("ai-service:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	// if err != nil {
	// 	return "", fmt.Errorf("failed to connect to subtitles service: %v", err)
	// }
	// defer conn.Close()

	// client := pb.NewMediaAnalysisServiceClient(conn)

	req := &pb.TranscriptRequest{
		Base: &pb.BaseRequest{
			Bucket:   bucket,
			MediaUrl: audioUrl,
		},
		LanguageCode:             "en-US",
		EnableSpeakerDiarization: true,
	}
	ctx, cancel := context.WithTimeout(ctx, time.Minute*20)
	defer cancel()

	if u.grpcClient == nil {
		return "", fmt.Errorf("grpcClient is nil")
	}

	res, err := (*u.grpcClient).GenerateTranscript(ctx, req)

	if err != nil {
		return "", fmt.Errorf("failed to generate subtitle: %v", err)
	}
	if res.Error != "" {
		log.Println("subtitle generation error: ", res.Error)
		return "", fmt.Errorf("error occurred in subtitle generation: %v", res.Error)
	}
	if res.TranscriptUrl != "" {
		fmt.Println("res.TranscriptUrl", res.TranscriptUrl)
	}

	if err := u.Repo.SaveTranscript(ctx, res.TranscriptUrl, videoId); err != nil {
		return "", fmt.Errorf("failed to save subtitle URL: %v", err)
	}
	return res.TranscriptUrl, nil
}

// func getMomentType(moment string) pb.KeyMomentType {
// 	switch strings.ToLower(moment) {
// 	case "emotional":
// 		return pb.KeyMomentType_EMOTIONAL
// 	case "inspirational":
// 		return pb.KeyMomentType_INSPIRATIONAL
// 	case "action":
// 		return pb.KeyMomentType_ACTION
// 	case "thematic":
// 		return pb.KeyMomentType_THEMATIC
// 	case "transition":
// 		return pb.KeyMomentType_TRANSITION
// 	case "introduction":
// 		return pb.KeyMomentType_INTRODUCTION
// 	case "closing":
// 		return pb.KeyMomentType_CLOSING
// 	case "expertise":
// 		return pb.KeyMomentType_EXPERTISE
// 	case "engagement":
// 		return pb.KeyMomentType_ENGAGEMENT
// 	case "storytelling":
// 		return pb.KeyMomentType_STORY_TELLING
// 	case "cta":
// 		return pb.KeyMomentType_CALL_TO_ACTION
// 	case "gratitude":
// 		return pb.KeyMomentType_GRATITUDE
// 	case "acknowledgement":
// 		return pb.KeyMomentType_ACKNOWLEDGEMENT
// 	case "humor":
// 		return pb.KeyMomentType_HUMOR
// 	case "achievement":
// 		return pb.KeyMomentType_ACHIEVEMENT
// 	case "confusion":
// 		return pb.KeyMomentType_CONFUSION

// 	default:
// 		return pb.KeyMomentType_KEY_MOMENT_TYPE_UNSPECIFIED
// 	}

// }

func (u *UploadService) GetKeyMoments(ctx context.Context, bucket, videoId string, moment string) ([]*pb.KeyMoment, error) {
	transcript_url := "https://repurposerapp-bucket.s3.eu-west-1.amazonaws.com/transcripts/audio-example-2.json"

	// K := getMomentType(moment)

	req := pb.KeyMomentsRequest{
		Base: &pb.BaseRequest{
			Bucket:   bucket,
			MediaUrl: transcript_url,
		},
		MomentTypes:        []string{moment},
		MinSegmentDuration: 10,
	}
	ctx, cancel := context.WithTimeout(ctx, time.Minute*20)
	defer cancel()
	if u.grpcClient == nil {
		return nil, fmt.Errorf("grpcClient is nil")
	}
	res, err := (*u.grpcClient).DetectKeyMoments(ctx, &req)
	if err != nil {
		return nil, fmt.Errorf("failed to detect key moments: %v", err)
	}
	if res.Error != "" {
		log.Println("key moment detection error: ", res.Error)
		return nil, fmt.Errorf("error occurred in key moment detection: %v", res.Error)
	}

	return res.Moments, nil
}
