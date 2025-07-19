#!/bin/bash -eu

# Local development script for FastAPI PixiJS Chat
# Builds frontend and runs FastAPI backend locally

echo "Starting FastAPI PixiJS Chat - Local Development"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 18+ to continue."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.8+ to continue."
    exit 1
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "Frontend dependencies already installed"
fi

# Run tests to ensure code quality
echo "Running frontend tests..."
npm run test:run

# Build frontend
echo "Building frontend..."
npm run build

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Start FastAPI server
echo "Starting FastAPI server..."
echo "Frontend available at: http://localhost:8000"
echo "Backend API docs at: http://localhost:8000/docs"
echo "Health check at: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
