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

- **Vanilla Javascript**: Plain Javascript for the UI
- **Pixi.js v8**: 2D rendering library for canvas animations loaded via CDN https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.min.js
- **WebSockets**: Real-time communication protocol

### Deployment

- **Docker Compose**: Container orchestration
- **Podman/Docker Desktop**: Container runtime options

## Getting Started

### Prerequisites

- Python 3
- Docker or Podman
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

### Development

1. Clone the repository
2. Install dependencies
3. Run the development server
4. Open your browser to the application URL

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
├── run-docker.ps1
├── run-docker.sh
├── run-podman.ps1
├── run-podman.sh
├── screenshot.gif
├── backend/
│   └── main.py        # FastAPI application
└── frontend/
    ├── index.html     # Main HTML file
    ├── script.js      # Frontend JavaScript (WebSocket + Pixi.js)
    └── style.css      # CSS styles
```

## License

This project is open source and available under the Public Domain License.
