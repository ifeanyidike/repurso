package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/ifeanyidike/improv/internal/repository"
	"github.com/ifeanyidike/improv/internal/types"
)

type UserServicer interface {
	RegisterUser(ctx context.Context, auth0Id, email, name, picture string, email_verified bool) error
	GetProjects(ctx context.Context, userId string) ([]types.ProjectGetParams, error)
	GetVideos(ctx context.Context, projectId string) ([]types.VideosGetParams, error)
	GetVideo(ctx context.Context, videoId string) (*types.VideoGetParams, error)
	CreateProject(ctx context.Context, t types.ProjectInsertParams) (string, error)
}

type userService struct {
	repo repository.Repo
}

func NewUserService(repo repository.Repo) UserServicer {
	return &userService{repo: repo}
}

func (s *userService) RegisterUser(ctx context.Context, auth0Id, email, name, picture string, email_verified bool) error {
	user, err := s.repo.FindUserByAuth0ID(ctx, auth0Id)

	if err != nil {
		fmt.Println("error:", err)
		return err
	}

	if user != nil {
		return errors.New("user already exists")
	}

	if err := s.repo.CreateUser(ctx, auth0Id, email, name, picture, email_verified); err != nil {
		return err
	}
	return nil
}

func (s *userService) GetProjects(ctx context.Context, userId string) ([]types.ProjectGetParams, error) {
	projects, err := s.repo.GetProjects(ctx, userId)
	if err != nil {
		return nil, err
	}
	return *projects, nil
}

func (s *userService) GetVideos(ctx context.Context, projectId string) ([]types.VideosGetParams, error) {
	videos, err := s.repo.GetVideos(ctx, projectId)
	if err != nil {
		return nil, err
	}
	return *videos, nil
}

func (s *userService) GetVideo(ctx context.Context, videoId string) (*types.VideoGetParams, error) {
	video, err := s.repo.GetVideo(ctx, videoId)
	if err != nil {
		return nil, err
	}
	return video, nil
}

func (s *userService) CreateProject(ctx context.Context, t types.ProjectInsertParams) (string, error) {
	return s.repo.CreateProject(ctx, t)
}
