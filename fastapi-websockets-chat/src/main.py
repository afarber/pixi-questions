from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os
import json
from datetime import datetime

app = FastAPI(title="FastAPI Reflex PixiJS Chat")

# Connection manager for WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.user_count = 0

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.user_count += 1
        await self.broadcast_user_count()

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        self.user_count -= 1

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

    async def broadcast_user_count(self):
        count_message = json.dumps({
            "type": "user_count",
            "count": self.user_count
        })
        await self.broadcast(count_message)

manager = ConnectionManager()

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
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            
            # Try to parse as JSON, fallback to plain text
            try:
                message_data = json.loads(data)
                if message_data.get("type") == "chat_message":
                    # Create message with timestamp
                    chat_message = {
                        "type": "chat_message",
                        "user": message_data.get("user", "Anonymous"),
                        "message": message_data.get("message", ""),
                        "timestamp": datetime.now().strftime("%H:%M:%S")
                    }
                    await manager.broadcast(json.dumps(chat_message))
                else:
                    # Handle other message types
                    await manager.broadcast(data)
            except json.JSONDecodeError:
                # Handle plain text messages (backward compatibility)
                chat_message = {
                    "type": "chat_message",
                    "user": "Anonymous",
                    "message": data,
                    "timestamp": datetime.now().strftime("%H:%M:%S")
                }
                await manager.broadcast(json.dumps(chat_message))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast_user_count()
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}