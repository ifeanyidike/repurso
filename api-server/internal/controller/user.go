package controller

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyidike/improv/internal/service"
	"github.com/ifeanyidike/improv/internal/types"
)

type RegisterUserRequest struct {
	Auth0ID       string `json:"user_id" binding:"required"`
	Email         string `json:"email" binding:"required"`
	Name          string `json:"name" binding:"required"`
	Picture       string `json:"picture"`
	EmailVerified bool   `json:"email_verified" binding:"required" default:"true"`
}

type UserController struct {
	UserService service.UserServicer
}

func NewUserController(userService service.UserServicer) *UserController {
	return &UserController{userService}
}

func (c *UserController) RegisterUser(ctx *gin.Context) {
	var req RegisterUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}

	auth0_id := req.Auth0ID
	email := req.Email
	name := req.Name
	picture := req.Picture
	email_verified := req.EmailVerified

	err := c.UserService.RegisterUser(ctx, auth0_id, email, name, picture, email_verified)

	if err != nil {
		log.Printf("Error registering user: %s", err.Error())
		ctx.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("could not register user: %v", err)})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Registration successful"})
}

func (c *UserController) GetProjects(ctx *gin.Context) {
	userId := ctx.Param("user_id")
	projects, err := c.UserService.GetProjects(ctx, userId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "could not get projects"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"projects": projects})
}

func (c *UserController) GetVideos(ctx *gin.Context) {
	projectId := ctx.Param("id")
	videos, err := c.UserService.GetVideos(ctx, projectId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "could not get videos"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"videos": videos})
}

func (c *UserController) GetVideo(ctx *gin.Context) {
	videoId := ctx.Param("id")
	videos, err := c.UserService.GetVideos(ctx, videoId)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "could not get videos"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"videos": videos})
}

func (u *UserController) CreateProject(ctx *gin.Context) {

	var p types.ProjectInsertParams
	userId := ctx.Param("userId")
	if err := ctx.BindJSON(&p); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p.UserID = userId

	projectId, err := u.UserService.CreateProject(ctx, p)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "could not create project"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Project created successfully", "id": projectId})
}
