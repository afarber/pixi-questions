from enum import Enum


class MessageType(str, Enum):
    """WebSocket message types for chat application"""
    JOIN_REQUEST = "join_request"
    JOIN_RESPONSE = "join_response" 
    CHAT_MESSAGE = "chat_message"