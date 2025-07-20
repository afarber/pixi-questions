// Tests for MyButton.js component
// Tests our custom button creation, animations, and state management

import { describe, test, expect } from 'vitest';
import { MyButton, buttonsTweenGroup } from '../MyButton.js';
import { UI_WIDTH, UI_HEIGHT, UI_RADIUS } from '../Theme.js';

describe('MyButton', () => {
  
  // Test basic button creation with default options
  test('creates button with default options', () => {
    const button = new MyButton({});
    
    // Button should be created successfully
    expect(button).toBeDefined();
    expect(button.options).toBeDefined();
    
    // Should have default dimensions from options
    expect(button.options.width).toBe(UI_WIDTH);
    expect(button.options.height).toBe(UI_HEIGHT);
  });
  
  // Test button creation with custom text
  test('creates button with custom text', () => {
    const buttonText = 'Test Button';
    const button = new MyButton({ text: buttonText });
    
    // Button should store the custom text
    expect(button.options.text).toBe(buttonText);
  });
  
  // Test button creation with custom dimensions
  test('creates button with custom dimensions', () => {
    const customWidth = 300;
    const customHeight = 80;
    const button = new MyButton({ 
      width: customWidth, 
      height: customHeight 
    });
    
    // Button should use custom dimensions
    expect(button.options.width).toBe(customWidth);
    expect(button.options.height).toBe(customHeight);
  });
  
  // Test that button has required event handlers
  test('sets up event handlers', () => {
    const button = new MyButton({});
    
    // Button should have event signal objects from our mock
    expect(button.onHover).toBeDefined();
    expect(button.onDown).toBeDefined();
    expect(button.onUp).toBeDefined();
    expect(button.on).toBeDefined();
    
    // Event signals should have connect method
    expect(button.onHover.connect).toBeDefined();
    expect(button.onDown.connect).toBeDefined();
    expect(button.onUp.connect).toBeDefined();
  });
  
  // Test that handleHover method exists and can be called
  test('has handleHover method', () => {
    const button = new MyButton({});
    
    expect(typeof button.handleHover).toBe('function');
    
    // Method should not throw when called
    expect(() => button.handleHover()).not.toThrow();
  });
  
  // Test that handleDown method exists and can be called
  test('has handleDown method', () => {
    const button = new MyButton({});
    
    expect(typeof button.handleDown).toBe('function');
    
    // Method should not throw when called
    expect(() => button.handleDown()).not.toThrow();
  });
  
  // Test that handleUp method exists and can be called
  test('has handleUp method', () => {
    const button = new MyButton({});
    
    expect(typeof button.handleUp).toBe('function');
    
    // Method should not throw when called
    expect(() => button.handleUp()).not.toThrow();
  });
  
  // Test button enabled state
  test('button is enabled by default', () => {
    const button = new MyButton({});
    
    // Button should be enabled by default
    expect(button.enabled).toBe(true);
  });
  
  // Test button visibility
  test('button is visible by default', () => {
    const button = new MyButton({});
    
    // Button should be visible by default
    expect(button.visible).toBe(true);
  });
  
  // Test show method with animation
  test('show method works with animation', () => {
    const button = new MyButton({});
    
    // Show method should exist and not throw
    expect(typeof button.show).toBe('function');
    expect(() => button.show(true)).not.toThrow();
    
    // Button should be visible after show
    expect(button.visible).toBe(true);
  });
  
  // Test show method without animation
  test('show method works without animation', () => {
    const button = new MyButton({});
    
    // Show without animation should work
    expect(() => button.show(false)).not.toThrow();
    
    // Button should be visible and have normal scale
    expect(button.visible).toBe(true);
    expect(button.scale.x).toBe(1);
    expect(button.scale.y).toBe(1);
  });
  
  // Test hide method with animation
  test('hide method works with animation', () => {
    const button = new MyButton({});
    
    // Hide method should exist and not throw
    expect(typeof button.hide).toBe('function');
    expect(() => button.hide(true)).not.toThrow();
  });
  
  // Test hide method without animation
  test('hide method works without animation', () => {
    const button = new MyButton({});
    
    // Hide without animation should work
    expect(() => button.hide(false)).not.toThrow();
    
    // Button should be hidden with zero scale
    expect(button.visible).toBe(false);
    expect(button.scale.x).toBe(0);
    expect(button.scale.y).toBe(0);
  });
  
  // Test resize method
  test('resize method works correctly', () => {
    const button = new MyButton({});
    
    // Resize method should exist and not throw
    expect(typeof button.resize).toBe('function');
    
    const x = 100;
    const y = 200;
    const w = 250;
    const h = 70;
    const r = 15;
    
    expect(() => button.resize(x, y, w, h, r)).not.toThrow();
    
    // Button position should be updated
    expect(button.position.x).toBe(x);
    expect(button.position.y).toBe(y);
  });
  
  // Test that button creates view graphics
  test('creates view graphics in resize', () => {
    const button = new MyButton({});
    
    // Call resize to trigger view creation
    button.resize(0, 0, UI_WIDTH, UI_HEIGHT, UI_RADIUS);
    
    // Button should have different view states
    expect(button.defaultView).toBeDefined();
    expect(button.hoverView).toBeDefined();
    expect(button.pressedView).toBeDefined();
    expect(button.disabledView).toBeDefined();
  });
  
  // Test activeTween property initialization
  test('initializes activeTween property', () => {
    const button = new MyButton({});
    
    // Should have activeTween property
    expect(button.activeTween).toBeDefined();
    expect(button.activeTween).toBeNull();
  });
  
  // Test buttonsTweenGroup export
  test('exports buttonsTweenGroup', () => {
    // buttonsTweenGroup should be exported and defined
    expect(buttonsTweenGroup).toBeDefined();
    expect(typeof buttonsTweenGroup.update).toBe('function');
  });
  
  // Test DEFAULT_OPTIONS are used
  test('uses default options correctly', () => {
    const button = new MyButton({});
    
    // Should use default values from Theme
    expect(button.options.width).toBe(UI_WIDTH);
    expect(button.options.height).toBe(UI_HEIGHT);
    // Note: radius is passed to resize method, not stored in options
    expect(button.options.text).toBe('');
  });
  
  // Test options merging
  test('merges custom options with defaults', () => {
    const customText = 'Custom';
    const customWidth = 300;
    const button = new MyButton({
      text: customText,
      width: customWidth
      // height should use defaults
    });
    
    // Should use custom values where provided
    expect(button.options.text).toBe(customText);
    expect(button.options.width).toBe(customWidth);
    
    // Should use defaults for non-specified options
    expect(button.options.height).toBe(UI_HEIGHT);
  });
  
  // Test button with empty options object
  test('handles empty options object', () => {
    const button = new MyButton({});
    
    // Should not throw and should use all defaults
    expect(button).toBeDefined();
    expect(button.options.text).toBe('');
    expect(button.options.width).toBe(UI_WIDTH);
    expect(button.options.height).toBe(UI_HEIGHT);
  });

});