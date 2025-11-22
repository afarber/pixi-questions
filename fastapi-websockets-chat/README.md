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
3. Run tests: `npm run test:run`
4. Build frontend: `npm run build`
5. Set up Python environment: `python3 -m venv venv && source venv/bin/activate`
6. Install backend dependencies: `pip install -r requirements.txt`
7. Run the development server: `python3 -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000`
8. Open your browser to http://localhost:8000

## Testing

This project includes comprehensive testing coverage with multiple test types:

### Unit Tests

**Frontend Unit Tests (JavaScript/Vitest):**
```bash
# Run tests in watch mode (interactive)
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI interface
npm run test:ui

# Run tests with coverage
npm run test -- --coverage
```

**Backend Unit Tests (Python/pytest):**
```bash
# Activate virtual environment first
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run backend tests
python -m pytest tests/backend/ -v

# Run with coverage
python -m pytest tests/backend/ --cov=backend --cov-report=html
```

### End-to-End (E2E) Tests

**Playwright Browser Tests:**
```bash
# Install Playwright browsers (first time only)
npm run playwright:install

# Build frontend (required for E2E tests)
npm run build

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI (interactive)
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

**Note:** E2E tests automatically start the FastAPI server during testing.

### Test Coverage

**Unit Tests Cover:**
- Chat message handling and validation
- WebSocket connection management
- Pixi.js canvas user visualization
- Name validation and error handling
- User state management

**E2E Tests Cover:**
- Complete user journey (join, chat, leave)
- Name validation with error feedback
- Multi-user chat functionality
- Canvas interaction and user visualization
- Page refresh and reconnection scenarios

**Testing Best Practices:**
- All tests run automatically in GitHub Actions CI/CD
- Unit tests provide fast feedback for individual components
- E2E tests validate complete user workflows across browsers
- Tests use realistic user scenarios and edge cases

### Continuous Integration

The project includes automated testing via GitHub Actions:

**Test Pipeline:**
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

### Making Changes

1. **Setup Development Environment:**
   ```bash
   # Install dependencies
   npm ci
   python -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Run Tests During Development:**
   ```bash
   # Frontend development with live testing
   npm test               # Watch mode for unit tests
   
   # Backend development
   python -m pytest tests/backend/ -v
   ```

3. **Build and Test Complete Application:**
   ```bash
   # Build frontend
   npm run build
   
   # Run full test suite
   npm run test:run       # Unit tests
   npm run test:e2e      # E2E tests
   ```

4. **Local Testing:**
   ```bash
   # Start development server
   ./run-local.sh
   
   # Test in browser at http://localhost:8000
   ```

### Pre-Commit Checklist

Before committing changes, ensure:

- [ ] All unit tests pass: `npm run test:run`
- [ ] Backend tests pass: `python -m pytest tests/backend/ -v`
- [ ] Frontend builds successfully: `npm run build`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Application runs locally: `./run-local.sh`

### Code Quality

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

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
