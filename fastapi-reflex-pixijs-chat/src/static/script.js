// Basic JavaScript for Phase 1 - Placeholder functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('FastAPI Reflex PixiJS Chat - Phase 1 loaded');
    
    // Show name drawer on page load
    const nameDrawer = document.getElementById('nameDrawer');
    nameDrawer.classList.add('active');
    
    // Basic event listeners (placeholder functionality)
    const joinButton = document.getElementById('joinButton');
    const nameInput = document.getElementById('nameInput');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // Placeholder join functionality
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
        
        // Hide drawer and enable chat (placeholder)
        nameDrawer.classList.remove('active');
        messageInput.disabled = false;
        sendButton.disabled = false;
        
        // Update user count placeholder
        document.getElementById('userCount').textContent = '1';
        
        // Add welcome message
        addMessage('System', `Welcome ${name}! You can start chatting.`);
    });
    
    // Placeholder send message functionality
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message === '') return;
        
        // Add message to chat (placeholder echo)
        addMessage('You', message);
        messageInput.value = '';
    }
    
    function addMessage(sender, message) {
        const chatWindow = document.getElementById('chatWindow');
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        messageElement.style.marginBottom = '8px';
        messageElement.style.padding = '8px';
        messageElement.style.background = '#f8f9fa';
        messageElement.style.borderRadius = '8px';
        
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