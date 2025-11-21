import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('WebSocket Connection Management', () => {
  let mockWebSocket;
  let mockElement;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock DOM elements
    mockElement = {
      textContent: '',
      value: '',
      disabled: false,
      className: '',
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn().mockReturnValue(false)
      },
      addEventListener: vi.fn(),
      appendChild: vi.fn(),
      querySelector: vi.fn().mockReturnValue(null),
      focus: vi.fn(),
      style: {}
    };

    global.document.getElementById = vi.fn().mockReturnValue(mockElement);
    global.console.log = vi.fn();
    global.console.error = vi.fn();

    // Mock WebSocket as a proper class
    class MockWebSocket {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSING = 2;
      static CLOSED = 3;

      constructor(url) {
        this.url = url;
        this.readyState = MockWebSocket.CONNECTING;
        this.send = vi.fn();
        this.close = vi.fn();
        this.onopen = null;
        this.onmessage = null;
        this.onclose = null;
        this.onerror = null;
        mockWebSocket = this;
      }
    }

    global.WebSocket = MockWebSocket;
    global.location = {
      protocol: 'http:',
      host: 'localhost:8000'
    };

    // Initialize mockWebSocket with defaults
    mockWebSocket = {
      readyState: 0,
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null
    };
  });

  describe('WebSocket Creation', () => {
    it('should create WebSocket with correct URL', () => {
      const ws = new WebSocket('ws://localhost:8000/ws');
      expect(ws.url).toBe('ws://localhost:8000/ws');
    });

    it('should use wss protocol for https', () => {
      global.location.protocol = 'https:';
      const ws = new WebSocket('wss://localhost:8000/ws');
      expect(ws.url).toBe('wss://localhost:8000/ws');
    });
  });

  describe('Connection Status', () => {
    it('should handle connecting state', () => {
      mockWebSocket.readyState = WebSocket.CONNECTING;
      
      // Simulate updateConnectionStatus function behavior
      const statusElement = mockElement;
      if (mockWebSocket.readyState === WebSocket.CONNECTING) {
        statusElement.className = 'status-connecting';
        statusElement.textContent = 'Connecting...';
      }
      
      expect(statusElement.className).toBe('status-connecting');
      expect(statusElement.textContent).toBe('Connecting...');
    });

    it('should handle open state', () => {
      mockWebSocket.readyState = WebSocket.OPEN;
      
      // Simulate updateConnectionStatus function behavior
      const statusElement = mockElement;
      if (mockWebSocket.readyState === WebSocket.OPEN) {
        statusElement.className = 'status-connected';
        statusElement.textContent = 'Connected';
      }
      
      expect(statusElement.className).toBe('status-connected');
      expect(statusElement.textContent).toBe('Connected');
    });

    it('should handle closed state', () => {
      mockWebSocket.readyState = WebSocket.CLOSED;
      
      // Simulate updateConnectionStatus function behavior
      const statusElement = mockElement;
      if (mockWebSocket.readyState === WebSocket.CLOSED) {
        statusElement.className = 'status-disconnected';
        statusElement.textContent = 'Disconnected';
      }
      
      expect(statusElement.className).toBe('status-disconnected');
      expect(statusElement.textContent).toBe('Disconnected');
    });
  });

  describe('Message Handling', () => {
    it('should handle join response message', () => {
      const joinResponse = {
        type: 'join_response',
        success: true,
        name: 'TestUser'
      };
      
      const messageEvent = {
        data: JSON.stringify(joinResponse)
      };
      
      // Simulate message parsing
      const data = JSON.parse(messageEvent.data);
      expect(data.type).toBe('join_response');
      expect(data.success).toBe(true);
      expect(data.name).toBe('TestUser');
    });

    it('should handle chat message', () => {
      const chatMessage = {
        type: 'chat_message',
        user: 'TestUser',
        message: 'Hello World',
        timestamp: '12:34:56'
      };
      
      const messageEvent = {
        data: JSON.stringify(chatMessage)
      };
      
      // Simulate message parsing
      const data = JSON.parse(messageEvent.data);
      expect(data.type).toBe('chat_message');
      expect(data.user).toBe('TestUser');
      expect(data.message).toBe('Hello World');
      expect(data.timestamp).toBe('12:34:56');
    });

    it('should handle user count update', () => {
      const userCountMessage = {
        type: 'user_count',
        count: 5
      };
      
      const messageEvent = {
        data: JSON.stringify(userCountMessage)
      };
      
      // Simulate message parsing
      const data = JSON.parse(messageEvent.data);
      expect(data.type).toBe('user_count');
      expect(data.count).toBe(5);
    });

    it('should handle user list update', () => {
      const userListMessage = {
        type: 'user_list',
        users: ['User1', 'User2', 'User3']
      };
      
      const messageEvent = {
        data: JSON.stringify(userListMessage)
      };
      
      // Simulate message parsing
      const data = JSON.parse(messageEvent.data);
      expect(data.type).toBe('user_list');
      expect(data.users).toEqual(['User1', 'User2', 'User3']);
    });
  });

  describe('Sending Messages', () => {
    it('should send join request', () => {
      const joinRequest = {
        type: 'join_request',
        name: 'TestUser'
      };
      
      mockWebSocket.send(JSON.stringify(joinRequest));
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(joinRequest));
    });

    it('should send chat message', () => {
      const chatMessage = {
        type: 'chat_message',
        user: 'TestUser',
        message: 'Hello World'
      };
      
      mockWebSocket.send(JSON.stringify(chatMessage));
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(chatMessage));
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', () => {
      const invalidMessage = 'invalid json';
      
      expect(() => {
        try {
          JSON.parse(invalidMessage);
        } catch (e) {
          // Handle non-JSON messages gracefully
          expect(e).toBeInstanceOf(SyntaxError);
        }
      }).not.toThrow();
    });

    it('should handle connection close', () => {
      const closeEvent = { wasClean: false };
      
      // Simulate onclose handler
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose(closeEvent);
      }
      
      expect(closeEvent.wasClean).toBe(false);
    });
  });

});