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
        self.user_names: dict[WebSocket, str] = {}
        self.user_count = 0

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.user_names:
            del self.user_names[websocket]
        self.user_count = len(self.user_names)

    def is_name_taken(self, name: str) -> bool:
        return name.lower() in [n.lower() for n in self.user_names.values()]

    def add_user(self, websocket: WebSocket, name: str):
        self.user_names[websocket] = name
        self.user_count = len(self.user_names)

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
    
    async def broadcast_user_list(self):
        user_list_message = json.dumps({
            "type": "user_list",
            "users": list(self.user_names.values())
        })
        await self.broadcast(user_list_message)

manager = ConnectionManager()

# Mount static files
app.mount("/static", StaticFiles(directory="src/static"), name="static")

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
    user_joined = False
    
    try:
        while True:
            data = await websocket.receive_text()
            
            # Try to parse as JSON, fallback to plain text
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type")
                
                if message_type == "join_request":
                    # Handle user join request with name validation
                    name = message_data.get("name", "").strip()
                    
                    # Validate name
                    if not name:
                        await manager.send_personal_message(json.dumps({
                            "type": "join_response",
                            "success": False,
                            "error": "Name cannot be empty"
                        }), websocket)
                        continue
                    
                    if len(name) > 16:
                        await manager.send_personal_message(json.dumps({
                            "type": "join_response",
                            "success": False,
                            "error": "Name must be 16 characters or less"
                        }), websocket)
                        continue
                    
                    if manager.is_name_taken(name):
                        await manager.send_personal_message(json.dumps({
                            "type": "join_response",
                            "success": False,
                            "error": "Name is already taken"
                        }), websocket)
                        continue
                    
                    # Name is valid, add user
                    manager.add_user(websocket, name)
                    user_joined = True
                    
                    # Send success response
                    await manager.send_personal_message(json.dumps({
                        "type": "join_response",
                        "success": True,
                        "name": name
                    }), websocket)
                    
                    # Broadcast user count and user list updates
                    await manager.broadcast_user_count()
                    await manager.broadcast_user_list()
                    
                    # Broadcast join notification
                    join_message = {
                        "type": "chat_message",
                        "user": "System",
                        "message": f"{name} joined the chat",
                        "timestamp": datetime.now().strftime("%H:%M:%S")
                    }
                    await manager.broadcast(json.dumps(join_message))
                    
                elif message_type == "chat_message" and user_joined:
                    # Handle chat message (only if user has joined)
                    user_name = manager.user_names.get(websocket, "Anonymous")
                    chat_message = {
                        "type": "chat_message",
                        "user": user_name,
                        "message": message_data.get("message", ""),
                        "timestamp": datetime.now().strftime("%H:%M:%S")
                    }
                    await manager.broadcast(json.dumps(chat_message))
                    
            except json.JSONDecodeError:
                # Handle plain text messages (backward compatibility)
                if user_joined:
                    user_name = manager.user_names.get(websocket, "Anonymous")
                    chat_message = {
                        "type": "chat_message",
                        "user": user_name,
                        "message": data,
                        "timestamp": datetime.now().strftime("%H:%M:%S")
                    }
                    await manager.broadcast(json.dumps(chat_message))
                
    except WebSocketDisconnect:
        if user_joined:
            user_name = manager.user_names.get(websocket, "Anonymous")
            manager.disconnect(websocket)
            await manager.broadcast_user_count()
            await manager.broadcast_user_list()
            
            # Broadcast leave notification
            leave_message = {
                "type": "chat_message",
                "user": "System",
                "message": f"{user_name} left the chat",
                "timestamp": datetime.now().strftime("%H:%M:%S")
            }
            await manager.broadcast(json.dumps(leave_message))
        else:
            manager.disconnect(websocket)
            
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}