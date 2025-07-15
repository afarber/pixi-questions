# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture (Based on README Specification)

This is a real-time WebSocket chat application with the following architecture:

### Backend Stack
- **FastAPI**: Python web framework for API endpoints
- **Python Reflex**: Full-stack Python framework
- **uvicorn**: ASGI server for FastAPI
- **WebSockets**: Real-time communication

### Frontend Stack
- **Pixi.js v8**: 2D rendering library for canvas animations
- **WebSockets**: Real-time communication protocol

### Expected Project Structure
```
fastapi-reflex-pixijs-chat/
├── src/
│   ├── main.py        # FastAPI application entry point
│   ├── chat/          # Chat logic modules
│   └── static/        # Static assets
├── assets/
│   └── pixi/          # Pixi.js components
├── requirements.txt   # Python dependencies
├── docker-compose.yml # Container orchestration
├── Dockerfile         # Container definition
├── run-docker.sh      # Docker deployment script
└── run-podman.sh      # Podman deployment script
```

## Key Features to Implement

1. **Real-time Chat**: WebSocket-based messaging system
2. **Visual User Representation**: Animated colorful rectangles for each user on Pixi.js canvas
3. **Mobile-Friendly UI**: Optimized for single-thumb usage with vertical layout
4. **Name Validation**: Prevents duplicate usernames with visual feedback
5. **Responsive Design**: Three-section layout (canvas, chat, input), bottom drawer for the user name dialog

## Development Commands (When Implemented)

Based on the README specification, the following commands will be used:

### Docker Development
```bash
./run-docker.sh
```

### Podman Development
```bash
./run-podman.sh
```

## Implementation Notes

- The application uses a vertical layout optimized for mobile devices
- Chat participants are visualized as floating rectangles (random pastel colors with user names as labels) on a Pixi.js canvas
- WebSocket connections handle real-time messaging and reconnect after short random backoff delay
- Name validation prevents duplicate usernames with red border animation feedback, max name length ist 16
- The UI follows a three-section layout: canvas (top), chat window (middle), input field (bottom)

## Next Steps for Implementation

1. Create the basic FastAPI application structure
2. Implement WebSocket chat functionality
3. Add Pixi.js canvas integration for user visualization
4. Create the mobile-optimized UI layout
5. Add Docker/Podman deployment configuration
6. Implement name validation and error handling

