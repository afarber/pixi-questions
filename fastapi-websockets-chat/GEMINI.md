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
  - Pixi.js is loaded from a CDN in `src/static/index.html`.

## Project Structure

- `src/main.py`: The main FastAPI application file containing the server logic and WebSocket handling.
- `src/static/`: Contains all frontend files.
  - `src/static/index.html`: The main HTML file.
  - `src/static/script.js`: The core JavaScript logic for the chat client, WebSocket connection, and Pixi.js canvas.
  - `src/static/style.css`: CSS styles for the application.
- `requirements.txt`: Lists the Python packages required for the project.

## Common Commands

- **Install dependencies**:
  ```bash
  pip install -r requirements.txt
  ```
- **Run the development server**:
  ```bash
  uvicorn src.main:app --reload
  ```