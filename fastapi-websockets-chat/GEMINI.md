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
  - Vanilla JavaScript (ES6)
  - Pixi.js v8
  - HTML5
  - CSS3
- **Dependencies**:
  - Python dependencies are listed in `requirements.txt`.
  - Pixi.js is loaded from a CDN in `frontend/index.html`.

## Project Structure

- `backend/main.py`: The main FastAPI application file containing the server logic and WebSocket handling.
- `backend/connection_manager.py`: Manages active WebSocket connections and user state.
- `frontend/`: Contains all frontend files.
  - `frontend/index.html`: The main HTML file.
  - `frontend/script.js`: The core JavaScript logic for the chat client and WebSocket connection.
  - `frontend/pixi-canvas.js`: Pixi.js canvas rendering and user visualization.
  - `frontend/style.css`: CSS styles for the application.
- `requirements.txt`: Lists the Python packages required for the project.

## Common Commands

```bash
python3 -m venv venv
. ./venv/bin/activate
pip3 install -r requirements.txt
# Run "python3 -m uvicorn" and not just "uvicorn" to use the venv version
python3 -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```
