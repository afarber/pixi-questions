# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture (Based on README Specification)

This is a real-time WebSocket chat application with the following architecture:

### Backend Stack

- **FastAPI**: Python web framework for API endpoints
- **uvicorn**: ASGI server for FastAPI
- **WebSockets**: Real-time communication protocol

### Frontend Stack

- **Vite**: Modern build tool for frontend development
- **Pixi.js v8**: 2D rendering library for canvas animations (npm package)
- **Vanilla Javascript**: ES modules for the UI
- **WebSockets**: Real-time communication protocol

### Expected Project Structure

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

## Key Features to Implement

1. **Real-time Chat**: WebSocket API based messaging system
2. **Visual User Representation**: Animated colorful rectangles for each user on Pixi.js canvas
3. **Mobile-Friendly UI**: Optimized for single-thumb usage with vertical layout
4. **Name Validation**: Prevents duplicate usernames with visual feedback
5. **Responsive Design**: Three-section layout (canvas, chat, input), bottom drawer for the user name dialog

## Implementation Notes

- The application uses a vertical layout optimized for mobile devices
- Chat participants are visualized as floating rectangles (random pastel colors with user names as labels) on a Pixi.js canvas
- WebSocket connections handle real-time messaging and reconnect after short random backoff delay
- Name validation prevents duplicate usernames with red border animation feedback, max name length ist 16
- The UI follows a three-section layout: canvas (top), chat window (middle), input field (bottom)

## Architecture Principles

### Single Source of Truth (SSOT)

- **WebSocket State**: The `websocket` variable and its `readyState` property serve as the single source of truth for connection status
- **User State**: The `userName` variable controls user-specific functionality and permissions
- **UI State Management**: All UI elements (connection status, input/button states) derive their state from these core variables
- **No Redundant State**: Eliminated separate connection tracking variables in favor of querying websocket.readyState directly

## Step-by-Step Implementation Plan

### Phase 1: Basic FastAPI Structure (Runnable) ✅

**Step 1**: Create minimal FastAPI application with static HTML page

- ✅ Create `src/main.py` with basic FastAPI app
- ✅ Create `requirements.txt` with FastAPI, uvicorn dependencies
- ✅ Create `src/static/index.html` with placeholder UI (3-section layout)
- ✅ Create basic CSS for mobile-optimized layout
- **Result**: Static webpage accessible at `http://localhost:8000`

### Phase 2: Add Pixi.js Canvas (Runnable) ✅

**Step 2**: Integrate Pixi.js canvas with placeholder rectangles

- ✅ Add Pixi.js v8 npm package with Vite build
- ✅ Create `src/pixi-canvas.js` with basic canvas setup
- ✅ Display 2-3 static colored rectangles as user placeholders
- **Result**: Canvas displays with animated floating rectangles

### Phase 3: Basic WebSocket Connection (Runnable) ✅

**Step 3**: Implement WebSocket endpoint and basic chat UI

- ✅ Add WebSocket endpoint to FastAPI (`/ws`)
- ✅ Create chat message display area in HTML
- ✅ Add basic message input field and send button
- ✅ Implement simple echo WebSocket functionality
- **Result**: Users can send messages and see echoes

### Phase 4: Multi-User Chat (Runnable) ✅

**Step 4**: Enable multiple users and message broadcasting

- ✅ Implement user connection management
- ✅ Add message broadcasting to all connected users
- ✅ Display messages in chat window with timestamps
- **Result**: Multiple users can chat in real-time

### Phase 5: User Names and Validation (Runnable) ✅

**Step 5**: Add user name system with validation

- ✅ Create bottom drawer dialog for name entry
- ✅ Implement name validation (max 16 chars, no duplicates)
- ✅ Add red border animation for validation errors
- ✅ Store user names and display in messages
- **Result**: Users must enter unique names to join chat

### Phase 6: Dynamic User Visualization (Runnable) ✅

**Step 6**: Connect Pixi.js canvas to real users

- ✅ Update canvas to show rectangles for actual connected users
- ✅ Generate random pastel colors for each user
- ✅ Display user names as labels on rectangles
- ✅ Remove/add rectangles when users join/leave
- ✅ Separated canvas logic into `src/pixi-canvas.js` and chat logic in `src/main.js`
- **Result**: Canvas shows real-time user representation with cleaner code structure

### Phase 7: WebSocket Reconnection (Runnable) ✅

**Step 7**: Add connection resilience

- ✅ Implement WebSocket reconnection with random backoff and exponential delay
- ✅ Add connection status indicators with color-coded states
- ✅ Handle reconnection gracefully with single source of truth (websocket state)
- ✅ Update UI state management to use websocket as SSOT
- **Result**: App handles network interruptions gracefully with visual feedback

### Phase 8: Docker Deployment (Runnable) ✅

**Step 8**: Create Docker configuration

- ✅ Create `Dockerfile` for Python app with security best practices
- ✅ Create `docker-compose.yml` for container orchestration with health checks
- ✅ Create `run-docker.sh` and `run-podman.sh` scripts with status monitoring
- ✅ Add proper health checks and non-root user configuration
- **Result**: App runs in containerized environment with production-ready setup

### Phase 9: Polish and Optimization (Runnable) ⏳

**Step 9**: Final improvements and mobile optimization

- ⏳ Optimize mobile layout and touch interactions
- ⏳ Add smooth animations and transitions
- ⏳ Implement proper error handling
- ⏳ Add loading states and user feedback
- **Result**: Production-ready chat application

## Development Commands

### Local Development (without Docker)

**Bash/Linux/macOS:**

```bash
./run-local.sh
```

**PowerShell/Windows:**

```powershell
.\run-local.ps1
```

**Manual Steps:**

```bash
# Install frontend dependencies
npm install

# Build frontend
npm run build

# Setup Python environment
python3 -m venv venv
. ./venv/bin/activate
pip3 install -r requirements.txt

# Run FastAPI server
python3 -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

### Docker Development

**Bash/Linux/macOS:**

```bash
./run-docker.sh
```

**PowerShell/Windows:**

```powershell
.\run-docker.ps1
```

### Podman Development

**Bash/Linux/macOS:**

```bash
./run-podman.sh
```

**PowerShell/Windows:**

```powershell
.\run-podman.ps1
```

## Additional Development Notes

- **Commit Practice**:
  - After each change display a 1 line commit message for me to copy and a detailed message below
  - Stop and wait for smoke testing after each major phase
  - Do not use emoji
