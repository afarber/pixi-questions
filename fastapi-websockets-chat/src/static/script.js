// WebSocket Chat with Pixi.js Canvas - Phase 6 Implementation
document.addEventListener('DOMContentLoaded', function() {
    console.log('FastAPI PixiJS Websockets Chat - loaded');
    
    let websocket = null;
    let userName = '';
    let pixiCanvas = null;
    
    // Show name drawer on page load
    const nameDrawer = document.getElementById('nameDrawer');
    nameDrawer.classList.add('active');
    
    // Basic event listeners (placeholder functionality)
    const joinButton = document.getElementById('joinButton');
    const nameInput = document.getElementById('nameInput');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // WebSocket connection functionality
    function connectWebSocket(nameToJoin) {
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${location.host}/ws`;
        
        websocket = new WebSocket(wsUrl);
        
        websocket.onopen = function() {
            console.log('WebSocket connected');
            addMessage('System', 'Connected to chat server');
            
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
        
        // Connect to WebSocket and send join request on open
        connectWebSocket(name);
    });
    
    // Handle join response from server
    function handleJoinResponse(data) {
        if (data.success) {
            userName = data.name;
            
            // Hide drawer and enable chat
            nameDrawer.classList.remove('active');
            messageInput.disabled = false;
            sendButton.disabled = false;
            
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
    
    // Pixi.js Canvas Setup for Dynamic User Visualization
    class PixiCanvas {
        constructor() {
            this.app = null;
            this.userRectangles = [];
            this.container = null;
            // Track connected users
            this.users = new Map();
            this.init();
        }

        async init() {
            // Create Pixi Application
            this.app = new PIXI.Application();
            await this.app.init({
                width: 800,
                height: 400,
                backgroundColor: 0x667eea,
                resizeTo: document.getElementById('pixiCanvas')
            });

            // Add canvas to DOM
            const canvasContainer = document.getElementById('pixiCanvas');
            canvasContainer.appendChild(this.app.canvas);

            // Create container for user rectangles
            this.container = new PIXI.Container();
            this.app.stage.addChild(this.container);

            // Start animation loop
            this.animate();

            console.log('Pixi.js canvas initialized');
        }

        // Generate random pastel color for user
        generatePastelColor() {
            const hue = Math.random() * 360;
            const saturation = 40 + Math.random() * 30;
            const lightness = 70 + Math.random() * 20;
            
            // Convert HSL to RGB
            const c = (1 - Math.abs(2 * lightness/100 - 1)) * saturation/100;
            const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
            const m = lightness/100 - c/2;
            
            let r, g, b;
            if (hue < 60) { r = c; g = x; b = 0; }
            else if (hue < 120) { r = x; g = c; b = 0; }
            else if (hue < 180) { r = 0; g = c; b = x; }
            else if (hue < 240) { r = 0; g = x; b = c; }
            else if (hue < 300) { r = x; g = 0; b = c; }
            else { r = c; g = 0; b = x; }
            
            r = Math.round((r + m) * 255);
            g = Math.round((g + m) * 255);
            b = Math.round((b + m) * 255);
            
            return (r << 16) | (g << 8) | b;
        }

        createUserRectangle(name, color, x, y, index) {
            // Create rectangle
            const rect = new PIXI.Graphics();
            rect.rect(0, 0, 80, 40);
            rect.fill(color);
            rect.stroke({ width: 2, color: 0xFFFFFF });
            
            // Set position
            rect.x = x;
            rect.y = y;

            // Create text label
            const text = new PIXI.Text({
                text: name,
                style: {
                    fontFamily: 'Arial',
                    fontSize: 14,
                    fill: 0x000000,
                    fontWeight: 'bold'
                }
            });

            // Center text on rectangle
            text.anchor.set(0.5);
            text.x = rect.width / 2;
            text.y = rect.height / 2;

            // Add text to rectangle
            rect.addChild(text);

            // Add animation properties
            rect.userData = {
                originalX: x,
                originalY: y,
                velocityX: (Math.random() - 0.5) * 2,
                velocityY: (Math.random() - 0.5) * 2,
                name: name,
                index: index
            };

            // Add to container and tracking array
            this.container.addChild(rect);
            this.userRectangles.push(rect);
            
            // Store in users map
            this.users.set(name, rect);
        }

        animate() {
            // Animate user rectangles
            this.userRectangles.forEach(rect => {
                const userData = rect.userData;
                
                // Update position
                rect.x += userData.velocityX;
                rect.y += userData.velocityY;

                // Bounce off edges
                const bounds = this.app.screen;
                if (rect.x <= 0 || rect.x >= bounds.width - rect.width) {
                    userData.velocityX *= -1;
                    rect.x = Math.max(0, Math.min(bounds.width - rect.width, rect.x));
                }
                if (rect.y <= 0 || rect.y >= bounds.height - rect.height) {
                    userData.velocityY *= -1;
                    rect.y = Math.max(0, Math.min(bounds.height - rect.height, rect.y));
                }

                // Add subtle floating effect
                rect.x += Math.sin(Date.now() * 0.001 + userData.index) * 0.5;
                rect.y += Math.cos(Date.now() * 0.001 + userData.index) * 0.3;
            });

            // Continue animation
            requestAnimationFrame(() => this.animate());
        }

        // Add new user to canvas
        addUser(name) {
            // Don't add if user already exists
            if (this.users.has(name)) {
                return;
            }
            
            // Generate random pastel color and position
            const color = this.generatePastelColor();
            const x = Math.random() * (this.app.screen.width - 80);
            const y = Math.random() * (this.app.screen.height - 40);
            
            this.createUserRectangle(name, color, x, y, this.userRectangles.length);
        }

        // Remove user from canvas
        removeUser(name) {
            const rect = this.users.get(name);
            if (rect) {
                // Remove from container
                this.container.removeChild(rect);
                
                // Remove from tracking arrays
                const index = this.userRectangles.indexOf(rect);
                if (index !== -1) {
                    this.userRectangles.splice(index, 1);
                }
                
                // Remove from users map
                this.users.delete(name);
            }
        }
        
        // Update user list from server
        updateUsers(userList) {
            // Remove users no longer in the list
            const currentUsers = new Set(this.users.keys());
            const newUsers = new Set(userList);
            
            for (const user of currentUsers) {
                if (!newUsers.has(user)) {
                    this.removeUser(user);
                }
            }
            
            // Add new users
            for (const user of userList) {
                if (!this.users.has(user)) {
                    this.addUser(user);
                }
            }
        }
    }
    
    // Initialize canvas when Pixi.js is available
    if (typeof PIXI !== 'undefined') {
        pixiCanvas = new PixiCanvas();
    } else {
        console.error('Pixi.js not loaded');
    }
});
