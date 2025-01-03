package main

// import (
// 	"log"
// 	"net/http"
// 	"time"

// 	"github.com/gin-gonic/gin"
// 	"github.com/ifeanyidike/improv/middleware"
// )

// type application struct {
// 	config config
// }

// type config struct {
// 	addr string
// 	maxUploadSize int64
// }

// func (app *application) run(mux http.Handler) error {
// 	srv := &http.Server{
// 		Addr: app.config.addr,
// 		Handler: mux,
// 		WriteTimeout: time.Second * 30,
// 		ReadTimeout: time.Second * 10,
// 		IdleTimeout: time.Minute,
// 	}

// 	log.Printf("server has started at %s", app.config.addr)
// 	return srv.ListenAndServe()
// }

// func (app *application) mount() http.Handler{
// 	// mux := http.NewServeMux()

//     // // Add routes here
// 	// mux.HandleFunc("GET /v1/health", app.healthCheckHandler)

// 	router := gin.Default()
// 	router.MaxMultipartMemory = app.config.maxUploadSize
// 	// router.Use(middleware.AuthMiddleware())

// 	//Middlewares
// 	router.Use(middleware.CORS())
// 	router.Use(gin.Logger())
// 	router.Use(gin.Recovery())
// 	router.Use(gin.Logger())

// 	v1 := router.Group("/v1")
// 	{
// 		// v1.POST("/upload", app.uploadVideo)

//         v1.GET("/health", app.healthCheckHandler)

// 	}

// 	return router

// // 	r := chi.NewRouter()

// //   // A good base middleware stack
// //   r.Use(chiMiddleware.RequestID)
// //   r.Use(chiMiddleware.RealIP)
// //   r.Use(chiMiddleware.Logger)
// //   r.Use(chiMiddleware.Recoverer)
// //   r.Use(cors.Handler(cors.Options{
// //     // AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
// //     AllowedOrigins:   []string{"https://*", "http://*"},
// //     // AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
// //     AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
// //     AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
// //     ExposedHeaders:   []string{"Link"},
// //     AllowCredentials: false,
// //     MaxAge:           300, // Maximum value not ignored by any of major browsers
// //   }))

// //   // Set a timeout value on the request context (ctx), that will signal
// //   // through ctx.Done() that the request has timed out and further
// //   // processing should be stopped.
// //   r.Use(chiMiddleware.Timeout(60 * time.Second))

// //   r.Route("/v1", func(r chi.Router) {
// // 	r.Get("/health", app.healthCheckHandler)
// //   })

// //   return r
// }