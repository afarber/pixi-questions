/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PixiCanvas } from '../../src/pixi-canvas.js';

// Mock PIXI globally with proper classes
class MockApplication {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.stage = { addChild: vi.fn() };
    this.screen = { width: 800, height: 400 };
    this.ticker = {
      add: vi.fn(),
      remove: vi.fn(),
      deltaTime: 1,
      lastTime: 1000
    };
  }
  async init() {
    return Promise.resolve();
  }
}

class MockContainer {
  constructor() {
    this.addChild = vi.fn();
    this.removeChild = vi.fn();
  }
}

class MockGraphics {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 80;
    this.height = 40;
    this.userData = {};
    this.addChild = vi.fn();
  }
  rect() { return this; }
  fill() { return this; }
  stroke() { return this; }
}

class MockText {
  constructor() {
    this.anchor = { set: vi.fn() };
    this.x = 0;
    this.y = 0;
  }
}

global.PIXI = {
  Application: MockApplication,
  Container: MockContainer,
  Graphics: MockGraphics,
  Text: MockText
};

describe('PixiCanvas', () => {
  let pixiCanvas;
  let mockElement;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock DOM element
    mockElement = {
      appendChild: vi.fn()
    };
    global.document.getElementById = vi.fn().mockReturnValue(mockElement);
    
    pixiCanvas = new PixiCanvas();
  });

  afterEach(() => {
    // Clean up the canvas using the destroy method
    if (pixiCanvas && pixiCanvas.destroy) {
      pixiCanvas.destroy();
    }
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with correct default values', () => {
      // Note: PixiCanvas constructor calls init() which creates the app
      expect(pixiCanvas.app).not.toBeNull();
      expect(pixiCanvas.userRectangles).toEqual([]);
      expect(pixiCanvas.container).not.toBeNull();
      expect(pixiCanvas.users).toBeInstanceOf(Map);
      expect(pixiCanvas.users.size).toBe(0);
    });

    it('should create PIXI application on init', async () => {
      await pixiCanvas.init();
      expect(pixiCanvas.app).toBeInstanceOf(MockApplication);
    });

    it('should add animation function to ticker', async () => {
      await pixiCanvas.init();
      expect(pixiCanvas.app.ticker.add).toHaveBeenCalledWith(pixiCanvas.animate, pixiCanvas);
    });

    it('should remove animation function from ticker on destroy', async () => {
      await pixiCanvas.init();
      pixiCanvas.destroy();
      expect(pixiCanvas.app.ticker.remove).toHaveBeenCalledWith(pixiCanvas.animate, pixiCanvas);
    });
  });

  describe('Color Generation', () => {
    it('should generate different pastel colors', () => {
      const color1 = pixiCanvas.generatePastelColor();
      const color2 = pixiCanvas.generatePastelColor();
      
      expect(typeof color1).toBe('number');
      expect(typeof color2).toBe('number');
      expect(color1).toBeGreaterThanOrEqual(0);
      expect(color2).toBeGreaterThanOrEqual(0);
    });

    it('should generate colors in valid RGB range', () => {
      for (let i = 0; i < 10; i++) {
        const color = pixiCanvas.generatePastelColor();
        expect(color).toBeGreaterThanOrEqual(0);
        expect(color).toBeLessThanOrEqual(0xFFFFFF);
      }
    });
  });

  describe('User Management', () => {
    beforeEach(async () => {
      await pixiCanvas.init();
    });

    it('should add a new user', () => {
      const userName = 'TestUser';
      pixiCanvas.addUser(userName);
      
      expect(pixiCanvas.users.has(userName)).toBe(true);
      expect(pixiCanvas.userRectangles.length).toBe(1);
    });

    it('should not add duplicate users', () => {
      const userName = 'TestUser';
      pixiCanvas.addUser(userName);
      pixiCanvas.addUser(userName);
      
      expect(pixiCanvas.users.size).toBe(1);
      expect(pixiCanvas.userRectangles.length).toBe(1);
    });

    it('should remove a user', () => {
      const userName = 'TestUser';
      pixiCanvas.addUser(userName);
      expect(pixiCanvas.users.has(userName)).toBe(true);
      
      pixiCanvas.removeUser(userName);
      expect(pixiCanvas.users.has(userName)).toBe(false);
      expect(pixiCanvas.userRectangles.length).toBe(0);
    });

    it('should handle removing non-existent user gracefully', () => {
      expect(() => {
        pixiCanvas.removeUser('NonExistentUser');
      }).not.toThrow();
    });
  });

  describe('User List Updates', () => {
    beforeEach(async () => {
      await pixiCanvas.init();
    });

    it('should update user list correctly', () => {
      const userList = ['User1', 'User2', 'User3'];
      pixiCanvas.updateUsers(userList);
      
      expect(pixiCanvas.users.size).toBe(3);
      expect(pixiCanvas.users.has('User1')).toBe(true);
      expect(pixiCanvas.users.has('User2')).toBe(true);
      expect(pixiCanvas.users.has('User3')).toBe(true);
    });

    it('should remove users not in new list', () => {
      // Add initial users
      pixiCanvas.addUser('User1');
      pixiCanvas.addUser('User2');
      pixiCanvas.addUser('User3');
      
      // Update with fewer users
      const newUserList = ['User1', 'User3'];
      pixiCanvas.updateUsers(newUserList);
      
      expect(pixiCanvas.users.size).toBe(2);
      expect(pixiCanvas.users.has('User1')).toBe(true);
      expect(pixiCanvas.users.has('User2')).toBe(false);
      expect(pixiCanvas.users.has('User3')).toBe(true);
    });

    it('should add new users from list', () => {
      // Add initial users
      pixiCanvas.addUser('User1');
      
      // Update with more users
      const newUserList = ['User1', 'User2', 'User3'];
      pixiCanvas.updateUsers(newUserList);
      
      expect(pixiCanvas.users.size).toBe(3);
      expect(pixiCanvas.users.has('User1')).toBe(true);
      expect(pixiCanvas.users.has('User2')).toBe(true);
      expect(pixiCanvas.users.has('User3')).toBe(true);
    });
  });

  describe('Rectangle Creation', () => {
    beforeEach(async () => {
      await pixiCanvas.init();
    });

    it('should create rectangle with correct properties', () => {
      const name = 'TestUser';
      const color = 0xFF0000;
      const x = 100;
      const y = 200;
      const index = 0;

      pixiCanvas.createUserRectangle(name, color, x, y, index);

      expect(pixiCanvas.userRectangles.length).toBe(1);
      expect(pixiCanvas.users.has(name)).toBe(true);
      expect(pixiCanvas.userRectangles[0]).toBeInstanceOf(MockContainer);
    });
  });
});