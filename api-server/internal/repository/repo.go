package repository

import (
	"context"
	"database/sql"

	"github.com/ifeanyidike/improv/internal/types"
	"github.com/redis/go-redis/v9"
)

type Repo interface {
	SaveUpload(ctx context.Context, uniqueID, fileURL, transcriptionURL string) error
	GetUpload(ctx context.Context, uniqueID string) (map[string]interface{}, error)
	FindUserByAuth0ID(ctx context.Context, auth0ID string) (*types.User, error)
	CreateUser(ctx context.Context, auth0ID, email, name, picture string, email_verified bool) error
	CreateProject(ctx context.Context, t types.ProjectInsertParams) (string, error)
	CreateVideo(ctx context.Context, t types.VideoInsertParams) error
	GetProjects(ctx context.Context, userID string) (*[]types.ProjectGetParams, error)
	GetVideos(ctx context.Context, project_id string) (*[]types.VideosGetParams, error)
	GetVideo(ctx context.Context, video_id string) (*types.VideoGetParams, error)
	CreateChildAudio(ctx context.Context, audio *types.ChildAudio, parentVideoId string) error
	CreateChildImage(ctx context.Context, image *types.ChildImage, parentVideoId string) error
	CreateChildVideo(ctx context.Context, video *types.ChildVideo, parentVideoId string) error
	AutoSaveVideo(ctx context.Context, video_id string, updates *types.VideoGetParams) error
	GetVideoAudio(ctx context.Context, videoId string) (string, error)
	SaveTranscript(ctx context.Context, transcriptUrl string, videoId string) error
}

type repo struct {
	db    *sql.DB
	redis *redis.Client
}

func NewRepo(db *sql.DB, redis *redis.Client) Repo {
	return &repo{db: db, redis: redis}
}
