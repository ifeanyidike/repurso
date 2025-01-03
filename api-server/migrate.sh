#!/bin/bash
case "$1" in
    "up")
        docker-compose run --rm migrate -path=/migrations -database=postgres://$DB_USERNAME:$BS_PASSWORD@db:5432/$DB_NAME?sslmode=disable up
        ;;
    "down")
        docker-compose run --rm migrate -path=/migrations -database=postgres://$DB_USERNAME:$DBS_PASSWORD@db:5432/$DB_NAME?sslmode=disable down
        ;;
    *)
        echo "Usage: $0 {up|down}"
        exit 1
        ;;
esac
