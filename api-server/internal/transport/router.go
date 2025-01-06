package transport

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyidike/improv/internal/config"
	"github.com/ifeanyidike/improv/middleware"
)

type Application struct {
	*config.Config
}

// type config struct {
// 	addr string
// 	maxUploadSize int64
// }

func (app *Application) Run(mux http.Handler) error {
	srv := &http.Server{
		Addr:         app.Server.Address,
		Handler:      mux,
		WriteTimeout: time.Minute * 10,
		ReadTimeout:  time.Second * 10,
		IdleTimeout:  time.Minute,
	}

	log.Printf("server has started at %s", app.Server.Address)
	return srv.ListenAndServe()
}

func (app *Application) Mount() http.Handler {
	// mux := http.NewServeMux()

	// // Add routes here
	// mux.HandleFunc("GET /v1/health", app.healthCheckHandler)

	router := gin.Default()
	log.Println("max upload size", app.Server.MaxUploadSize)
	router.MaxMultipartMemory = app.Server.MaxUploadSize
	// router.Use(middleware.AuthMiddleware())

	//Middlewares
	router.Use(middleware.CORS())
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(gin.Logger())

	appUpload, notificationCtl := app.InitUploadTransport()
	appUser := app.InitUserTransport()
	authConfig := middleware.NewAuth0Config()

	v1 := router.Group("/v1")
	{
		upload := v1.Group("/upload")
		{
			upload.POST("/video", appUpload.UploadVideo)
			upload.POST("/child-audio", appUpload.UploadChildAudio)
			upload.POST("/child-image", appUpload.UploadChildImage)
			upload.POST("/child-video", appUpload.UploadChildVideo)
		}
		video := v1.Group("/video")
		{
			video.PUT("/autosave", appUpload.AutoSave)
			video.GET("/:videoId", appUser.GetVideo)
			video.PUT("/transcript/generate/:videoId", appUpload.GenerateTranscript)
			video.GET("/keymoments/:videoId/:moment", appUpload.GetKeyMoments)
			video.GET("/detect-silence/:videoId", appUpload.DetectSilence)
			video.Use(middleware.Auth0Middleware(authConfig)).GET("/samplejob", appUpload.TriggerSampleJob)
		}

		projects := v1.Group("/projects")
		{
			projects.POST("/create/:userId", appUser.CreateProject)
			projects.GET("/:userId", appUser.GetProjects)
			projects.GET("/videos/:id", appUser.GetVideos)
		}

		v1.Use(middleware.Auth0Middleware(authConfig)).POST("/register-user", appUser.RegisterUser)

		v1.GET("/health", app.healthCheckHandler)
		notificationCtl.RegisterRoutes(v1)

	}

	return router

	// 	r := chi.NewRouter()

	//   // A good base middleware stack
	//   r.Use(chiMiddleware.RequestID)
	//   r.Use(chiMiddleware.RealIP)
	//   r.Use(chiMiddleware.Logger)
	//   r.Use(chiMiddleware.Recoverer)
	//   r.Use(cors.Handler(cors.Options{
	//     // AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
	//     AllowedOrigins:   []string{"https://*", "http://*"},
	//     // AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
	//     AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	//     AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
	//     ExposedHeaders:   []string{"Link"},
	//     AllowCredentials: false,
	//     MaxAge:           300, // Maximum value not ignored by any of major browsers
	//   }))

	//   // Set a timeout value on the request context (ctx), that will signal
	//   // through ctx.Done() that the request has timed out and further
	//   // processing should be stopped.
	//   r.Use(chiMiddleware.Timeout(60 * time.Second))

	//   r.Route("/v1", func(r chi.Router) {
	// 	r.Get("/health", app.healthCheckHandler)
	//   })

	// return r
}
