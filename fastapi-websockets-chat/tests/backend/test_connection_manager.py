import pytest
import json
from unittest.mock import AsyncMock, MagicMock
from backend.connection_manager import ConnectionManager


class TestConnectionManager:
    """Test cases for the ConnectionManager class."""
    
    @pytest.fixture
    def connection_manager(self):
        """Create a fresh ConnectionManager instance for each test."""
        return ConnectionManager()
    
    @pytest.fixture
    def mock_websocket(self):
        """Create a mock WebSocket for testing."""
        mock_ws = AsyncMock()
        mock_ws.send_text = AsyncMock()
        mock_ws.accept = AsyncMock()
        return mock_ws
    
    @pytest.fixture
    def mock_websocket_2(self):
        """Create a second mock WebSocket for multi-user tests."""
        mock_ws = AsyncMock()
        mock_ws.send_text = AsyncMock()
        mock_ws.accept = AsyncMock()
        return mock_ws

    # Initialization Tests
    def test_init_creates_empty_connections_and_users(self, connection_manager):
        """Test that ConnectionManager initializes with empty collections."""
        assert connection_manager.active_connections == []
        assert connection_manager.user_names == {}

    # Connection Management Tests
    @pytest.mark.asyncio
    async def test_connect_accepts_websocket_and_adds_to_active_connections(
        self, connection_manager, mock_websocket
    ):
        """Test that connect() accepts WebSocket and adds to active connections."""
        await connection_manager.connect(mock_websocket)
        
        mock_websocket.accept.assert_called_once()
        assert mock_websocket in connection_manager.active_connections
        assert len(connection_manager.active_connections) == 1

    def test_disconnect_removes_websocket_from_active_connections(
        self, connection_manager, mock_websocket
    ):
        """Test that disconnect() removes WebSocket from active connections."""
        # Add WebSocket first
        connection_manager.active_connections.append(mock_websocket)
        connection_manager.user_names[mock_websocket] = "TestUser"
        
        # Disconnect
        connection_manager.disconnect(mock_websocket)
        
        assert mock_websocket not in connection_manager.active_connections
        assert mock_websocket not in connection_manager.user_names

    def test_disconnect_handles_non_existent_websocket_gracefully(
        self, connection_manager, mock_websocket
    ):
        """Test that disconnect() handles non-existent WebSocket without error."""
        # Should not raise an exception
        connection_manager.disconnect(mock_websocket)
        
        assert len(connection_manager.active_connections) == 0
        assert len(connection_manager.user_names) == 0

    # User Management Tests
    def test_add_user_stores_user_name_with_websocket_key(
        self, connection_manager, mock_websocket
    ):
        """Test that add_user() stores user name with WebSocket as key."""
        connection_manager.add_user(mock_websocket, "TestUser")
        
        assert connection_manager.user_names[mock_websocket] == "TestUser"

    def test_is_name_taken_identifies_duplicate_names_case_insensitive(
        self, connection_manager, mock_websocket, mock_websocket_2
    ):
        """Test that is_name_taken() correctly identifies duplicates case-insensitively."""
        connection_manager.user_names[mock_websocket] = "TestUser"
        
        assert connection_manager.is_name_taken("TestUser") is True
        assert connection_manager.is_name_taken("testuser") is True
        assert connection_manager.is_name_taken("TESTUSER") is True
        assert connection_manager.is_name_taken("TestUser2") is False

    def test_is_name_taken_returns_false_for_available_names(
        self, connection_manager
    ):
        """Test that is_name_taken() returns False for available names."""
        assert connection_manager.is_name_taken("AvailableName") is False

    # Messaging Tests
    @pytest.mark.asyncio
    async def test_send_personal_message_sends_text_to_specific_websocket(
        self, connection_manager, mock_websocket
    ):
        """Test that send_personal_message() sends text to specific WebSocket."""
        test_message = "Hello, user!"
        
        await connection_manager.send_personal_message(test_message, mock_websocket)
        
        mock_websocket.send_text.assert_called_once_with(test_message)

    @pytest.mark.asyncio
    async def test_broadcast_sends_message_to_all_active_connections(
        self, connection_manager, mock_websocket, mock_websocket_2
    ):
        """Test that broadcast() sends message to all active connections."""
        connection_manager.active_connections.extend([mock_websocket, mock_websocket_2])
        test_message = "Broadcast message"
        
        await connection_manager.broadcast(test_message)
        
        mock_websocket.send_text.assert_called_once_with(test_message)
        mock_websocket_2.send_text.assert_called_once_with(test_message)

    @pytest.mark.asyncio
    async def test_broadcast_handles_connection_failures_gracefully(
        self, connection_manager, mock_websocket, mock_websocket_2
    ):
        """Test that broadcast() handles connection failures with try/except."""
        connection_manager.active_connections.extend([mock_websocket, mock_websocket_2])
        
        # Make first WebSocket fail
        mock_websocket.send_text.side_effect = Exception("Connection failed")
        
        test_message = "Broadcast message"
        
        # Should not raise an exception
        await connection_manager.broadcast(test_message)
        
        # Second WebSocket should still receive the message
        mock_websocket_2.send_text.assert_called_once_with(test_message)

    # User Count/List Broadcasting Tests
    @pytest.mark.asyncio
    async def test_broadcast_user_count_sends_correct_json_with_current_user_count(
        self, connection_manager, mock_websocket, mock_websocket_2
    ):
        """Test that broadcast_user_count() sends correct JSON with current user count."""
        connection_manager.active_connections.extend([mock_websocket, mock_websocket_2])
        connection_manager.user_names[mock_websocket] = "User1"
        connection_manager.user_names[mock_websocket_2] = "User2"
        
        await connection_manager.broadcast_user_count()
        
        expected_message = json.dumps({"type": "user_count", "count": 2})
        mock_websocket.send_text.assert_called_once_with(expected_message)
        mock_websocket_2.send_text.assert_called_once_with(expected_message)

    @pytest.mark.asyncio
    async def test_broadcast_user_list_sends_correct_json_with_all_user_names(
        self, connection_manager, mock_websocket, mock_websocket_2
    ):
        """Test that broadcast_user_list() sends correct JSON with all user names."""
        connection_manager.active_connections.extend([mock_websocket, mock_websocket_2])
        connection_manager.user_names[mock_websocket] = "User1"
        connection_manager.user_names[mock_websocket_2] = "User2"
        
        await connection_manager.broadcast_user_list()
        
        expected_message = json.dumps({"type": "user_list", "users": ["User1", "User2"]})
        mock_websocket.send_text.assert_called_once_with(expected_message)
        mock_websocket_2.send_text.assert_called_once_with(expected_message)

    # Edge Cases and Error Handling Tests
    @pytest.mark.asyncio
    async def test_broadcast_user_count_with_empty_user_list(
        self, connection_manager, mock_websocket
    ):
        """Test broadcast_user_count() with empty user list."""
        connection_manager.active_connections.append(mock_websocket)
        
        await connection_manager.broadcast_user_count()
        
        expected_message = json.dumps({"type": "user_count", "count": 0})
        mock_websocket.send_text.assert_called_once_with(expected_message)

    @pytest.mark.asyncio
    async def test_broadcast_user_list_with_empty_user_list(
        self, connection_manager, mock_websocket
    ):
        """Test broadcast_user_list() with empty user list."""
        connection_manager.active_connections.append(mock_websocket)
        
        await connection_manager.broadcast_user_list()
        
        expected_message = json.dumps({"type": "user_list", "users": []})
        mock_websocket.send_text.assert_called_once_with(expected_message)

    def test_case_insensitive_name_comparison_edge_cases(
        self, connection_manager, mock_websocket
    ):
        """Test case-insensitive name comparison with various edge cases."""
        connection_manager.user_names[mock_websocket] = "MixedCase"
        
        # Test various case combinations
        assert connection_manager.is_name_taken("mixedcase") is True
        assert connection_manager.is_name_taken("MIXEDCASE") is True
        assert connection_manager.is_name_taken("MiXeDcAsE") is True
        assert connection_manager.is_name_taken("mixedcase2") is False

    def test_disconnect_with_websocket_in_connections_but_not_in_users(
        self, connection_manager, mock_websocket
    ):
        """Test disconnect() when WebSocket is in connections but not in user_names."""
        connection_manager.active_connections.append(mock_websocket)
        # Don't add to user_names
        
        connection_manager.disconnect(mock_websocket)
        
        assert mock_websocket not in connection_manager.active_connections
        assert len(connection_manager.user_names) == 0

    def test_disconnect_with_websocket_in_users_but_not_in_connections(
        self, connection_manager, mock_websocket
    ):
        """Test disconnect() when WebSocket is in user_names but not in connections."""
        connection_manager.user_names[mock_websocket] = "TestUser"
        # Don't add to active_connections
        
        connection_manager.disconnect(mock_websocket)
        
        assert len(connection_manager.active_connections) == 0
        assert mock_websocket not in connection_manager.user_names