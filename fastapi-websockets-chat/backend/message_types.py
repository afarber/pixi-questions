# Copyright (c) 2025 Alexander Farber
# SPDX-License-Identifier: MIT
#
# This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)

from enum import Enum


class MessageType(str, Enum):
    """WebSocket message types for chat application"""
    JOIN_REQUEST = "join_request"
    JOIN_RESPONSE = "join_response" 
    CHAT_MESSAGE = "chat_message"