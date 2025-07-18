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
├── package.json             # Node.js dependencies and test scripts
├── vite.config.js           # Vite configuration
├── vitest.config.js         # Vitest configuration (unit tests)
├── playwright.config.js     # Playwright configuration (E2E tests)
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
│   ├── connection_manager.py # WebSocket connection management
│   └── message_types.py      # WebSocket message type enums
├── src/
│   ├── main.js               # Vite entry point
│   ├── pixi-canvas.js        # Pixi.js canvas rendering
│   └── main.css              # CSS styles
├── tests/
│   ├── __init__.py
│   ├── setup.js              # Vitest test setup
│   ├── backend/              # Python backend tests
│   │   ├── __init__.py
│   │   └── test_connection_manager.py
│   ├── unit/                 # JavaScript frontend tests
│   │   ├── chat.test.js
│   │   ├── pixi-canvas.test.js
│   │   └── websocket.test.js
│   └── integration/          # Playwright E2E tests
│       ├── chat-flow.spec.js
│       └── canvas-interaction.spec.js
├── .github/
│   └── workflows/
│       └── fastapi-websockets-chat.yml  # CI/CD pipeline
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

## WebSocket Message Protocol

The application uses a structured JSON message protocol for WebSocket communication. Message types are defined using Python enums for type safety:

```
MessageType (backend/message_types.py)
├── JOIN_REQUEST     = "join_request"     # Client requests to join with username
├── JOIN_RESPONSE    = "join_response"    # Server response to join request  
└── CHAT_MESSAGE     = "chat_message"     # Chat messages and system notifications
```

### Message Flow Diagram

```
Client                           Server
  │                               │
  ├─ JOIN_REQUEST ────────────────>│
  │  { type: "join_request",       │
  │    name: "username" }          │
  │                               │
  │<──────────────── JOIN_RESPONSE─┤
  │  { type: "join_response",       │
  │    success: true/false,         │
  │    error: "message" }           │
  │                               │
  ├─ CHAT_MESSAGE ────────────────>│
  │  { type: "chat_message",        │
  │    message: "text" }            │
  │                               │
  │<────────────── CHAT_MESSAGE ───┤ (broadcast to all)
  │  { type: "chat_message",        │
  │    user: "username",            │
  │    message: "text",             │
  │    timestamp: "HH:MM:SS" }      │
```

## Step-by-Step Implementation Plan

### Phase 1: Basic FastAPI Structure (Runnable) [x]

- [x] Create `src/main.py` with basic FastAPI app
- [x] Create `requirements.txt` with FastAPI, uvicorn dependencies
- [x] Create `src/static/index.html` with placeholder UI (3-section layout)
- [x] Create basic CSS for mobile-optimized layout
- **Result**: Static webpage accessible at `http://localhost:8000`

### Phase 2: Add Pixi.js Canvas (Runnable) [x]

- [x] Add Pixi.js v8 npm package with Vite build
- [x] Create `src/pixi-canvas.js` with basic canvas setup
- [x] Display 2-3 static colored rectangles as user placeholders
- **Result**: Canvas displays with animated floating rectangles

### Phase 3: Basic WebSocket Connection (Runnable) [x]

- [x] Add WebSocket endpoint to FastAPI (`/ws`)
- [x] Create chat message display area in HTML
- [x] Add basic message input field and send button
- [x] Implement simple echo WebSocket functionality
- **Result**: Users can send messages and see echoes

### Phase 4: Multi-User Chat (Runnable) [x]

- [x] Implement user connection management
- [x] Add message broadcasting to all connected users
- [x] Display messages in chat window with timestamps
- **Result**: Multiple users can chat in real-time

### Phase 5: User Names and Validation (Runnable) [x]

- [x] Create bottom drawer dialog for name entry
- [x] Implement name validation (max 16 chars, no duplicates)
- [x] Add red border animation for validation errors
- [x] Store user names and display in messages
- **Result**: Users must enter unique names to join chat

### Phase 6: Dynamic User Visualization (Runnable) [x]

- [x] Update canvas to show rectangles for actual connected users
- [x] Generate random pastel colors for each user
- [x] Display user names as labels on rectangles
- [x] Remove/add rectangles when users join/leave
- [x] Separated canvas logic into `src/pixi-canvas.js` and chat logic in `src/main.js`
- **Result**: Canvas shows real-time user representation with cleaner code structure

### Phase 7: WebSocket Reconnection (Runnable) [x]

- [x] Implement WebSocket reconnection with random backoff and exponential delay
- [x] Add connection status indicators with color-coded states
- [x] Handle reconnection gracefully with single source of truth (websocket state)
- [x] Update UI state management to use websocket as SSOT
- **Result**: App handles network interruptions gracefully with visual feedback

### Phase 8: Docker Deployment (Runnable) [x]

- [x] Create `Dockerfile` for Python app with security best practices
- [x] Create `docker-compose.yml` for container orchestration with health checks
- [x] Create `run-docker.sh` and `run-podman.sh` scripts with status monitoring
- [x] Add proper health checks and non-root user configuration
- **Result**: App runs in containerized environment with production-ready setup

### Phase 9: Setup Playwright for Integration Testing (Runnable) [x]

- [x] Add Playwright dependencies (@playwright/test)
- [x] Create playwright.config.js for E2E testing
- [x] Create integration test files:
  - tests/integration/chat-flow.spec.js - Full user journey testing
  - tests/integration/canvas-interaction.spec.js - Real browser canvas testing
- [x] Add Playwright scripts to package.json
- [x] Integrate E2E tests into GitHub Actions CI/CD pipeline
- **Result**: Comprehensive testing coverage with both unit and E2E tests

### Phase 10: Update Documentation (Final) [x]

- [x] Update all markdown files with complete testing setup
- [x] Add testing section to README with both unit and E2E instructions
- [x] Document the full development workflow
- [x] Update CLAUDE.md with comprehensive testing guidance
- **Result**: Complete documentation for development and testing workflows

### Phase 11: Polish and Optimization (Runnable) [ ]

- [ ] Optimize mobile layout and touch interactions
- [ ] Add smooth animations and transitions
- [ ] Implement proper error handling
- [ ] Add loading states and user feedback
- **Result**: Production-ready chat application

## Testing Framework

This project includes comprehensive testing coverage with multiple test types:

### Unit Tests

**Frontend Unit Tests (JavaScript/Vitest):**
- `tests/unit/chat.test.js` - Chat message handling and validation
- `tests/unit/pixi-canvas.test.js` - Canvas user visualization
- `tests/unit/websocket.test.js` - WebSocket connection management

**Backend Unit Tests (Python/pytest):**
- `tests/backend/test_connection_manager.py` - WebSocket connection management

### End-to-End (E2E) Tests

**Playwright Browser Tests:**
- `tests/integration/chat-flow.spec.js` - Complete user journey testing
- `tests/integration/canvas-interaction.spec.js` - Real browser canvas testing

### Testing Commands

**Unit Tests:**
```bash
# Frontend tests
npm test               # Watch mode
npm run test:run       # CI mode
npm run test:ui        # UI interface

# Backend tests
python -m pytest tests/backend/ -v
```

**E2E Tests:**
```bash
npm run playwright:install  # Install browsers (first time)
npm run build               # Build frontend (required)
npm run test:e2e            # Run E2E tests
npm run test:e2e:ui         # Interactive mode
```

### WebSocket Reconnection Tests - DO NOT ADD

**Important**: Do not create or add WebSocket reconnection tests (both unit and integration tests). These tests are inherently flaky because:

- Network simulation via `page.route()` blocking doesn't work reliably with WebSockets across browsers
- Reconnection logic involves random delays and exponential backoff that make tests non-deterministic  
- Browser WebSocket implementations vary in how they handle connection failures
- The actual reconnection functionality works fine in practice, but is difficult to test reliably

Previously removed tests:
- `tests/integration/websocket-reconnect.spec.js` (entire file removed)
- Unit tests for exponential backoff delay calculations
- Unit tests for reconnection attempt limits

Focus testing efforts on:
- Chat flow functionality (message sending, user validation)
- Canvas interaction (visual elements, user representation)  
- Basic connection status indicators

### Continuous Integration

The project includes automated testing via GitHub Actions:

**Test Pipeline (.github/workflows/fastapi-websockets-chat.yml):**
1. **Frontend Unit Tests** - Validate JavaScript components
2. **Backend Unit Tests** - Validate Python backend logic  
3. **End-to-End Tests** - Validate complete application workflows
4. **Docker Build** - Ensure deployment readiness

**Supported Browsers (E2E):**
- Chrome/Chromium (Desktop & Mobile)
- Firefox (Desktop)
- Safari/WebKit (Desktop & Mobile)

All tests must pass before code can be merged to main branch.

## Development Workflow

### Pre-Commit Checklist

Before committing changes, ensure:

- [ ] All unit tests pass: `npm run test:run`
- [ ] Backend tests pass: `python -m pytest tests/backend/ -v`
- [ ] Frontend builds successfully: `npm run build`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Application runs locally: `./run-local.sh`

### Code Quality Standards

**Frontend:**
- JavaScript ES modules with Vite bundling
- Vitest for unit testing with JSDOM environment
- Playwright for browser automation testing
- Clean, readable code with proper error handling

**Backend:**
- Python 3.13+ with FastAPI framework
- Type hints and proper async/await patterns
- Pytest for unit testing with proper mocking
- WebSocket connection management with graceful error handling

**Testing Standards:**
- Unit tests focus on individual component behavior
- E2E tests validate complete user workflows
- Tests use realistic data and edge cases
- All tests must be deterministic and reliable

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

- After each change display a 1 line commit message for me to copy and a detailed message below
- After each change print testing instructions for me, then stop and wait for my smoke testing results
- Do not use emoji and keep comments on separate lines

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
