// WebSocket Chat with Pixi.js Canvas - Phase 6 Implementation
document.addEventListener('DOMContentLoaded', function() {
    console.log('FastAPI PixiJS Websockets Chat - loaded');
    
    let websocket = null;
    let userName = '';
    let pixiCanvas = null;
    let reconnectAttempts = 0;
    let maxReconnectAttempts = 10;
    let reconnectTimeout = null;
    
    // Show name drawer on page load
    const nameDrawer = document.getElementById('nameDrawer');
    nameDrawer.classList.add('active');
    
    // Basic event listeners (placeholder functionality)
    const joinButton = document.getElementById('joinButton');
    const nameInput = document.getElementById('nameInput');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // Focus name input field on page load
    nameInput.focus();
    
    // Connection status management using websocket as SSOT
    function updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        const isConnected = websocket && websocket.readyState === WebSocket.OPEN;
        
        if (!websocket) {
            statusElement.className = 'status-disconnected';
            statusElement.textContent = 'Disconnected';
        } else if (websocket.readyState === WebSocket.CONNECTING) {
            statusElement.className = 'status-connecting';
            statusElement.textContent = reconnectAttempts > 0 ? 
                `Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})` : 
                'Connecting...';
        } else if (websocket.readyState === WebSocket.OPEN) {
            statusElement.className = 'status-connected';
            statusElement.textContent = 'Connected';
        } else {
            statusElement.className = 'status-disconnected';
            statusElement.textContent = 'Disconnected';
        }
        
        // Update input/button states based on connection and user status
        const hasUser = !!userName;
        messageInput.disabled = !hasUser || !isConnected;
        sendButton.disabled = !hasUser || !isConnected;
    }
    
    // Generate random reconnect delay (1-5 seconds) with exponential backoff
    function getReconnectDelay() {
        const baseDelay = Math.floor(Math.random() * 4000) + 1000;
        return baseDelay * Math.pow(2, reconnectAttempts);
    }
    
    // Attempt to reconnect
    function attemptReconnect() {
        if (reconnectTimeout || !userName || reconnectAttempts >= maxReconnectAttempts) {
            return;
        }
        
        reconnectAttempts++;
        const delay = getReconnectDelay();
        
        reconnectTimeout = setTimeout(() => {
            console.log(`Reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
            connectWebSocket(userName, true);
            reconnectTimeout = null;
        }, delay);
        
        updateConnectionStatus();
    }
    
    // Reset reconnection state on successful connection
    function resetReconnection() {
        reconnectAttempts = 0;
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
    }
    
    // WebSocket connection functionality
    function connectWebSocket(nameToJoin, isReconnection = false) {
        // Don't create new connection if already connecting or connected
        if (websocket && (websocket.readyState === WebSocket.CONNECTING || websocket.readyState === WebSocket.OPEN)) {
            return;
        }
        
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${location.host}/ws`;
        
        websocket = new WebSocket(wsUrl);
        updateConnectionStatus();
        
        websocket.onopen = function() {
            console.log('WebSocket connected');
            resetReconnection();
            updateConnectionStatus();
            
            if (!isReconnection) {
                addMessage('System', 'Connected to chat server');
            } else {
                addMessage('System', 'Reconnected to chat server');
            }
            
            // Send join request if name provided
            if (nameToJoin) {
                const joinRequest = {
                    type: 'join_request',
                    name: nameToJoin
                };
                websocket.send(JSON.stringify(joinRequest));
            }
        };
        
        websocket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'chat_message') {
                    addMessage(data.user, data.message, data.timestamp);
                } else if (data.type === 'user_count') {
                    document.getElementById('userCount').textContent = data.count;
                } else if (data.type === 'user_list') {
                    // Update canvas with current user list
                    if (pixiCanvas) {
                        pixiCanvas.updateUsers(data.users);
                    }
                } else if (data.type === 'join_response') {
                    handleJoinResponse(data);
                } else {
                    addMessage('Server', event.data);
                }
            } catch (e) {
                // Handle non-JSON messages
                addMessage('Server', event.data);
            }
        };
        
        websocket.onclose = function(event) {
            console.log('WebSocket disconnected');
            updateConnectionStatus();
            
            if (!isReconnection) {
                addMessage('System', 'Disconnected from chat server');
            }
            
            // Attempt reconnection if user is joined and it wasn't a clean close
            if (userName && !event.wasClean) {
                attemptReconnect();
            }
        };
        
        websocket.onerror = function(error) {
            console.error('WebSocket error:', error);
            updateConnectionStatus();
            
            if (!isReconnection) {
                addMessage('System', 'Connection error');
            }
        };
    }
    
    // Join chat functionality
    function joinChat() {
        const name = nameInput.value.trim();
        
        if (name === '') {
            showError('Please enter your name');
            return;
        }
        
        if (name.length > 16) {
            showError('Name must be 16 characters or less');
            return;
        }
        
        // Connect to WebSocket and send join request on open
        connectWebSocket(name);
    }
    
    joinButton.addEventListener('click', joinChat);
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            joinChat();
        }
    });
    
    // Handle join response from server
    function handleJoinResponse(data) {
        if (data.success) {
            userName = data.name;
            
            // Hide drawer and update UI state
            nameDrawer.classList.remove('active');
            updateConnectionStatus();
            
            // Focus message input field after joining
            messageInput.focus();
            
            // Clear any error messages
            document.getElementById('nameError').textContent = '';
            document.getElementById('nameInput').classList.remove('error');
            
        } else {
            // Show error message with red border animation
            showError(data.error);
            
            // Close the WebSocket connection since join failed
            if (websocket) {
                websocket.close();
                websocket = null;
            }
        }
    }
    
    // WebSocket send message functionality
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message === '' || !userName) return;
        
        // Check connection state and attempt reconnection if needed
        if (!websocket || websocket.readyState !== WebSocket.OPEN) {
            addMessage('System', 'Not connected. Attempting to reconnect...');
            attemptReconnect();
            return;
        }
        
        // Send message as JSON with user name
        const messageData = {
            type: 'chat_message',
            user: userName,
            message: message
        };
        
        websocket.send(JSON.stringify(messageData));
        messageInput.value = '';
        
        // Keep focus on message input after sending
        messageInput.focus();
    }
    
    function addMessage(sender, message, timestamp) {
        const chatWindow = document.getElementById('chatWindow');
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        
        // Format message with timestamp if provided
        if (timestamp) {
            messageElement.innerHTML = `<span class="timestamp">[${timestamp}]</span> <strong>${sender}:</strong> ${message}`;
        } else {
            messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        }
        
        // Remove placeholder message if it exists
        const placeholder = chatWindow.querySelector('.placeholder-message');
        if (placeholder) {
            placeholder.remove();
        }
        
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    
    function showError(message) {
        const errorElement = document.getElementById('nameError');
        const nameInputElement = document.getElementById('nameInput');
        
        errorElement.textContent = message;
        nameInputElement.classList.add('error');
        
        // Remove error state after animation
        setTimeout(() => {
            nameInputElement.classList.remove('error');
        }, 500);
        
        // Clear error message after 3 seconds
        setTimeout(() => {
            errorElement.textContent = '';
        }, 3000);
    }
    
    // Canvas initialization moved to separate file
    
    // Initialize canvas when Pixi.js is available
    if (typeof PIXI !== 'undefined') {
        pixiCanvas = new PixiCanvas();
    } else {
        console.error('Pixi.js not loaded');
    }
});
