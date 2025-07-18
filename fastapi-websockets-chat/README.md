# FastAPI PixiJS Chat

A real-time WebSockets chat application built with FastAPI and Pixi.js featuring an interactive canvas visualization of chat participants.

![screenshot](https://raw.github.com/afarber/pixi-questions/master/fastapi-websockets-chat/screenshot.gif)

## Overview

This application provides a real-time chat experience where users can:

- Enter their name and join a common chat channel
- See visual representations of all chat participants as colorful floating rectangles on a Pixi.js canvas
- Send and receive messages in real-time through WebSockets

## Features

- **Real-time Chat**: WebSocket-based messaging system
- **Visual User Representation**: Animated colorful rectangles representing each user
- **Mobile-Friendly UI**: Optimized for single-thumb usage
- **Name Validation**: Prevents duplicate usernames with visual feedback
- **Responsive Design**: Vertical layout suitable for mobile devices

## User Interface

The interface follows a simple, vertical layout optimized for mobile use:

1. **Top Section**: Pixi.js canvas displaying floating rectangles for each chat user
2. **Middle Section**: Scrollable chat window showing message history
3. **Bottom Section**: Text input field with Send button for new messages
4. **Join Flow**: Dropdown showing user count and name entry prompt
5. **Error Handling**: Red border animation for invalid/duplicate names

## Technology Stack

### Backend

- **FastAPI**: Modern Python web framework for APIs
- **uvicorn**: ASGI server for FastAPI
- **WebSockets**: Real-time communication protocol

### Frontend

- **Vite**: Modern build tool for frontend development
- **Pixi.js v8**: 2D rendering library for canvas animations (npm package)
- **Vanilla Javascript**: ES modules for the UI
- **WebSockets**: Real-time communication protocol

### Deployment

- **Docker Compose**: Container orchestration
- **Podman/Docker Desktop**: Container runtime options

## Getting Started

### Prerequisites

- Python 3.13+
- Node.js 18+
- Docker or Podman (for containerized deployment)
- Modern web browser with WebSocket support

### Installation & Setup

#### Using Docker

**Bash/Linux/macOS:**
```bash
./run-docker.sh
```

**PowerShell/Windows:**
```powershell
.\run-docker.ps1
```

#### Using Podman

**Bash/Linux/macOS:**
```bash
./run-podman.sh
```

**PowerShell/Windows:**
```powershell
.\run-podman.ps1
```

### Local Development

**Quick Start:**

**Bash/Linux/macOS:**
```bash
./run-local.sh
```

**PowerShell/Windows:**
```powershell
.\run-local.ps1
```

**Manual Steps:**

1. Clone the repository
2. Install frontend dependencies: `npm install`
3. Build frontend: `npm run build`
4. Set up Python environment: `python3 -m venv venv && source venv/bin/activate`
5. Install backend dependencies: `pip install -r requirements.txt`
6. Run the development server: `python3 -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000`
7. Open your browser to http://localhost:8000

## Project Structure

```
fastapi-websockets-chat/
├── README.md
├── .dockerignore
├── CLAUDE.md
├── docker-compose.yml
├── Dockerfile
├── GEMINI.md
├── requirements.txt
├── package.json              # Node.js dependencies
├── vite.config.js           # Vite configuration
├── index.html               # Main HTML file
├── run-docker.ps1
├── run-docker.sh
├── run-podman.ps1
├── run-podman.sh
├── run-local.ps1            # Local development (Windows)
├── run-local.sh             # Local development (Unix)
├── screenshot.gif
├── backend/
│   ├── main.py               # FastAPI application
│   └── connection_manager.py # WebSocket connection management
├── src/
│   ├── main.js               # Vite entry point
│   ├── pixi-canvas.js        # Pixi.js canvas rendering
│   └── main.css              # CSS styles
└── dist/                     # Vite build output (generated)
```

## License

This project is open source and available under the Public Domain License.
