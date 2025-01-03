package config

import (
	"fmt"

	pb "github.com/ifeanyidike/improv/internal/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type MediaAnalysis interface {
	ConnectToService() (*grpc.ClientConn, error)
	GetClient() *pb.MediaAnalysisServiceClient
}

type MediaAnalyzer struct {
	// gRPC client
	Client *pb.MediaAnalysisServiceClient
}

func NewMediaAnalysis() MediaAnalysis {
	return &MediaAnalyzer{}
}

var GrpcClient *pb.MediaAnalysisServiceClient

func (m *MediaAnalyzer) ConnectToService() (*grpc.ClientConn, error) {
	conn, err := grpc.NewClient("ai-service:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return conn, fmt.Errorf("failed to connect to subtitles service: %v", err)
	}

	client := pb.NewMediaAnalysisServiceClient(conn)
	print("Connecting to subtitles service", &client)
	GrpcClient = &client
	m.Client = &client

	return conn, nil
}

func (m *MediaAnalyzer) GetClient() *pb.MediaAnalysisServiceClient {
	return m.Client
}
