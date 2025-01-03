# Build stage
FROM golang:1.23.1-alpine AS builder

# Set the working directory
WORKDIR /app

# Install necessary tools and dependencies
RUN apk add --no-cache \
    ffmpeg \
    libmad \
    libsndfile \
    libid3tag \
    gd \
    boost \
    wget \
    curl \
    bash

COPY --from=csandman/audiowaveform /bin/audiowaveform /usr/local/bin

# Copy Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application files
COPY . .

# Build the Go application
RUN go build -o /app/api cmd/api/main.go

# Run stage
FROM alpine:3.18

# Copy the built application from the builder stage
COPY --from=builder /app/api /app/api

# Expose port
EXPOSE 8080

# Run the API server
CMD ["/app/api"]
