/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

// Test setup file that runs before each test
// This file mocks PixiJS and other dependencies so we can test our game logic
// without needing real graphics rendering

import 'vitest-canvas-mock';
import { vi } from 'vitest';

// Mock PixiJS - Create fake versions of PixiJS classes that track method calls
// instead of actually rendering graphics. This lets us test our logic without
// needing a real browser or graphics context.

vi.mock('pixi.js', () => {
  // Fake Graphics class that remembers what drawing methods were called
  class MockGraphics {
    constructor() {
      // Track rect() calls
      this.rectCalls = [];
      // Track fill() calls
      this.fillCalls = [];
      // Track stroke() calls
      this.strokeCalls = [];
      // Display properties
      this.visible = true;
      this.alpha = 1;
      this.x = 0;
      this.y = 0;
      this.eventMode = 'auto';
      this.cursor = null;
      this.position = {
        x: 0,
        y: 0,
        set: (x, y) => {
          this.position.x = x;
          this.position.y = y;
        }
      };
    }
    
    // Fake rect method - just remember it was called with these parameters
    rect(x, y, w, h) {
      this.rectCalls.push({ x, y, w, h });
      // Return this for method chaining like real PixiJS
      return this;
    }
    
    // Fake fill method - remember the color that was used
    fill(options) {
      this.fillCalls.push(options);
      return this;
    }
    
    // Fake stroke method
    stroke(options) {
      this.strokeCalls.push(options);
      return this;
    }
    
    // Fake clear method
    clear() {
      this.rectCalls = [];
      this.fillCalls = [];
      this.strokeCalls = [];
      return this;
    }
    
    // Fake roundRect method
    roundRect(x, y, w, h, radius) {
      this.rectCalls.push({ x, y, w, h, radius });
      return this;
    }

    // Fake moveTo method
    moveTo(_x, _y) {
      return this;
    }

    // Fake lineTo method
    lineTo(_x, _y) {
      return this;
    }

    // Fake circle method
    circle(_x, _y, _radius) {
      return this;
    }

    // Mock event methods
    on(_event, _handler) {
      return this;
    }

    off(_event, _handler) {
      return this;
    }

    emit(_event, ..._args) {
      return this;
    }
  }
  
  // Fake Container class that tracks children
  class MockContainer {
    constructor() {
      // Track child objects
      this.children = [];
      // Position properties
      this.x = 0;
      this.y = 0;
      // Size properties
      this.width = 0;
      this.height = 0;
      // Scale properties with set method
      this.scale = { 
        x: 1, 
        y: 1,
        set: (x, y) => {
          if (typeof x === 'number' && typeof y === 'number') {
            this.scale.x = x;
            this.scale.y = y;
          } else if (typeof x === 'number') {
            this.scale.x = x;
            this.scale.y = x;
          }
        }
      };
      // Position properties with set method
      this.position = { 
        x: 0, 
        y: 0,
        set: (x, y) => {
          this.position.x = x;
          this.position.y = y;
        }
      };
      this.anchor = { x: 0, y: 0 };
      this.rotation = 0;
      this.alpha = 1;
      this.visible = true;
      this.eventMode = 'auto';
      this.cursor = null;
      this.hitArea = null;
    }
    
    // Fake addChild - just add to our children array
    addChild(child) {
      this.children.push(child);
      return child;
    }
    
    // Fake removeChild
    removeChild(child) {
      const index = this.children.indexOf(child);
      if (index > -1) {
        this.children.splice(index, 1);
        child.parent = null;
      }
      return child;
    }
    
    // Fake positioning methods
    set(x, y) {
      this.x = x;
      this.y = y;
    }
    
    // Mock methods for coordinate conversion
    getGlobalPosition() {
      return { x: this.x, y: this.y };
    }

    getLocalPosition() {
      return { x: this.x, y: this.y };
    }

    toLocal(globalPoint) {
      return { x: globalPoint.x - this.x, y: globalPoint.y - this.y };
    }

    // Mock event methods
    on(_event, _handler) {
      return this;
    }

    off(_event, _handler) {
      return this;
    }

    emit(_event, ..._args) {
      return this;
    }
  }

  // Fake Text class
  class MockText extends MockContainer {
    constructor(options = {}) {
      super();
      this.text = options.text || '';
      this.style = options.style || {};
      // Text objects have anchor property with set method
      this.anchor = { 
        x: 0, 
        y: 0,
        set: vi.fn((x, y) => {
          this.anchor.x = x;
          this.anchor.y = y || x;
        })
      };
    }
  }
  
  // Fake Sprite class
  class MockSprite extends MockContainer {
    constructor() {
      super();
      this.anchor = { set: (x, y) => { this.anchor.x = x; this.anchor.y = y; } };
    }
    
    static from() {
      return new MockSprite();
    }
  }
  
  // Fake Rectangle class for hit areas
  class MockRectangle {
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
  }
  
  // Fake Point class for positions
  class MockPoint {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
  }
  
  // Return our fake PixiJS module
  return {
    Graphics: MockGraphics,
    Container: MockContainer,
    Text: MockText,
    Sprite: MockSprite,
    Rectangle: MockRectangle,
    Point: MockPoint,
    
    // Mock Application class
    Application: class MockApplication {
      constructor() {
        this.stage = new MockContainer();
        this.screen = { width: 800, height: 600 };
        this.ticker = {
          add: vi.fn(),
          remove: vi.fn()
        };
      }
      
      async init() {
        return Promise.resolve();
      }
    },
    
    // Mock Assets for loading
    Assets: {
      init: vi.fn().mockResolvedValue(undefined),
      loadBundle: vi.fn().mockResolvedValue({}),
      from: vi.fn().mockReturnValue({})
    }
  };
});

// Mock @pixi/ui components
vi.mock('@pixi/ui', () => ({
  FancyButton: class MockFancyButton {
    constructor(options) {
      this.options = options;
      this.enabled = true;
      this.visible = true;
      // Scale properties with set method
      this.scale = { 
        x: 1, 
        y: 1,
        set: (x, y) => {
          if (typeof x === 'number' && typeof y === 'number') {
            this.scale.x = x;
            this.scale.y = y;
          } else if (typeof x === 'number') {
            this.scale.x = x;
            this.scale.y = x;
          }
        }
      };
      // Position properties with set method
      this.position = { 
        x: 0, 
        y: 0,
        set: (x, y) => {
          this.position.x = x;
          this.position.y = y;
        }
      };
      
      // Mock signal objects for events
      this.onPress = { connect: vi.fn() };
      this.onHover = { connect: vi.fn() };
      this.onDown = { connect: vi.fn() };
      this.onUp = { connect: vi.fn() };
      this.on = vi.fn();
    }
    
    resize() {}
  },
  
  ScrollBox: class MockScrollBox {
    constructor(options) {
      this.options = options;
      this.items = [];
      // Position properties with set method
      this.position = { 
        x: 0, 
        y: 0,
        set: (x, y) => {
          this.position.x = x;
          this.position.y = y;
        }
      };
    }
    
    addItem(item) {
      this.items.push(item);
    }
    
    removeItems() {
      this.items = [];
    }
    
    setSize(size) {
      this.options.width = size.width;
      this.options.height = size.height;
    }
  }
}));

// Mock @pixi/sound
vi.mock('@pixi/sound', () => ({
  sound: {
    play: vi.fn()
  }
}));

// Mock @tweenjs/tween.js
vi.mock('@tweenjs/tween.js', () => ({
  Group: class MockGroup {
    update() {}
  },
  
  Tween: class MockTween {
    constructor(object, group) {
      this.object = object;
      this.group = group;
    }
    
    to() { return this; }
    delay() { return this; }
    easing() { return this; }
    onComplete() { return this; }
    start() { return this; }
    stop() { return this; }
  },
  
  Easing: {
    Back: {
      In: () => {},
      Out: () => {}
    }
  }
}));

// Global test utilities
global.expect = expect;
global.vi = vi;