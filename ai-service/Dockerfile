# # # Use the official Python image
# # FROM python:3.12.7-slim

# # # Set working directory
# # WORKDIR /app

# # # Install ffmpeg and other dependencies
# # RUN apt-get update && apt-get install -y \
# #     ffmpeg \
# #     && rm -rf /var/lib/apt/lists/*

# # # Copy and install dependencies
# # COPY requirements.txt .
# # RUN pip install --no-cache-dir -r requirements.txt

# # # Copy the application code
# # COPY . .

# # # Expose the port FastAPI will run on
# # EXPOSE 50051

# # # Start the FastAPI service
# # CMD ["python3", "main.py"]
# # CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "443"]
# # CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "50051", "--http", "h2"]
# # CMD ["hypercorn", "main:app", "--host", "0.0.0.0", "--port", "50051", "--ssl-keyfile", "/app/key.pem", "--ssl-certfile", "/app/cert.pem"]
# # CMD ["hypercorn", "main:app", "--bind", "0.0.0.0:50051", "--certfile", "/app/cert.pem", "--keyfile", "/app/key.pem", "--h2"]


# # Stage 1: Build dependencies
# # FROM python:3.11-slim as builder

# # WORKDIR /app

# # RUN apt-get update && apt-get install -y --no-install-recommends \
# #     gcc \
# #     libffi-dev \
# #     libssl-dev \
# #     && apt-get clean && rm -rf /var/lib/apt/lists/*

# # RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# # COPY requirements.txt .
# # RUN pip install --no-cache-dir -r requirements.txt
# # RUN python -m spacy download en_core_web_sm

# # # Stage 2: Final image
# # FROM python:3.12.7-slim

# # WORKDIR /app

# # RUN apt-get update && apt-get install -y --no-install-recommends \
# #     ffmpeg \
# #     && apt-get clean && rm -rf /var/lib/apt/lists/*

# # COPY --from=builder /app/deps /usr/local/lib/python3.12/site-packages
# # COPY . .

# # RUN useradd -m appuser
# # USER appuser

# # EXPOSE 50051

# # CMD ["python", "main.py"]

# # Use Python 3.11 for compatibility
# FROM python:3.11-slim

# # Set working directory
# WORKDIR /app

# # Install system dependencies
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     gcc \
#     g++ \
#     libffi-dev \
#     libssl-dev \
#     libbz2-dev \
#     zlib1g-dev \
#     ffmpeg \
#     && apt-get clean && rm -rf /var/lib/apt/lists/*

# # Upgrade pip, setuptools, and install wheel
# RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# # Pre-install numpy to satisfy spacy dependencies
# RUN pip install --no-cache-dir numpy

# # Copy requirements.txt first to leverage caching
# COPY requirements.txt .

# # Install Python dependencies
# RUN pip install --no-cache-dir -r requirements.txt

# # Download spacy language model
# RUN python -m spacy download en_core_web_sm

# # Copy application code
# COPY . .

# # Expose the port FastAPI will run on
# EXPOSE 50051

# # Set a non-root user for better security
# # RUN useradd -m appuser
# # USER appuser

# # Start the application
# CMD ["python", "main.py"]


# # Use CUDA-compatible base image
# FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

# # Prevent interactive prompts during package installation
# ENV DEBIAN_FRONTEND=noninteractive
# ENV PYTHONUNBUFFERED=1

# # Set working directory
# WORKDIR /app

# # Install system dependencies including Python
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     python3.11 \
#     python3-pip \
#     python3.11-dev \
#     git \
#     gcc \
#     g++ \
#     make \
#     wget \
#     ffmpeg \
#     libsm6 \
#     libxext6 \
#     libssl-dev \
#     libffi-dev \
#     libbz2-dev \
#     zlib1g-dev \
#     tesseract-ocr \
#     && rm -rf /var/lib/apt/lists/*

# # Upgrade pip and install basic packages
# RUN python -m pip install --no-cache-dir --upgrade pip setuptools wheel

# # Copy requirements files
# COPY requirements.txt .

# # Install the rest of the Python dependencies
# RUN pip install --no-cache-dir -r requirements.txt

# # Download spacy language model
# RUN python -m spacy download en_core_web_sm

# # Copy application code
# COPY . .

# # Expose the port your service runs on
# EXPOSE 50051

# # Command to run the application
# CMD ["python", "main.py"]

# # Use Python base image
# FROM python:3.11-slim

# # Prevent interactive prompts
# ENV DEBIAN_FRONTEND=noninteractive
# ENV PYTHONUNBUFFERED=1

# # Set working directory
# WORKDIR /app

# # Install system dependencies including git and ffmpeg
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     git \
#     ffmpeg \
#     libsm6 \
#     libxext6 \
#     gcc \
#     g++ \
#     make \
#     tesseract-ocr \
#     && rm -rf /var/lib/apt/lists/*

# # Upgrade pip and install basic packages
# RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# # Copy requirements file
# COPY requirements.txt .

# # Install Python dependencies
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy application code
# COPY . .

# # Expose port
# EXPOSE 50051

# # Command to run the application
# CMD ["python", "main.py"]


# Use multi-platform Python base image
FROM --platform=$BUILDPLATFORM python:3.11-slim as builder

# Build arguments for platform support
ARG BUILDPLATFORM
ARG TARGETPLATFORM
ARG USE_CUDA=false

# Print platform info for debugging
RUN echo "Building on $BUILDPLATFORM for $TARGETPLATFORM"

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    ffmpeg \
    libsm6 \
    libxext6 \
    gcc \
    g++ \
    make \
    cmake \
    pkg-config \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install basic packages
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Copy requirements files
COPY requirements-base.txt requirements-cuda.txt requirements-cpu.txt ./

# Install dependencies based on platform and CUDA flag
RUN if [ "$USE_CUDA" = "true" ] && [ "$TARGETPLATFORM" = "linux/amd64" ]; then \
        pip install --no-cache-dir -r requirements-base.txt -r requirements-cuda.txt; \
    else \
        pip install --no-cache-dir -r requirements-base.txt -r requirements-cpu.txt; \
    fi

# Copy application code
COPY . .

# Expose port
EXPOSE 50051

# Command to run the application
CMD ["python", "main.py"]