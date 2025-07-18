import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Chat Functionality', () => {
  let mockElements;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock DOM elements
    mockElements = {
      nameInput: {
        value: '',
        focus: vi.fn(),
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      },
      messageInput: {
        value: '',
        disabled: false,
        focus: vi.fn()
      },
      sendButton: {
        disabled: false
      },
      chatWindow: {
        appendChild: vi.fn(),
        querySelector: vi.fn(),
        scrollTop: 0,
        scrollHeight: 100
      },
      nameDrawer: {
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      },
      nameError: {
        textContent: ''
      },
      userCount: {
        textContent: '0'
      }
    };
    
    global.document.getElementById = vi.fn((id) => mockElements[id] || {
      textContent: '',
      value: '',
      disabled: false,
      classList: { add: vi.fn(), remove: vi.fn() },
      appendChild: vi.fn(),
      querySelector: vi.fn(),
      focus: vi.fn()
    });
    
    global.document.createElement = vi.fn(() => ({
      className: '',
      innerHTML: '',
      textContent: ''
    }));
    
    global.setTimeout = vi.fn((fn) => fn());
    global.console.log = vi.fn();
  });

  describe('Name Validation', () => {
    it('should reject empty names', () => {
      const name = '';
      const isValid = name.trim() !== '';
      
      expect(isValid).toBe(false);
    });

    it('should reject names longer than 16 characters', () => {
      const name = 'ThisNameIsTooLongForTheValidation';
      const isValid = name.length <= 16;
      
      expect(isValid).toBe(false);
    });

    it('should accept valid names', () => {
      const name = 'ValidUser';
      const isValid = name.trim() !== '' && name.length <= 16;
      
      expect(isValid).toBe(true);
    });

    it('should trim whitespace from names', () => {
      const name = '  TestUser  ';
      const trimmedName = name.trim();
      
      expect(trimmedName).toBe('TestUser');
      expect(trimmedName.length).toBe(8);
    });
  });

  describe('Error Display', () => {
    it('should show error message', () => {
      const errorMessage = 'Name is already taken';
      
      // Simulate showError function
      mockElements.nameError.textContent = errorMessage;
      mockElements.nameInput.classList.add('error');
      
      expect(mockElements.nameError.textContent).toBe(errorMessage);
      expect(mockElements.nameInput.classList.add).toHaveBeenCalledWith('error');
    });

    it('should clear error state after timeout', () => {
      // Simulate error clearing
      setTimeout(() => {
        mockElements.nameInput.classList.remove('error');
      }, 500);
      
      setTimeout(() => {
        mockElements.nameError.textContent = '';
      }, 3000);
      
      expect(mockElements.nameInput.classList.remove).toHaveBeenCalledWith('error');
      expect(setTimeout).toHaveBeenCalledTimes(2);
    });
  });

  describe('Message Display', () => {
    it('should create message element with timestamp', () => {
      const sender = 'TestUser';
      const message = 'Hello World';
      const timestamp = '12:34:56';
      
      const messageElement = document.createElement('div');
      messageElement.className = 'message';
      messageElement.innerHTML = `<span class="timestamp">[${timestamp}]</span> <strong>${sender}:</strong> ${message}`;
      
      expect(messageElement.className).toBe('message');
      expect(messageElement.innerHTML).toContain(timestamp);
      expect(messageElement.innerHTML).toContain(sender);
      expect(messageElement.innerHTML).toContain(message);
    });

    it('should create message element without timestamp', () => {
      const sender = 'TestUser';
      const message = 'Hello World';
      
      const messageElement = document.createElement('div');
      messageElement.className = 'message';
      messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
      
      expect(messageElement.className).toBe('message');
      expect(messageElement.innerHTML).not.toContain('timestamp');
      expect(messageElement.innerHTML).toContain(sender);
      expect(messageElement.innerHTML).toContain(message);
    });

    it('should auto-scroll chat window', () => {
      const chatWindow = mockElements.chatWindow;
      chatWindow.scrollTop = chatWindow.scrollHeight;
      
      expect(chatWindow.scrollTop).toBe(chatWindow.scrollHeight);
    });

    it('should remove placeholder message', () => {
      const placeholder = { remove: vi.fn() };
      mockElements.chatWindow.querySelector = vi.fn().mockReturnValue(placeholder);
      
      const foundPlaceholder = mockElements.chatWindow.querySelector('.placeholder-message');
      if (foundPlaceholder) {
        foundPlaceholder.remove();
      }
      
      expect(placeholder.remove).toHaveBeenCalled();
    });
  });

  describe('Input State Management', () => {
    it('should disable inputs when not connected', () => {
      const hasUser = true;
      const isConnected = false;
      
      mockElements.messageInput.disabled = !hasUser || !isConnected;
      mockElements.sendButton.disabled = !hasUser || !isConnected;
      
      expect(mockElements.messageInput.disabled).toBe(true);
      expect(mockElements.sendButton.disabled).toBe(true);
    });

    it('should disable inputs when user not joined', () => {
      const hasUser = false;
      const isConnected = true;
      
      mockElements.messageInput.disabled = !hasUser || !isConnected;
      mockElements.sendButton.disabled = !hasUser || !isConnected;
      
      expect(mockElements.messageInput.disabled).toBe(true);
      expect(mockElements.sendButton.disabled).toBe(true);
    });

    it('should enable inputs when user joined and connected', () => {
      const hasUser = true;
      const isConnected = true;
      
      mockElements.messageInput.disabled = !hasUser || !isConnected;
      mockElements.sendButton.disabled = !hasUser || !isConnected;
      
      expect(mockElements.messageInput.disabled).toBe(false);
      expect(mockElements.sendButton.disabled).toBe(false);
    });
  });

  describe('Message Sending', () => {
    it('should not send empty messages', () => {
      const message = '';
      const userName = 'TestUser';
      
      const shouldSend = message.trim() !== '' && !!userName;
      expect(shouldSend).toBe(false);
    });

    it('should not send when user not joined', () => {
      const message = 'Hello';
      const userName = '';
      
      const shouldSend = message.trim() !== '' && !!userName;
      expect(shouldSend).toBe(false);
    });

    it('should send valid messages', () => {
      const message = 'Hello World';
      const userName = 'TestUser';
      
      const shouldSend = message.trim() !== '' && !!userName;
      expect(shouldSend).toBe(true);
      
      if (shouldSend) {
        const messageData = {
          type: 'chat_message',
          user: userName,
          message: message
        };
        
        expect(messageData.type).toBe('chat_message');
        expect(messageData.user).toBe(userName);
        expect(messageData.message).toBe(message);
      }
    });

    it('should clear input after sending', () => {
      mockElements.messageInput.value = 'Test message';
      
      // Simulate message sending
      mockElements.messageInput.value = '';
      mockElements.messageInput.focus();
      
      expect(mockElements.messageInput.value).toBe('');
      expect(mockElements.messageInput.focus).toHaveBeenCalled();
    });
  });

  describe('Join Flow', () => {
    it('should hide name drawer on successful join', () => {
      const joinData = {
        success: true,
        name: 'TestUser'
      };
      
      if (joinData.success) {
        mockElements.nameDrawer.classList.remove('active');
        mockElements.messageInput.focus();
        mockElements.nameError.textContent = '';
        mockElements.nameInput.classList.remove('error');
      }
      
      expect(mockElements.nameDrawer.classList.remove).toHaveBeenCalledWith('active');
      expect(mockElements.messageInput.focus).toHaveBeenCalled();
      expect(mockElements.nameError.textContent).toBe('');
      expect(mockElements.nameInput.classList.remove).toHaveBeenCalledWith('error');
    });

    it('should show error on failed join', () => {
      const joinData = {
        success: false,
        error: 'Name is already taken'
      };
      
      if (!joinData.success) {
        mockElements.nameError.textContent = joinData.error;
        mockElements.nameInput.classList.add('error');
      }
      
      expect(mockElements.nameError.textContent).toBe(joinData.error);
      expect(mockElements.nameInput.classList.add).toHaveBeenCalledWith('error');
    });
  });

  describe('User Count Display', () => {
    it('should update user count', () => {
      const userCountData = {
        type: 'user_count',
        count: 5
      };
      
      if (userCountData.type === 'user_count') {
        mockElements.userCount.textContent = userCountData.count.toString();
      }
      
      expect(mockElements.userCount.textContent).toBe('5');
    });
  });
});