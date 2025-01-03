package main

import (
	"fmt"
	"log"

	"github.com/ifeanyidike/improv/internal/config"
	"github.com/ifeanyidike/improv/internal/transport"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Failed to load the env vars: %v", err)
	}
	cfg := config.NewConfig()
	db, redisClient, err := config.InitDatabase(cfg)
	if err != nil {
		log.Fatalf("Error initializing database and redis: %v", err)
		log.Panic(err)
	}
	grpcConn, err := config.NewMediaAnalysis().ConnectToService()
	if err != nil {
		log.Fatalf("Error connecting to media analysis service: %v", err)
	}
	defer grpcConn.Close()
	fmt.Println("Database and redis connection")
	defer db.Close()
	defer redisClient.Close()
	// cfg := config{
	// 	addr: config.("SERVER_ADDRESS", ":8081"),
	// 	maxUploadSize: int64(1024 * 1024 * 1024 * 3),
	// }

	app := &transport.Application{
		Config: cfg,
	}
	mux := app.Mount()
	log.Fatal(app.Run(mux))
	// app := &application{
	// 	config: cfg,
	// }
	// mux := app.mount()
	// log.Fatal(app.run(mux))
}
