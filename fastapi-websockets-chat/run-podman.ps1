# FastAPI WebSocket Chat - Podman Deployment Script (PowerShell)
param(
    [switch]$Help
)

if ($Help) {
    Write-Host "FastAPI WebSocket Chat - Podman Deployment Script"
    Write-Host "Usage: .\run-podman.ps1"
    Write-Host "Options:"
    Write-Host "  -Help    Show this help message"
    exit 0
}

Write-Host "Starting FastAPI WebSocket Chat with Podman..." -ForegroundColor Green

# Check if Podman is installed
if (-not (Get-Command podman -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Podman is not installed. Please install Podman first." -ForegroundColor Red
    exit 1
}

# Check if podman-compose is installed
if (-not (Get-Command podman-compose -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Podman Compose is not installed. Please install podman-compose first." -ForegroundColor Red
    Write-Host "Install with: pip install podman-compose" -ForegroundColor Yellow
    exit 1
}

try {
    # Build and start the services
    Write-Host "Building Podman image..." -ForegroundColor Yellow
    podman-compose build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Podman build failed" -ForegroundColor Red
        exit 1
    }

    Write-Host "Starting services..." -ForegroundColor Yellow
    podman-compose up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to start services" -ForegroundColor Red
        exit 1
    }

    # Wait for service to be ready
    Write-Host "Waiting for service to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10

    # Check if service is running
    $status = podman-compose ps
    if ($status -match "Up") {
        Write-Host "SUCCESS: Service is running successfully!" -ForegroundColor Green
        Write-Host "Access the chat at: http://localhost:8000" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Service status:" -ForegroundColor Blue
        podman-compose ps
        Write-Host ""
        Write-Host "To view logs: podman-compose logs -f" -ForegroundColor Blue
        Write-Host "To stop: podman-compose down" -ForegroundColor Blue
    } else {
        Write-Host "ERROR: Service failed to start. Check logs:" -ForegroundColor Red
        podman-compose logs
        exit 1
    }
}
catch {
    Write-Host "ERROR: An error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}