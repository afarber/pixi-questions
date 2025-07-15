# FastAPI Reflex PixiJS Chat

A real-time WebSocket chat application built with FastAPI, Reflex, and Pixi.js featuring an interactive canvas visualization of chat participants.

![screenshot](https://raw.github.com/afarber/pixi-questions/master/fastapi-reflex-pixijs-chat/screenshot.png)

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
- **Python Reflex**: Full-stack Python framework
- **uvicorn**: ASGI server for FastAPI

### Frontend
- **Pixi.js v8**: 2D rendering library for canvas animations
- **WebSockets**: Real-time communication protocol

### Deployment
- **Docker Compose**: Container orchestration
- **Podman/Docker Desktop**: Container runtime options

## Getting Started

### Prerequisites

- Python 3.8+
- Docker or Podman
- Modern web browser with WebSocket support

### Installation & Setup

#### Using Docker
```bash
./run-docker.sh
```

#### Using Podman
```bash
./run-podman.sh
```

### Development

1. Clone the repository
2. Install dependencies
3. Run the development server
4. Open your browser to the application URL

## Project Structure

```
fastapi-reflex-pixijs-chat/
├── README.md
├── run-docker.sh      # Docker deployment script
├── run-podman.sh      # Podman deployment script
├── docker-compose.yml # Container orchestration
├── Dockerfile         # Container definition
├── requirements.txt   # Python dependencies
├── src/               # Source code
│   ├── main.py        # FastAPI application
│   ├── chat/          # Chat logic
│   └── static/        # Static assets
└── assets/            # Frontend assets
    └── pixi/          # Pixi.js components
```

## API Documentation

Once running, API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## License

This project is open source and available under the Public Domain License.


