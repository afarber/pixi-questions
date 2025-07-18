# Gemini Project Guidance

This document provides context and guidance for interacting with the FastAPI PixiJS Chat project.

## Project Overview

This is a real-time chat application built with a Python FastAPI backend and a vanilla JavaScript frontend. It uses WebSockets for real-time communication and Pixi.js to create a visual representation of chat participants on an HTML5 canvas.

The application allows users to join a chat room, send messages, and see other users visualized as animated rectangles.

## Tech Stack

- **Backend**:
  - Python 3
  - FastAPI
  - `uvicorn` (ASGI server)
  - `websockets`
- **Frontend**:
  - Vite (build tool)
  - Modern JavaScript (ES6 modules)
  - Pixi.js v8 (npm package)
  - HTML5
  - CSS3
- **Dependencies**:
  - Python dependencies are listed in `requirements.txt`.
  - Node.js dependencies are listed in `package.json`.

## Project Structure

- `backend/main.py`: The main FastAPI application file containing the server logic and WebSocket handling.
- `backend/connection_manager.py`: Manages active WebSocket connections and user state.
- `package.json`: Node.js dependencies and build scripts.
- `vite.config.js`: Vite configuration for frontend build process.
- `index.html`: The main HTML file.
- `src/`: Contains all frontend source files.
  - `src/main.js`: The main JavaScript entry point with chat client and WebSocket connection.
  - `src/pixi-canvas.js`: Pixi.js canvas rendering and user visualization.
  - `src/main.css`: CSS styles for the application.
- `dist/`: Vite build output (generated).
- `requirements.txt`: Lists the Python packages required for the project.

## Common Commands

### Local Development

```bash
# Quick start
./run-local.sh

# Manual steps
npm install
npm run build
python3 -m venv venv
. ./venv/bin/activate
pip3 install -r requirements.txt
python3 -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Development

```bash
# Install dependencies
npm install

# Development server (frontend only)
npm run dev

# Build for production
npm run build
```
