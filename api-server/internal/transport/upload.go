package transport

import (
	"context"
	"fmt"
	"log"

	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/transcribe"
	"github.com/ifeanyidike/improv/internal/config"
	"github.com/ifeanyidike/improv/internal/controller"
	"github.com/ifeanyidike/improv/internal/repository"
	"github.com/ifeanyidike/improv/internal/service"
)

func (app *Application) InitUploadTransport() (*controller.UploadController, *controller.NotificationController) {
	cfg, err := awsConfig.LoadDefaultConfig(context.TODO(), awsConfig.WithRegion("eu-west-1"))
	if err != nil {
		log.Fatalf("Error loading AWS config: %v", err)
	}
	log.Println("Initializing upload transport... Process starts... In transport...")
	s3 := s3.NewFromConfig(cfg)
	transcribe := transcribe.NewFromConfig(cfg)

	notificationHub := service.NewNotificationService()
	notificationHub.Start(context.Background())

	userRepo := repository.NewRepo(config.DB.GetDB(), config.DB.GetRedisClient())
	awsService := service.NewAWSService(s3, transcribe)

	ffmpegService := service.NewFFmpegService()
	audioWaveformService := service.NewAudioWaveformService()

	mediaAnalysisServer := config.NewMediaAnalysis()
	mgrpcClient := mediaAnalysisServer.GetClient()
	fmt.Println("grpcClient", mgrpcClient, "config grpc", config.GrpcClient)

	grpcClient := config.GrpcClient
	uploadService := service.NewUploadService(
		userRepo,
		awsService,
		ffmpegService,
		audioWaveformService,
		grpcClient,
		context.Background(),
		nil,
	)

	processorConfig := service.ProcessorConfig{
		UploadService: uploadService,
		Notifier:      notificationHub,
		Workers:       5,
		QueueSize:     100,
	}

	processor, err := service.NewBackgroundProcessor(processorConfig)
	if err != nil {
		log.Fatalf("Failed to initialize background processor: %v", err)
	}

	uploadService.SetJobProcessor(processor)

	// Initialize controllers
	notificationController := controller.NewNotificationController(notificationHub)

	ctl := controller.NewUploadController(uploadService)
	return ctl, notificationController
}
