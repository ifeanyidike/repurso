package transport

import (
	"github.com/ifeanyidike/improv/internal/config"
	"github.com/ifeanyidike/improv/internal/controller"
	"github.com/ifeanyidike/improv/internal/repository"
	"github.com/ifeanyidike/improv/internal/service"
)

func (app *Application) InitUserTransport() *controller.UserController {
	// if config.DB == nil || config.DB.GetDB() == nil {
	// 	log.Fatal("Database not initialized")
	// }
	userRepo := repository.NewRepo(config.DB.GetDB(), config.DB.GetRedisClient())
	userService := service.NewUserService(userRepo)
	ctl := controller.NewUserController(userService)
	return ctl
}
