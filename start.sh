#!/bin/bash

# Define the image name and tag
IMAGE_NAME="sukasa_service"
TAG="latest"

# Step 1: Build the Docker image and tag it
echo "Building Docker image..."
docker build -t ${IMAGE_NAME}:${TAG} .

# Step 2: Start the services with docker-compose
echo "Starting services with docker-compose..."
docker-compose up -d --build

echo "Services started. The '${IMAGE_NAME}:${TAG}' image has been built and tagged."
