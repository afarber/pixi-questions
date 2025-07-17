#!/bin/bash -eu

# FastAPI WebSocket Chat - Podman Deployment Script
echo "Starting FastAPI WebSocket Chat with Podman..."

# Check if Podman is installed
if ! command -v podman &> /dev/null; then
    echo "ERROR: Podman is not installed. Please install Podman first."
    exit 1
fi

# Check if podman-compose is installed
if ! command -v podman-compose &> /dev/null; then
    echo "ERROR: Podman Compose is not installed. Please install podman-compose first."
    echo "Install with: pip install podman-compose"
    exit 1
fi

# Build and start the services
echo "Building Podman image..."
podman-compose build

echo "Starting services..."
podman-compose up -d

# Wait for service to be ready
echo "Waiting for service to be ready..."
sleep 10

# Check if service is running
if podman-compose ps | grep -q "Up"; then
    echo "SUCCESS: Service is running successfully!"
    echo "Access the chat at: http://localhost:8000"
    echo ""
    echo "Service status:"
    podman-compose ps
    echo ""
    echo "To view logs: podman-compose logs -f"
    echo "To stop: podman-compose down"
else
    echo "ERROR: Service failed to start. Check logs:"
    podman-compose logs
    exit 1
fi