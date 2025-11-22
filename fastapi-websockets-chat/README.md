# FastAPI PixiJS Chat

Real-time WebSocket chat with PixiJS canvas visualization of participants.

![screenshot](https://raw.github.com/afarber/pixi-questions/master/fastapi-websockets-chat/screenshot.gif)

## Quick Start

```bash
# Frontend
npm install
npm run dev

# Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Or use Docker:
```bash
./run-docker.sh
```

## Scripts

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build production version
- `npm run test:run` - Run unit tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run lint` - Run ESLint

### Backend
```bash
python -m pytest tests/backend/ -v
```

## Tech Stack

- **Frontend**: Vite, PixiJS v8, Vanilla JS
- **Backend**: FastAPI, uvicorn, WebSockets
- **Testing**: Vitest, Playwright, pytest
- **Deployment**: Docker Compose

## Project Structure

```
fastapi-websockets-chat/
├── backend/
│   ├── main.py
│   ├── connection_manager.py
│   └── message_types.py
├── src/
│   ├── main.js
│   └── pixi-canvas.js
├── tests/
│   ├── backend/
│   ├── unit/
│   └── integration/
└── index.html
```

## License

MIT License - see [LICENSE](../LICENSE)
