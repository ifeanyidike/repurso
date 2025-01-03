package service

import (
	"context"
	"fmt"
	"log"

	pb "github.com/ifeanyidike/improv/internal/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type GrpcServicer interface {
	GenerateTranscript(ctx context.Context, bucket, audioUrl string) (string, *grpc.ClientConn, error)
}

type GrpcService struct {
}

func NewGrpcService() GrpcServicer {
	return &GrpcService{}
}

func (g *GrpcService) GenerateTranscript(ctx context.Context, bucket, audioUrl string) (string, *grpc.ClientConn, error) {
	fmt.Println("audio url in GenerateTranscript", audioUrl)

	conn, err := grpc.NewClient("ai-service:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return "", conn, fmt.Errorf("failed to connect to subtitles service: %v", err)
	}
	defer conn.Close()

	client := pb.NewMediaAnalysisServiceClient(conn)

	req := &pb.TranscriptRequest{
		Base: &pb.BaseRequest{
			Bucket:   bucket,
			MediaUrl: audioUrl,
		},
		LanguageCode:             "en-US",
		EnableSpeakerDiarization: true,
	}

	res, err := client.GenerateTranscript(ctx, req)
	if err != nil {
		return "", conn, fmt.Errorf("failed to generate subtitle: %v", err)
	}
	if res.Error != "" {
		log.Println("subtitle generation error: ", res.Error)
		return "", conn, fmt.Errorf("error occurred in subtitle generation: %v", res.Error)
	}
	log.Printf("Generated subtitle for video %s: %s", audioUrl, res.TranscriptUrl)
	return res.TranscriptUrl, conn, nil
}
