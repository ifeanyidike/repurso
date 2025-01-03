package config

import (
	"log"
	"os"
	"strconv"
)

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Printf("Using default value for %s: %s", key, fallback)
		return fallback
	}
	return value
}

func getEnvAsInt(key string, fallback int) int {
	valueStr := getEnv(key, "")
	if valueStr == "" {
		return fallback
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		log.Printf("Invalid int for %s, using fallback: %d", key, fallback)
		return fallback
	}
	return value
}