package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/ifeanyidike/improv/internal/types"
)

type FFmpegServicer interface {
	ExtractAudio(ctx context.Context, video_file, audio_file string) error
	ExtractFFProbeMetadata(fctx context.Context, ile_path string, file_type string) (*types.FileMetadata, error)
	ExtractThumbnail(ctx context.Context, video_path, output_dir, uniq_id string) (string, error)
}

type FFmpegService struct {
}

func NewFFmpegService() FFmpegServicer {
	return &FFmpegService{}
}

func (fs *FFmpegService) ExtractAudio(ctx context.Context, video_file, audio_file string) error {
	// cmd := exec.Command("ffmpeg", "-i", video_file, "-acodec", "copy", "-vn", audio_file)
	cmd := exec.CommandContext(ctx, "ffmpeg", "-i", video_file, "-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k", audio_file)

	cmd.Stderr = os.Stderr
	cmd.Stdout = os.Stdout
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to extract audio: %v", err)
	}

	return nil
}

func (fs *FFmpegService) RunFFProbe(ctx context.Context, filePath string) (*types.FFProbeOutput, error) {
	// cmd := exec.Command("ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", filePath)
	cmd := exec.CommandContext(ctx,
		"ffprobe",
		"-v",
		"error",
		"-show_entries",
		"format=duration,size,format,bit_rate:stream=width,height,codec_name,codec_type,avg_frame_rate,bit_rate",
		"-of",
		"json",
		filePath,
	)
	var out bytes.Buffer
	cmd.Stdout = &out

	// Run the command
	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("failed to run ffprobe: %v", err)
	}

	var probeOutput types.FFProbeOutput

	if err := json.Unmarshal(out.Bytes(), &probeOutput); err != nil {
		return nil, fmt.Errorf("failed to parse ffprobe output: %v", err)
	}

	return &probeOutput, nil
}

func (fs *FFmpegService) ExtractFFProbeMetadata(ctx context.Context, filePath, fileType string) (*types.FileMetadata, error) {
	ffprobeOutput, err := fs.RunFFProbe(ctx, filePath)
	if err != nil {
		return nil, err
	}

	fileSize := ffprobeOutput.Format.Size
	duration := ffprobeOutput.Format.Duration
	bitrate := ffprobeOutput.Format.Bitrate
	format := ffprobeOutput.Format.Format

	var width, height int
	var frameRate, codecType, resolution string

	for _, stream := range ffprobeOutput.Streams {
		if stream.CodecType == fileType {
			if stream.CodecType == "video" {
				resolution = fmt.Sprintf("%dx%d", stream.Width, stream.Height)
			}
			width = stream.Width
			height = stream.Height
			frameRate = stream.FrameRate
			codecType = stream.CodecType
			break
		}

	}

	return &types.FileMetadata{
		Size:       fileSize,
		Duration:   duration,
		Bitrate:    bitrate,
		Format:     format,
		FrameRate:  frameRate,
		Width:      width,
		Height:     height,
		CodecType:  codecType,
		Resolution: resolution,
	}, nil
}

func (fs *FFmpegService) ExtractThumbnail(ctx context.Context, videoPath, outputDir, uniqID string) (string, error) {
	thumbnailPath := filepath.Join(outputDir, fmt.Sprintf("%s_thumbnail.jpg", uniqID))

	// Extract a frame at 5 seconds
	cmd := exec.CommandContext(
		ctx,
		"ffmpeg",
		"-i", videoPath,
		"-ss", "00:00:05", // 5 seconds mark timestamp
		"-frames:v", "1", // Extract one frame
		"-q:v", "2", // Good quality
		thumbnailPath,
	)

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("failed to extract thumbnail: %v - %s", err, stderr.String())
	}
	return thumbnailPath, nil
}
