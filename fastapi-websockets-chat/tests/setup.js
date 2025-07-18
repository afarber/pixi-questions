import 'vitest-canvas-mock';

// Mock WebSocket for testing
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 0);
  }
  
  send(data) {
    if (this.onmessage) {
      setTimeout(() => {
        this.onmessage({ data });
      }, 0);
    }
  }
  
  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) this.onclose({ wasClean: true });
  }
};

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

// Mock DOM elements that might be needed
global.document.getElementById = (id) => {
  const mockElement = {
    textContent: '',
    value: '',
    disabled: false,
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    },
    addEventListener: () => {},
    appendChild: () => {},
    querySelector: () => null,
    focus: () => {},
    style: {}
  };
  return mockElement;
};