package service

import (
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/ifeanyidike/improv/internal/types"
)

func (us *UploadService) GetUploadData(ctx context.Context, uniq_id string) (map[string]interface{}, error) {
	return us.Repo.GetUpload(ctx, uniq_id)
}

func (us *UploadService) ProcessUpload(ctx context.Context, file multipart.File, projectId, fileName, bucket, uploadDir string) (*UploadResult, error) {
	log.Println("Now in Process Upload... Process starts... In service...")
	// Set timeout for the entire upload process
	ctx, cancel := context.WithTimeout(ctx, 10*time.Minute)
	defer cancel()

	// Generate a unique identifier
	uniqueID := uuid.New().String()

	// Temporary file management
	tempVideoFile := fmt.Sprintf("/tmp/%s_video.mp4", uniqueID)
	if err := us.createTemporaryFile(file, uniqueID); err != nil {
		return nil, fmt.Errorf("failed to create temporary file: %v", err)
	}
	defer us.cleanupTemporaryFile(tempVideoFile)

	// Use a more robust synchronization mechanism
	uploadResults := make(chan *UploadResult, 1)
	errChan := make(chan error, 1)
	// thumbnailResult := make(chan string, 1)

	// Perform upload workflow in a separate goroutine
	go func() {
		// Comprehensive upload workflow
		defer close(uploadResults)
		defer close(errChan)

		log.Println("Starting workflow")
		result, err := us.performUploadWorkflow(ctx, tempVideoFile, fileName, bucket, uploadDir, uniqueID)
		if err != nil {
			errChan <- err
			return
		}
		uploadResults <- result
	}()

	// Wait for results or handle errors
	var metadata *types.FileMetadata
	select {
	case result := <-uploadResults:
		// Save upload details to repository
		metadata = result.FileMetadata
		log.Println("File metadata received:", metadata)

		duration, _ := strconv.ParseFloat(metadata.Duration, 64)
		fileSize, _ := strconv.Atoi(metadata.Size)
		bitrate, _ := strconv.Atoi(metadata.Bitrate)
		// err := us.Repo.SaveUpload(ctx, uniqueID, result.S3URI, result.TranscriptionURL)
		params := &types.VideoInsertParams{
			ProjectID:       projectId,
			VideoURL:        result.S3URI,
			AudioURL:        result.AudioFile,
			Title:           "",
			Description:     "",
			Duration:        duration,
			PosterURL:       result.ThumbnailURL,
			WaveformDataURL: result.WaveformFile,
			FileSize:        fileSize,
			Format:          types.VideoFormat(metadata.Format),
			Width:           metadata.Width,
			Height:          metadata.Height,
			Resolution:      metadata.Resolution,
			FrameRate:       metadata.FrameRate,
			Bitrate:         bitrate,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}

		id, err := us.Repo.CreateVideo(ctx, *params)

		job := &TranscriptionJob{
			ID:       "1",
			Bucket:   bucket,
			AudioURL: result.AudioFile,
			VideoID:  id,
			ClientID: projectId,
		}
		if err := us.jobProcessor.EnqueueJob(job); err != nil {
			return nil, fmt.Errorf("failed to enqueue transcription job: %v", err)
		}
		if err != nil {
			return nil, fmt.Errorf("failed to save upload details: %v", err)
		}
		return result, nil

	case err := <-errChan:
		return nil, err

	case <-ctx.Done():
		return nil, fmt.Errorf("upload process timed out")
	}

}

// performUploadWorkflow orchestrates the entire upload process
func (us *UploadService) performUploadWorkflow(ctx context.Context, tempVideoFile, fileName, bucket, uploadDir, uniqueID string) (*UploadResult, error) {
	// Use WaitGroup for better synchronization
	var wg sync.WaitGroup
	var mu sync.Mutex
	result := &UploadResult{}

	// Prepare error channel with buffer
	errChan := make(chan error, 4) // Reduce from 5 to 4 because transcription process is commented out.
	s3URIChan := make(chan string, 1)

	// S3 Video Upload
	wg.Add(1)
	go func() {
		defer wg.Done()
		uri, err := us.AWSService.UploadToS3(tempVideoFile, bucket, uploadDir, uniqueID, fileName)
		if err != nil {
			errChan <- fmt.Errorf("S3 video upload failed: %v", err)
			return
		}

		mu.Lock()
		result.S3URI = uri
		mu.Unlock()

		s3URIChan <- uri
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		outputDir := "thumbnails"
		posterPath, err := us.FFmpegService.ExtractThumbnail(ctx, tempVideoFile, outputDir, uniqueID)
		if err != nil {
			errChan <- err
		}

		fileName := fmt.Sprintf("%s_thumbnail.jpg", uniqueID)
		posterURL, err := us.AWSService.UploadToS3(bucket, posterPath, outputDir, uniqueID, fileName)
		if err != nil {
			errChan <- err
		}

		mu.Lock()
		result.ThumbnailURL = posterURL
		mu.Unlock()

	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		meta, err := us.FFmpegService.ExtractFFProbeMetadata(ctx, tempVideoFile, "video")
		if err != nil {
			errChan <- err
			return
		}
		mu.Lock()
		result.FileMetadata = meta
		mu.Unlock()
	}()

	// wg.Add(1)
	// go func() {
	// 	defer wg.Done()
	// 	select {
	// 	case s3URI := <-s3URIChan:
	// 		url, err := us.performTranscription(uniqueID, fileName, s3URI, bucket)
	// 		if err != nil {
	// 			errChan <- err
	// 			return
	// 		}

	// 		mu.Lock()
	// 		result.TranscriptionURL = url
	// 		mu.Unlock()

	// 	case <-ctx.Done():
	// 		errChan <- fmt.Errorf("transcription process timed out or was canceled")
	// 	}
	// }()

	// Audio and Waveform Processing
	wg.Add(1)
	go func() {
		defer wg.Done()
		audioFile := fmt.Sprintf("/tmp/%s_audio.mp3", uniqueID)
		waveformFile := fmt.Sprintf("/tmp/%s_waveform.dat", uniqueID)
		defer func() {
			us.cleanupTemporaryFile(audioFile)
			us.cleanupTemporaryFile(waveformFile)
		}()

		// Extract Audio
		err := us.FFmpegService.ExtractAudio(ctx, tempVideoFile, audioFile)
		if err != nil {
			errChan <- fmt.Errorf("audio extraction failed: %v", err)
			return
		}

		var audioWg sync.WaitGroup
		audioWg.Add(2)

		// Audio File Upload
		go func() {
			defer audioWg.Done()
			audioS3Path := fmt.Sprintf("%s_audio.mp3", uniqueID)
			uri, err := us.AWSService.UploadToS3(audioFile, bucket, "audios", uniqueID, audioS3Path)
			if err != nil {
				errChan <- fmt.Errorf("audio S3 upload failed: %v", err)
				return
			}

			mu.Lock()
			result.AudioFile = uri
			mu.Unlock()
		}()

		// Waveform Generation and Upload
		go func() {
			defer audioWg.Done()
			err := us.AudioWaveformService.GenerateWaveform(audioFile, waveformFile)
			if err != nil {
				errChan <- fmt.Errorf("waveform generation failed: %v", err)
				return
			}

			waveformS3Path := fmt.Sprintf("%s_waveform.dat", uniqueID)
			uri, err := us.AWSService.UploadToS3(waveformFile, bucket, "waveforms", uniqueID, waveformS3Path)
			if err != nil {
				errChan <- fmt.Errorf("waveform S3 upload failed: %v", err)
				return
			}

			mu.Lock()
			result.WaveformFile = uri
			mu.Unlock()
		}()

		audioWg.Wait()
	}()

	// Error and completion handling
	go func() {
		wg.Wait()
		close(errChan)
	}()

	// Check for any errors
	for err := range errChan {
		if err != nil {
			return nil, err
		}
	}

	return result, nil
}

func (us *UploadService) performTranscription(uniqueID, fileName, s3URI, bucket string) (string, error) {
	jobName := fmt.Sprintf("transcription_%s", uniqueID)
	fileNameWithoutExt := strings.ReplaceAll(strings.TrimSuffix(fileName, filepath.Ext(fileName)), " ", "_")
	transcriptionKey := fmt.Sprintf("transcriptions/%s_%s_%s",
		jobName,
		fileNameWithoutExt,
		time.Now().Format("20060102_150405"),
	)

	_, err := us.AWSService.StartTranscriptionJob(jobName, s3URI, bucket, transcriptionKey)
	if err != nil {
		return "", fmt.Errorf("transcription job start failed: %v", err)

	}

	url, err := us.AWSService.CheckTranscriptionJobStatus(jobName)
	if err != nil {
		return "", fmt.Errorf("transcription job status check failed: %v", err)

	}
	return url, nil
}

// Helper methods for file management
func (us *UploadService) createTemporaryFile(file io.Reader, filePath string) error {
	err := saveMultipartFileToDisk(file, filePath)
	if err != nil {
		return fmt.Errorf("error saving file to disk: %v", err)
	}
	return nil
}

func (us *UploadService) cleanupTemporaryFile(filePath string) {
	// Implement safe file deletion
	deleteTemporaryFile(filePath)
}

func saveMultipartFileToDisk(file io.Reader, destPath string) error {
	// Reset file cursor if possible (for safety in case file was already read)
	if seeker, ok := file.(io.Seeker); ok {
		_, err := seeker.Seek(0, io.SeekStart)
		if err != nil {
			return fmt.Errorf("error seeking file: %v", err)
		}
	}

	// Create destination file
	outFile, err := os.Create(destPath)
	if err != nil {
		return fmt.Errorf("error creating file: %v", err)
	}
	defer outFile.Close()

	// Copy content to the destination file
	_, err = io.Copy(outFile, file)
	if err != nil {
		return fmt.Errorf("error copying file to disk: %v", err)
	}

	return nil
}

func deleteTemporaryFile(filePath string) error {
	err := os.Remove(filePath)
	if err != nil {
		return fmt.Errorf("error deleting temporary file: %v", err)
	}
	return nil
}

func (us *UploadService) ProcessChildAudioUpload(ctx context.Context, file multipart.File, videoId, file_name, bucket, upload_dir string) (*AudioUploadResult, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Minute)
	defer cancel()

	audio, result, err := us.HandleProcessChildAudioUpload(ctx, file, videoId, file_name, bucket, upload_dir)
	if err != nil {
		return nil, err
	}

	if err := us.Repo.CreateChildAudio(ctx, audio, videoId); err != nil {
		return nil, err
	}
	return result, nil
	// Upload results to database

}

func (us *UploadService) HandleProcessChildAudioUpload(ctx context.Context, file io.Reader, videoId, file_name, bucket, upload_dir string) (*types.ChildAudio, *AudioUploadResult, error) {
	// Generate a unique identifier
	uniqueID := uuid.New().String()

	// Temporary file management
	tempAudioFile := fmt.Sprintf("/tmp/%s_%s", uniqueID, file_name)

	if err := us.createTemporaryFile(file, tempAudioFile); err != nil {
		return nil, nil, fmt.Errorf("failed to create temporary file: %v", err)
	}
	defer us.cleanupTemporaryFile(tempAudioFile)

	errChan := make(chan error, 3)
	// audioS3Uri := make(chan string, 1)
	// audioWaveformUri := make(chan string, 1)
	var result *AudioUploadResult

	mu := &sync.Mutex{}
	wg := &sync.WaitGroup{}

	wg.Add(1)
	go func() {
		defer wg.Done()
		uri, err := us.AWSService.UploadToS3(tempAudioFile, bucket, upload_dir, uniqueID, file_name)
		if err != nil {
			errChan <- fmt.Errorf("S3 video upload failed: %v", err)
			return
		}

		// audioS3Uri <- uri
		mu.Lock()
		result.AudioURL = uri
		mu.Unlock()
	}()

	wg.Add(1)
	go func() {
		waveformFile := fmt.Sprintf("/tmp/%s_waveform.dat", uniqueID)
		err := us.AudioWaveformService.GenerateWaveform(tempAudioFile, waveformFile)
		if err != nil {
			errChan <- fmt.Errorf("waveform generation failed: %v", err)
			return
		}

		waveformS3Path := fmt.Sprintf("%s_waveform.dat", uniqueID)
		uri, err := us.AWSService.UploadToS3(waveformFile, bucket, "waveforms", uniqueID, waveformS3Path)
		if err != nil {
			errChan <- fmt.Errorf("waveform S3 upload failed: %v", err)
			return
		}
		// audioWaveformUri <- uri
		mu.Lock()
		result.WaveformFile = uri
		mu.Unlock()
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		meta, err := us.FFmpegService.ExtractFFProbeMetadata(ctx, tempAudioFile, "audio")
		if err != nil {
			errChan <- err
			return
		}
		mu.Lock()
		result.FileMeta = meta
		mu.Unlock()
	}()

	go func() {
		wg.Wait()
		close(errChan)
	}()

	for err := range errChan {
		if err != nil {
			return nil, nil, err
		}
	}

	duration, _ := strconv.ParseFloat(result.FileMeta.Duration, 64)
	fileSize, _ := strconv.Atoi(result.FileMeta.Size)

	audio := &types.ChildAudio{
		ParentVideoID:   videoId,
		AudioURL:        result.AudioURL,
		WaveformDataURL: result.WaveformFile,
		Title:           "",
		Description:     "",
		Duration:        duration,
		FileSize:        int64(fileSize),
		Time:            0,
		Locked:          false,
		Hidden:          false,
		Format:          result.FileMeta.Format,
		Volume:          1,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	return audio, result, nil
	// Upload results to database

}

func (us *UploadService) ProcessChildImageUpload(ctx context.Context, file multipart.File, videoId, file_name, bucket, upload_dir string) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, time.Minute*5)
	defer cancel()

	unique_id := uuid.New().String()
	tempImageFile := fmt.Sprintf("/tmp/%s_%s", unique_id, file_name)

	if err := us.createTemporaryFile(file, tempImageFile); err != nil {
		return "", fmt.Errorf("failed to create temporary file: %v", err)
	}
	defer us.cleanupTemporaryFile(tempImageFile)
	errChan := make(chan error, 2)

	mu := &sync.Mutex{}
	wg := &sync.WaitGroup{}
	metadata := &types.ChildImage{
		ParentVideoID: videoId,
		Title:         "",
		Description:   "",
		ImageURL:      "",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
		FabricImage: types.FabricImage{
			Locked:    false,
			Hidden:    false,
			Time:      0,
			Duration:  8,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	wg.Add(1)
	go func() {
		defer wg.Done()
		meta, err := us.FFmpegService.ExtractFFProbeMetadata(ctx, tempImageFile, "video")
		if err != nil {
			errChan <- err
			return
		}
		mu.Lock()
		metadata.Format = meta.Format
		metadata.Height = float64(meta.Height)
		metadata.Width = float64(meta.Width)
		mu.Unlock()

	}()

	wg.Add(1)
	go func() {
		imageS3Path := fmt.Sprintf("%s_%s", unique_id, file_name)
		uri, err := us.AWSService.UploadToS3(tempImageFile, bucket, upload_dir, unique_id, imageS3Path)
		if err != nil {
			errChan <- fmt.Errorf("S3 video upload failed: %v", err)
			return
		}
		mu.Lock()
		metadata.ImageURL = uri
		mu.Unlock()
	}()

	go func() {
		wg.Wait()
		close(errChan)
	}()

	for err := range errChan {
		if err != nil {
			return "", err
		}
	}
	if err := us.Repo.CreateChildImage(ctx, metadata, videoId); err != nil {
		return "", err
	}
	return metadata.ImageURL, nil
}

func (us *UploadService) ProcessChildVideoUpload(ctx context.Context, file multipart.File, videoId, file_name, bucket, upload_dir string) (*types.ChildVideo, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Minute)
	defer cancel()

	result, err := us.HandleProcessChildVideoUpload(ctx, file, videoId, file_name, bucket, upload_dir)
	if err != nil {
		return nil, err
	}

	if err := us.Repo.CreateChildVideo(ctx, result, videoId); err != nil {
		return nil, err
	}
	return result, nil

}

func (us *UploadService) HandleProcessChildVideoUpload(ctx context.Context, file io.Reader, videoId, file_name, bucket, upload_dir string) (*types.ChildVideo, error) {

	uniqueID := uuid.New().String()
	tempVideoFile := fmt.Sprintf("/tmp/%s_%s", uniqueID, file_name)

	if err := us.createTemporaryFile(file, tempVideoFile); err != nil {
		return nil, fmt.Errorf("failed to create temporary file: %v", err)
	}
	defer us.cleanupTemporaryFile(tempVideoFile)

	errChan := make(chan error, 3)
	result := &types.ChildVideo{
		ParentVideoID: videoId,
		Title:         "",
		Description:   "",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
		FabricChildVideo: types.FabricChildVideo{
			Locked:    false,
			Hidden:    false,
			Time:      0,
			Duration:  0,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	mu := &sync.Mutex{}
	wg := &sync.WaitGroup{}

	wg.Add(1)
	go func() {
		defer wg.Done()
		uri, err := us.AWSService.UploadToS3(tempVideoFile, bucket, upload_dir, uniqueID, file_name)
		if err != nil {
			errChan <- fmt.Errorf("S3 video upload failed: %v", err)
			return
		}

		// videoS3Uri <- uri
		mu.Lock()
		result.VideoURL = uri
		mu.Unlock()
	}()

	wg.Add(1)
	go func() {
		waveformFile := fmt.Sprintf("/tmp/%s_waveform.dat", uniqueID)
		err := us.AudioWaveformService.GenerateWaveform(tempVideoFile, waveformFile)
		if err != nil {
			errChan <- fmt.Errorf("waveform generation failed: %v", err)
			return
		}

		waveformS3Path := fmt.Sprintf("%s_waveform.dat", uniqueID)
		uri, err := us.AWSService.UploadToS3(waveformFile, bucket, "waveforms", uniqueID, waveformS3Path)
		if err != nil {
			errChan <- fmt.Errorf("waveform S3 upload failed: %v", err)
			return
		}
		// videoWaveformUri <- uri
		mu.Lock()
		result.WaveformDataURL = uri
		mu.Unlock()
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		meta, err := us.FFmpegService.ExtractFFProbeMetadata(ctx, tempVideoFile, "video")
		if err != nil {
			errChan <- err
			return
		}
		duration, _ := strconv.ParseFloat(meta.Duration, 64)
		fileSize, _ := strconv.Atoi(meta.Size)
		bitrate, _ := strconv.Atoi(meta.Bitrate)

		mu.Lock()
		result.Bitrate = bitrate
		result.FileSize = int64(fileSize)
		result.Duration = duration
		result.Format = meta.Format
		mu.Unlock()
	}()

	go func() {
		wg.Wait()
		close(errChan)
	}()

	for err := range errChan {
		if err != nil {
			return nil, err
		}
	}
	return result, nil

}
