# FastAPI WebSocket Chat - Docker Deployment Script (PowerShell)
param(
    [switch]$Help
)

if ($Help) {
    Write-Host "FastAPI WebSocket Chat - Docker Deployment Script"
    Write-Host "Usage: .\run-docker.ps1"
    Write-Host "Options:"
    Write-Host "  -Help    Show this help message"
    exit 0
}

Write-Host "Starting FastAPI WebSocket Chat with Docker..." -ForegroundColor Green

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker is not installed. Please install Docker first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is installed
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

try {
    # Build and start the services
    Write-Host "Building Docker image..." -ForegroundColor Yellow
    docker-compose build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker build failed" -ForegroundColor Red
        exit 1
    }

    Write-Host "Starting services..." -ForegroundColor Yellow
    docker-compose up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to start services" -ForegroundColor Red
        exit 1
    }

    # Wait for service to be ready
    Write-Host "Waiting for service to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10

    # Check if service is running
    $status = docker-compose ps
    if ($status -match "Up") {
        Write-Host "SUCCESS: Service is running successfully!" -ForegroundColor Green
        Write-Host "Access the chat at: http://localhost:8000" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Service status:" -ForegroundColor Blue
        docker-compose ps
        Write-Host ""
        Write-Host "To view logs: docker-compose logs -f" -ForegroundColor Blue
        Write-Host "To stop: docker-compose down" -ForegroundColor Blue
    } else {
        Write-Host "ERROR: Service failed to start. Check logs:" -ForegroundColor Red
        docker-compose logs
        exit 1
    }
}
catch {
    Write-Host "ERROR: An error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}