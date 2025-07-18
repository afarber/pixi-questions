# Local development script for FastAPI PixiJS Chat
# Builds frontend and runs FastAPI backend locally

Write-Host "Starting FastAPI PixiJS Chat - Local Development" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed. Please install Node.js 18+ to continue." -ForegroundColor Red
    exit 1
}

# Check if Python is installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Python 3 is not installed. Please install Python 3.8+ to continue." -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "Frontend dependencies already installed" -ForegroundColor Green
}

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Start FastAPI server
Write-Host "Starting FastAPI server..." -ForegroundColor Green
Write-Host "Frontend available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Backend API docs at: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Health check at: http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000