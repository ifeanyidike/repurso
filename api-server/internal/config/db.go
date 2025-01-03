package config

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"

	_ "github.com/lib/pq"
)


type Database interface {
	GetDB() *sql.DB
	GetRedisClient() *redis.Client
}

type database struct {
	db 			*sql.DB
	redisClient *redis.Client
}

var DB Database

func retryConnection(dsn string, maxRetries int, delay time.Duration) (*sql.DB, error){
	for i := 0; i < maxRetries; i++ {
		db, err := sql.Open("postgres", dsn)
		if err == nil {
			dbCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			if err = db.PingContext(dbCtx); err == nil {
				return db, nil
			}
			db.SetMaxOpenConns(30)
			db.SetConnMaxIdleTime(time.Duration(15 * 60))
			db.SetMaxIdleConns(30)
		}

		log.Printf("Database connection failed: %v. Retrying in %v...", err, delay)
		time.Sleep(delay)
	}

	return nil, fmt.Errorf("failed to connect to database after %d retries", maxRetries)
}

func InitDatabase(cfg *Config) (*sql.DB, *redis.Client, error) {
	// db, err := sql.Open("postgres", cfg.Database.DSN)
	// if err!= nil {
	// 	log.Println("Error opening database")
    //     return nil, nil, err
    // }

	// dbCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	// defer cancel()
	// if err := db.PingContext(dbCtx); err != nil {
	// 	log.Println("Error connecting to database")
	// 	return nil, nil, err
	// }

	// db.SetMaxOpenConns(30)
	// db.SetConnMaxIdleTime(time.Duration(15 * 60))
	// db.SetMaxIdleConns(30)

	db, err := retryConnection(cfg.Database.DSN, 5, 2*time.Second)
	if err != nil {
		log.Println("Failed to initialize database:", err)
		return nil, nil, err
	}


	// Verify DB connection
	// if err = db.Ping(); err != nil {
	// 	return err
	// }

	redisClient := redis.NewClient(&redis.Options{
        Addr:     fmt.Sprintf("%s:%s", cfg.Redis.Host, cfg.Redis.Port),
        Password: cfg.Redis.Password, 
        DB:       cfg.Redis.DB,  // use default DB
    })
	ctx, cancel := context.WithTimeout(context.Background(), 5 * time.Second)
	defer cancel()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Println("Error connecting to Redis")
		return nil, nil, err
	}
	DB = &database{
		db: db, 
		redisClient: redisClient,
	}
	
	return db, redisClient, nil
}

func (d *database) GetDB() *sql.DB {
	return d.db
}

func (d *database) GetRedisClient() *redis.Client {
	return d.redisClient
}

