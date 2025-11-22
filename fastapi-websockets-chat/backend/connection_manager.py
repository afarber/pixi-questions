# Copyright (c) 2025 Alexander Farber
# SPDX-License-Identifier: MIT
#
# This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)

from fastapi import WebSocket
import json


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.user_names: dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.user_names:
            del self.user_names[websocket]

    def is_name_taken(self, name: str) -> bool:
        return name.lower() in [n.lower() for n in self.user_names.values()]

    def add_user(self, websocket: WebSocket, name: str):
        self.user_names[websocket] = name

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
            "count": len(self.user_names)
        })
        await self.broadcast(count_message)
    
    async def broadcast_user_list(self):
        user_list_message = json.dumps({
            "type": "user_list",
            "users": list(self.user_names.values())
        })
        await self.broadcast(user_list_message)
