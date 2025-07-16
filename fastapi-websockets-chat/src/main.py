from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os

app = FastAPI(title="FastAPI Reflex PixiJS Chat")

# Mount static files
app.mount("/static", StaticFiles(directory="src/static"), name="static")
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page"""
    static_path = os.path.join("src", "static", "index.html")
    with open(static_path, "r") as f:
        return HTMLResponse(content=f.read(), status_code=200)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for chat messages"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Simple echo functionality
            await websocket.send_text(f"Echo: {data}")
    except Exception as e:
        print(f"WebSocket error: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}