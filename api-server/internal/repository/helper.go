package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/redis/go-redis/v9"
)

func fetchFromCache[T any](ctx context.Context, client *redis.Client, key string) (*T, error) {
	// Fetch object from Redis
	cached, err := client.Get(ctx, key).Result()
	if err != nil {
		log.Printf("Error fetching object from Redis: %v", err)

		if err == redis.Nil {
			return nil, nil // Cache miss
		}
		return nil, errors.New("failed to get object from Redis")
	}

	if cached == "" {
		return nil, nil
	}
	// Redis cache hit
	var result T
	if err := json.Unmarshal([]byte(cached), &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func storeToCache[T any](ctx context.Context, client *redis.Client, object T, key string) error {
	// Marshal object to JSON
	jsonData, err := json.Marshal(object)
	if err != nil {
		log.Printf("Error marshaling object to JSON: %v", err)
		return fmt.Errorf("failed to marshal object %w", err)
	}
	// Store object in Redis
	if err = client.Set(ctx, key, jsonData, 0).Err(); err != nil {
		log.Printf("Error storing object in Redis: %v", err)
		return fmt.Errorf("error storing object in Redis: %w", err)
	}
	return nil
}

func updateCache[T any](ctx context.Context, client *redis.Client, cacheKey string, updateFunc func(*T) error) error {
	cache, err := fetchFromCache[T](ctx, client, cacheKey)
	if err != nil {
		return err
	}
	if cache == nil {
		return errors.New("object not found in cache")
	}

	if err := updateFunc(cache); err != nil {
		return err
	}

	return storeToCache(ctx, client, *cache, cacheKey)
}
