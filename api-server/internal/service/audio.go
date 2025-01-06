package service

import (
	"context"
	"fmt"
	"time"

	pb "github.com/ifeanyidike/improv/internal/proto"
)

func (u *UploadService) DetectSilence(ctx context.Context, bucket, videoId string) ([]*pb.Silence, error) {
	// audioUrl, err := u.Repo.GetVideoAudio(ctx, videoId)
	// if err != nil {
	// 	return nil, fmt.Errorf("failed to get audio URL: %v", err)
	// }
	audioUrl := "https://repurposerapp-bucket.s3.eu-west-1.amazonaws.com/audios/audio-example-2.mp3"
	ctx, cancel := context.WithTimeout(ctx, time.Minute*20)
	defer cancel()

	req := &pb.SilenceRequest{
		Base: &pb.BaseRequest{
			Bucket:   bucket,
			MediaUrl: audioUrl,
		},
		MinSilenceDuration: 10,
		MaxSilenceDuration: 15,
	}

	res, err := (*u.grpcClient).DetectSilence(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to detect silence: %v", err)
	}

	if res.Error != "" {
		return nil, fmt.Errorf("error occurred in silence detection: %v", res.Error)
	}
	return res.Silences, nil
}
