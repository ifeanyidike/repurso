package controller

import (
	"database/sql"
	"fmt"
	"log"
	"mime/multipart"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyidike/improv/internal/config"
	"github.com/ifeanyidike/improv/internal/service"
	"github.com/ifeanyidike/improv/internal/types"
	"github.com/ifeanyidike/improv/internal/utils"
)

type UploadController struct {
	UploadService service.UploadServicer
}

func NewUploadController(uploadService service.UploadServicer) *UploadController {
	return &UploadController{uploadService}
}

func retrieveFileFromForm(c *gin.Context, name string) (multipart.File, string, error) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, config.Cfg.Server.MaxUploadSize)

	fileHeader, err := c.FormFile(name)
	if err != nil {
		log.Println("An error occurred", err)
		return nil, "", err
	}

	file, err := fileHeader.Open()
	if err != nil {
		log.Println("Error occurred2", "Error opening file")
		return nil, "", err
	}

	fName := fileHeader.Filename
	if fName == "" {
		fName = "output"
	}

	return file, fName, nil
}

func (uc *UploadController) UploadVideo(c *gin.Context) {
	log.Println("Calling upload file... Process starts... In controller...")
	uploadName := "video"
	bucket := config.Cfg.AWS.BucketName
	uploadDir := "videos"
	projectId, _ := c.Params.Get("projectId")

	file, fileName, err := retrieveFileFromForm(c, uploadName)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid file upload")
		return
	}
	defer file.Close()

	start := time.Now()
	uploadData, err := uc.UploadService.ProcessUpload(c, file, projectId, fileName, bucket, uploadDir)
	elapsed := time.Since(start)

	log.Println("time elapsed: ", elapsed)

	if err != nil {
		log.Println("Error processing upload:", err)
		utils.RespondError(c, http.StatusInternalServerError, "Error processing upload")
		return
	}

	utils.RespondJSON(c, http.StatusCreated, uploadData)
}

func (uc *UploadController) UploadChildAudio(c *gin.Context) {
	log.Println("In upload child audio controller")
	uploadName := "child-audio"
	bucket := config.Cfg.AWS.BucketName
	uploadDir := "audios"
	projectId, _ := c.Params.Get("videoId")

	file, fileName, err := retrieveFileFromForm(c, uploadName)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid file upload")
		return
	}
	defer file.Close()

	start := time.Now()
	uploadData, err := uc.UploadService.ProcessChildAudioUpload(c, file, projectId, fileName, bucket, uploadDir)
	elapsed := time.Since(start)

	log.Println("time elapsed: ", elapsed)

	if err != nil {
		log.Println("Error processing upload:", err)
		utils.RespondError(c, http.StatusInternalServerError, "Error processing upload")
		return
	}

	utils.RespondJSON(c, http.StatusCreated, uploadData)
}

func (uc *UploadController) UploadChildImage(c *gin.Context) {
	log.Println("In upload child image controller")
	uploadName := "child-image"
	bucket := config.Cfg.AWS.BucketName
	uploadDir := "audios"
	projectId, _ := c.Params.Get("videoId")

	file, fileName, err := retrieveFileFromForm(c, uploadName)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid file upload")
		return
	}
	defer file.Close()

	start := time.Now()
	uploadData, err := uc.UploadService.ProcessChildImageUpload(c, file, projectId, fileName, bucket, uploadDir)
	elapsed := time.Since(start)

	log.Println("time elapsed: ", elapsed)

	if err != nil {
		log.Println("Error processing upload:", err)
		utils.RespondError(c, http.StatusInternalServerError, "Error processing upload")
		return
	}

	utils.RespondJSON(c, http.StatusCreated, uploadData)
}

func (uc *UploadController) UploadChildVideo(c *gin.Context) {
	log.Println("In upload child video controller")
	uploadName := "child-video"
	bucket := config.Cfg.AWS.BucketName
	uploadDir := "childvideos"
	projectId, _ := c.Params.Get("videoId")

	file, fileName, err := retrieveFileFromForm(c, uploadName)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid file upload")
		return
	}
	defer file.Close()

	start := time.Now()
	uploadData, err := uc.UploadService.ProcessChildVideoUpload(c, file, projectId, fileName, bucket, uploadDir)
	elapsed := time.Since(start)

	log.Println("time elapsed: ", elapsed)

	if err != nil {
		log.Println("Error processing upload:", err)
		utils.RespondError(c, http.StatusInternalServerError, "Error processing upload")
		return
	}

	utils.RespondJSON(c, http.StatusCreated, uploadData)
}

func (uc *UploadController) GetUpload(c *gin.Context) {
	uniq_id := c.Param("id")

	upload_data, err := uc.UploadService.GetUploadData(c, uniq_id)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondError(c, http.StatusNotFound, "Upload not found")
		} else {
			utils.RespondError(c, http.StatusInternalServerError, "Error fetching upload data")
		}
		return
	}

	utils.RespondJSON(c, http.StatusOK, upload_data)
}

func (uc *UploadController) AutoSave(c *gin.Context) {
	var updates types.VideoGetParams
	if err := c.BindJSON(&updates); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid JSON payload")
		return
	}
	video_id := c.Param("videoId")
	bucket := config.Cfg.AWS.BucketName
	err := uc.UploadService.AutoSaveVideo(c, bucket, video_id, &updates)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Error auto-saving video")
		return
	}
	utils.RespondJSON(c, http.StatusOK, gin.H{"message": "Video auto-saved successfully"})
}

func (uc *UploadController) GenerateTranscript(c *gin.Context) {
	videoId := c.Param("videoId")
	bucket := config.Cfg.AWS.BucketName
	subtitleUrl, err := uc.UploadService.GenerateTranscript(c, bucket, videoId)
	if err != nil {
		log.Println("Error generating subtitle:", err)

		utils.RespondError(c, http.StatusInternalServerError, fmt.Sprintf("error generating subtitle: %v", err))
		return
	}
	utils.RespondJSON(c, http.StatusOK, gin.H{"message": "Subtitle generated successfully", "url": subtitleUrl})
}

func (uc *UploadController) GetKeyMoments(c *gin.Context) {
	videoId := c.Param("videoId")
	moment := c.Param("moment")
	bucket := config.Cfg.AWS.BucketName
	keyMoments, err := uc.UploadService.GetKeyMoments(c, bucket, videoId, moment)
	if err != nil {
		log.Println("Error generating key moments:", err)

		utils.RespondError(c, http.StatusInternalServerError, fmt.Sprintf("error getting key moments: %v", err))
		return
	}
	utils.RespondJSON(c, http.StatusOK, gin.H{"message": "Key moments successfully generated", "moments": keyMoments})
}

func (uc *UploadController) DetectSilence(c *gin.Context) {
	videoId := c.Param("videoId")
	bucket := config.Cfg.AWS.BucketName
	silences, err := uc.UploadService.DetectSilence(c, bucket, videoId)
	if err != nil {
		log.Println("Error detecting silence:", err)

		utils.RespondError(c, http.StatusInternalServerError, fmt.Sprintf("error detecting silence: %v", err))
		return
	}
	utils.RespondJSON(c, http.StatusOK, gin.H{"message": "Silences successfully detected", "silences": silences})
}

func (uc *UploadController) TriggerSampleJob(c *gin.Context) {

	uc.UploadService.SampleJob(c)

	utils.RespondJSON(c, http.StatusOK, gin.H{"message": "Triggered smaple job"})
}
