// WebSocket Chat - Phase 3 Implementation
document.addEventListener('DOMContentLoaded', function() {
    console.log('FastAPI PixiJS Websockets Chat - loaded');
    
    let websocket = null;
    let userName = '';
    
    // Show name drawer on page load
    const nameDrawer = document.getElementById('nameDrawer');
    nameDrawer.classList.add('active');
    
    // Basic event listeners (placeholder functionality)
    const joinButton = document.getElementById('joinButton');
    const nameInput = document.getElementById('nameInput');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // WebSocket connection functionality
    function connectWebSocket() {
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${location.host}/ws`;
        
        websocket = new WebSocket(wsUrl);
        
        websocket.onopen = function() {
            console.log('WebSocket connected');
            addMessage('System', 'Connected to chat server');
        };
        
        websocket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'chat_message') {
                    addMessage(data.user, data.message, data.timestamp);
                } else if (data.type === 'user_count') {
                    document.getElementById('userCount').textContent = data.count;
                } else {
                    addMessage('Server', event.data);
                }
            } catch (e) {
                // Handle non-JSON messages
                addMessage('Server', event.data);
            }
        };
        
        websocket.onclose = function() {
            console.log('WebSocket disconnected');
            addMessage('System', 'Disconnected from chat server');
        };
        
        websocket.onerror = function(error) {
            console.error('WebSocket error:', error);
            addMessage('System', 'Connection error');
        };
    }
    
    // Join chat functionality
    joinButton.addEventListener('click', function() {
        const name = nameInput.value.trim();
        
        if (name === '') {
            showError('Please enter your name');
            return;
        }
        
        if (name.length > 16) {
            showError('Name must be 16 characters or less');
            return;
        }
        
        userName = name;
        
        // Hide drawer and enable chat
        nameDrawer.classList.remove('active');
        messageInput.disabled = false;
        sendButton.disabled = false;
        
        // Connect to WebSocket
        connectWebSocket();
    });
    
    // WebSocket send message functionality
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message === '' || !websocket || websocket.readyState !== WebSocket.OPEN) return;
        
        // Send message as JSON with user name
        const messageData = {
            type: 'chat_message',
            user: userName,
            message: message
        };
        
        websocket.send(JSON.stringify(messageData));
        messageInput.value = '';
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
});
