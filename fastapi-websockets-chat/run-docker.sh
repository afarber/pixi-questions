#!/bin/bash -eu

# FastAPI WebSocket Chat - Docker Deployment Script
echo "Starting FastAPI WebSocket Chat with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Build and start the services
echo "Building Docker image..."
docker-compose build

echo "Starting services..."
docker-compose up -d

# Wait for service to be ready
echo "Waiting for service to be ready..."
sleep 10

# Check if service is running
if docker-compose ps | grep -q "Up"; then
    echo "SUCCESS: Service is running successfully!"
    echo "Access the chat at: http://localhost:8000"
    echo ""
    echo "Service status:"
    docker-compose ps
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop: docker-compose down"
else
    echo "ERROR: Service failed to start. Check logs:"
    docker-compose logs
    exit 1
fi