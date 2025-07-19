from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os
import json
from datetime import datetime
from backend.connection_manager import ConnectionManager
from backend.message_types import MessageType

app = FastAPI(title="FastAPI Reflex PixiJS Chat")


manager = ConnectionManager()

# Mount static files (Vite build output)
app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")
app.mount("/static", StaticFiles(directory="dist"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page"""
    static_path = os.path.join("dist", "index.html")
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
                
                if message_type == MessageType.JOIN_REQUEST:
                    # Handle user join request with name validation
                    name = message_data.get("name", "").strip()
                    
                    # Validate name
                    if not name:
                        await manager.send_personal_message(json.dumps({
                            "type": MessageType.JOIN_RESPONSE,
                            "success": False,
                            "error": "Name cannot be empty"
                        }), websocket)
                        continue
                    
                    if len(name) > 16:
                        await manager.send_personal_message(json.dumps({
                            "type": MessageType.JOIN_RESPONSE,
                            "success": False,
                            "error": "Name must be 16 characters or less"
                        }), websocket)
                        continue
                    
                    if manager.is_name_taken(name):
                        await manager.send_personal_message(json.dumps({
                            "type": MessageType.JOIN_RESPONSE,
                            "success": False,
                            "error": "Name is already taken"
                        }), websocket)
                        continue
                    
                    # Name is valid, add user
                    manager.add_user(websocket, name)
                    user_joined = True
                    
                    # Send success response
                    await manager.send_personal_message(json.dumps({
                        "type": MessageType.JOIN_RESPONSE,
                        "success": True,
                        "name": name
                    }), websocket)
                    
                    # Broadcast user count and user list updates
                    await manager.broadcast_user_count()
                    await manager.broadcast_user_list()
                    
                    # Broadcast join notification
                    join_message = {
                        "type": MessageType.CHAT_MESSAGE,
                        "user": "System",
                        "message": f"{name} joined the chat",
                        "timestamp": datetime.now().strftime("%H:%M:%S")
                    }
                    await manager.broadcast(json.dumps(join_message))
                    
                elif message_type == MessageType.CHAT_MESSAGE and user_joined:
                    # Handle chat message (only if user has joined)
                    user_name = manager.user_names.get(websocket, "Anonymous")
                    chat_message = {
                        "type": MessageType.CHAT_MESSAGE,
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
                        "type": MessageType.CHAT_MESSAGE,
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
                "type": MessageType.CHAT_MESSAGE,
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
