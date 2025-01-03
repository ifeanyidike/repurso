package config

import (
	"fmt"
	"sync"
)

type Config struct {
	Server   ServerConfig
	Database DBConfig
	Redis    RedisConfig
	AWS      AWSConfig
}

type ServerConfig struct {
	Address       string
	MaxUploadSize int64
}

type DBConfig struct {
	DSN string
}

type RedisConfig struct {
	// Address  string
	Host     string
	Port     string
	Password string
	DB       int
}

type AWSConfig struct {
	Region     string
	BucketName string
}

var (
	once sync.Once
	Cfg  *Config
)

func NewConfig() *Config {

	once.Do(func() {
		Cfg = &Config{
			Server: ServerConfig{
				Address:       getEnv("SERVER_ADDRESS", ":8080"),
				MaxUploadSize: 3 * 1024 * 1024 * 1024,
			},
			Database: DBConfig{
				DSN: fmt.Sprintf("postgres://%s:%s@%s:5432/%s?sslmode=disable",
					getEnv("DB_USERNAME", "ifeanyidike"),
					getEnv("BS_PASSWORD", "pass"),
					getEnv("DB_HOST", "db"),
					getEnv("DB_NAME", "repursodb"),
				),
			},
			Redis: RedisConfig{
				// Address:  getEnv("REDIS_ADDRESS", "localhost:6379"),
				Host:     getEnv("REDIS_HOST", "localhost"),
				Port:     getEnv("REDIS_PORT", "6379"),
				Password: getEnv("REDIS_PASSWORD", ""),
				DB:       getEnvAsInt("REDIS_DB", 0),
			},
			AWS: AWSConfig{
				Region:     getEnv("AWS_REGION", "eu-west-1"),
				BucketName: getEnv("bucket_name", "repurposerapp-bucket"),
			},
		}
	})

	return Cfg
}
