package repository_test

import (
	"bytes"
	"context"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/transcribe"
	"github.com/aws/aws-sdk-go-v2/service/transcribe/types"
	"github.com/gin-gonic/gin"
	"github.com/ifeanyidike/improv/internal/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockS3Client struct {
	mock.Mock
}

func (m *MockS3Client) PutObject(ctx context.Context, input *s3.PutObjectInput, optFns ...func(*s3.Options)) (*s3.PutObjectOutput, error) {
	args := m.Called(ctx, input)
	return args.Get(0).(*s3.PutObjectOutput), args.Error(1)

}

func (m *MockS3Client) DeleteObject(ctx context.Context, input *s3.DeleteObjectInput, optFns ...func(*s3.Options)) (*s3.DeleteObjectOutput, error) {
	return &s3.DeleteObjectOutput{}, nil
}

func (m *MockS3Client) GetObject(ctx context.Context, input *s3.GetObjectInput, optFns ...func(*s3.Options)) (*s3.GetObjectOutput, error) {
	args := m.Called(ctx, input)
	return args.Get(0).(*s3.GetObjectOutput), args.Error(1)
}

type MockTranscribeClient struct {
	mock.Mock
}

func (m *MockTranscribeClient) StartTranscriptionJob(ctx context.Context, input *transcribe.StartTranscriptionJobInput, optFns ...func(*transcribe.Options)) (*transcribe.StartTranscriptionJobOutput, error) {
	args := m.Called(ctx, input)
	return args.Get(0).(*transcribe.StartTranscriptionJobOutput), args.Error(1)
}

func (m *MockTranscribeClient) GetTranscriptionJob(ctx context.Context, input *transcribe.GetTranscriptionJobInput, optFns ...func(*transcribe.Options)) (*transcribe.GetTranscriptionJobOutput, error) {
	args := m.Called(ctx, input)
	return args.Get(0).(*transcribe.GetTranscriptionJobOutput), args.Error(1)
}

func createTestContextWithFile(fileName, fieldName string, fileContent []byte) *gin.Context {
	body := new(bytes.Buffer)
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile(fieldName, fileName)
	part.Write(fileContent)
	writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Request = req
	return c
}

// func TestUploadToS3(t *testing.T) {
// 	mockS3 := &MockS3Client{}
// 	mockS3.On("PutObject", mock.Anything, mock.Anything).Return(&s3.PutObjectOutput{}, nil)
// 	uniq_id := uuid.New().String()
// 	awsSvc := service.AWSService{S3Client: mockS3}

// 	testFileName := "test-file.mp4"
// 	testBucket := "test-bucket"
// 	testFieldName := "video"
// 	testFileContent := []byte("test-content")

// 	c := createTestContextWithFile(testFileName, testFieldName, testFileContent)

// 	file, _, _ := c.Request.FormFile(testFieldName)
// 	url, err := awsSvc.UploadToS3(file, testBucket, "videos/", uniq_id, testFileName)

// 	assert.NoError(t, err)
// 	// assert.Equal(t, "https://test-bucket.s3.amazonaws.com/transcription_test-id_test-file.mp4", url)
// 	assert.Contains(t, url, testBucket)
// 	assert.Contains(t, url, testFileName)
// 	assert.NotEmpty(t, uniq_id)
// 	mockS3.AssertExpectations(t)

// }

// func TestUploadToS3_S3UploadError(t *testing.T) {
// 	mockS3 := &MockS3Client{}
// 	mockS3.On("PutObject", mock.Anything, mock.Anything).Return(&s3.PutObjectOutput{}, fmt.Errorf("mock S3 upload error"))

// 	awsSvc := service.AWSService{S3Client: mockS3}
// 	testBucket := "mock-bucket"
// 	testFileName := "test-file.mp4"
// 	testFieldName := "video"
// 	testFileContent := []byte("test content")
// 	uniq_id := uuid.New().String()
// 	// Create test context
// 	c := createTestContextWithFile(testFileName, testFieldName, testFileContent)

// 	file, _, _ := c.Request.FormFile(testFieldName)

// 	_, err := awsSvc.UploadToS3(file, testBucket, "videos/", uniq_id, testFileName)

// 	assert.Error(t, err)
// 	assert.Contains(t, err.Error(), "failed to upload file")
// 	mockS3.AssertExpectations(t)
// }

func TestCheckTranscriptionJobStatus(t *testing.T) {
	mockTranscribe := &MockTranscribeClient{}
	mockTranscribe.On("GetTranscriptionJob", mock.Anything, mock.Anything).Return(&transcribe.GetTranscriptionJobOutput{
		TranscriptionJob: &types.TranscriptionJob{
			TranscriptionJobStatus: types.TranscriptionJobStatusCompleted,
			Transcript: &types.Transcript{
				TranscriptFileUri: aws.String("http://example.com/transcript"),
			},
		},
	}, nil)

	awsSvc := service.AWSService{TranscribeClient: mockTranscribe}

	jobName := "test-job"
	transcriptURI, err := awsSvc.CheckTranscriptionJobStatus(jobName)
	t.Log("transcriptURI", transcriptURI)

	// Assertions
	assert.NoError(t, err)
	assert.Equal(t, "http://example.com/transcript", transcriptURI)
	mockTranscribe.AssertExpectations(t)
}
