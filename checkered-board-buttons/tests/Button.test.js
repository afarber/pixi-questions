/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

// Tests for MyButton.js component
// Tests our custom button creation, animations, and state management

import { describe, test, expect, vi } from 'vitest';
import { Button, buttonsTweenGroup } from '../components/Button.js';
import { UI_WIDTH, UI_HEIGHT, UI_RADIUS } from '../Theme.js';

describe('MyButton', () => {

  // Test basic button creation with default options
  test('creates button with default options', () => {
    const button = new Button({});

    // Button should be created successfully
    expect(button).toBeDefined();

    // Should have default dimensions
    expect(button._width).toBe(UI_WIDTH);
    expect(button._height).toBe(UI_HEIGHT);
    expect(button._radius).toBe(UI_RADIUS);
  });

  // Test button creation with custom text
  test('creates button with custom text', () => {
    const buttonText = 'Test Button';
    const button = new Button({ text: buttonText });

    // Button should have the custom text
    expect(button.text).toBe(buttonText);
  });

  // Test button creation with custom dimensions
  test('creates button with custom dimensions', () => {
    const customWidth = 300;
    const customHeight = 80;
    const button = new Button({
      width: customWidth,
      height: customHeight
    });

    // Button should use custom dimensions
    expect(button._width).toBe(customWidth);
    expect(button._height).toBe(customHeight);
  });

  // Test button enabled state
  test('button is enabled by default', () => {
    const button = new Button({});

    // Button should be enabled by default
    expect(button.enabled).toBe(true);
  });

  // Test button can be disabled
  test('button can be disabled', () => {
    const button = new Button({ enabled: false });

    expect(button.enabled).toBe(false);
    expect(button.eventMode).toBe('none');
  });

  // Test enabling/disabling button
  test('can toggle enabled state', () => {
    const button = new Button({});

    button.enabled = false;
    expect(button.enabled).toBe(false);
    expect(button.eventMode).toBe('none');

    button.enabled = true;
    expect(button.enabled).toBe(true);
    expect(button.eventMode).toBe('static');
  });

  // Test button visibility
  test('button is visible by default', () => {
    const button = new Button({});

    // Button should be visible by default
    expect(button.visible).toBe(true);
  });

  // Test show method with animation
  test('show method works with animation', () => {
    const button = new Button({});

    // Show method should exist and not throw
    expect(typeof button.show).toBe('function');
    expect(() => button.show(true)).not.toThrow();

    // Button should be visible after show
    expect(button.visible).toBe(true);
  });

  // Test show method without animation
  test('show method works without animation', () => {
    const button = new Button({});

    // Show without animation should work
    expect(() => button.show(false)).not.toThrow();

    // Button should be visible and have normal scale
    expect(button.visible).toBe(true);
    expect(button.scale.x).toBe(1);
    expect(button.scale.y).toBe(1);
  });

  // Test show method with delay
  test('show method accepts delay parameter', () => {
    const button = new Button({});

    expect(() => button.show(true, 100)).not.toThrow();
    expect(button.visible).toBe(true);
  });

  // Test hide method with animation
  test('hide method works with animation', () => {
    const button = new Button({});

    // Hide method should exist and not throw
    expect(typeof button.hide).toBe('function');
    expect(() => button.hide(true)).not.toThrow();
  });

  // Test hide method without animation
  test('hide method works without animation', () => {
    const button = new Button({});

    // Hide without animation should work
    expect(() => button.hide(false)).not.toThrow();

    // Button should be hidden with zero scale
    expect(button.visible).toBe(false);
    expect(button.scale.x).toBe(0);
    expect(button.scale.y).toBe(0);
  });

  // Test resize method
  test('resize method works correctly', () => {
    const button = new Button({});

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
    expect(button._width).toBe(w);
    expect(button._height).toBe(h);
    expect(button._radius).toBe(r);
  });

  // Test resize uses default radius
  test('resize uses default radius when not provided', () => {
    const button = new Button({});

    button.resize(0, 0, 200, 60);

    expect(button._radius).toBe(UI_RADIUS);
  });

  // Test that button creates background graphics
  test('creates background graphics', () => {
    const button = new Button({});

    // Button should have background
    expect(button._background).toBeDefined();
  });

  // Test that button creates text view
  test('creates text view', () => {
    const button = new Button({});

    // Button should have text view
    expect(button._textView).toBeDefined();
  });

  // Test text property getter and setter
  test('text property getter and setter work', () => {
    const button = new Button({ text: 'Initial' });

    expect(button.text).toBe('Initial');

    button.text = 'Updated';
    expect(button.text).toBe('Updated');
  });

  // Test activeTween property initialization
  test('initializes activeTween property', () => {
    const button = new Button({});

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

  // Test toggle functionality
  test('button can be created as toggle', () => {
    const button = new Button({ isToggle: true });

    expect(button.isToggle).toBe(true);
    expect(button.toggled).toBe(false);
  });

  // Test toggle state
  test('toggled property can be set', () => {
    const button = new Button({ isToggle: true });

    button.toggled = true;
    expect(button.toggled).toBe(true);

    button.toggled = false;
    expect(button.toggled).toBe(false);
  });

  // Test onPress callback
  test('onPress callback can be set', () => {
    const button = new Button({});
    const callback = vi.fn();

    button.onPress = callback;
    expect(button.onPress).toBe(callback);
  });

  // Test onToggle callback
  test('onToggle callback can be set', () => {
    const button = new Button({ isToggle: true });
    const callback = vi.fn();

    button.onToggle = callback;
    expect(button.onToggle).toBe(callback);
  });

  // Test pointer event handlers exist
  test('has pointer event handlers', () => {
    const button = new Button({});

    expect(typeof button._onPointerOver).toBe('function');
    expect(typeof button._onPointerOut).toBe('function');
    expect(typeof button._onPointerDown).toBe('function');
    expect(typeof button._onPointerUp).toBe('function');
    expect(typeof button._onPointerUpOutside).toBe('function');
  });

  // Test event mode and cursor
  test('has correct event mode and cursor', () => {
    const button = new Button({});

    expect(button.eventMode).toBe('static');
    expect(button.cursor).toBe('pointer');
  });

  // Test isToggle property can be changed
  test('isToggle property can be changed', () => {
    const button = new Button({});

    expect(button.isToggle).toBe(false);

    button.isToggle = true;
    expect(button.isToggle).toBe(true);
  });

  // Test button with empty options object
  test('handles empty options object', () => {
    const button = new Button({});

    // Should not throw and should use all defaults
    expect(button).toBeDefined();
    expect(button.text).toBe('');
    expect(button._width).toBe(UI_WIDTH);
    expect(button._height).toBe(UI_HEIGHT);
  });

  // Test canceling active tween on show
  test('cancels active tween when showing', () => {
    const button = new Button({});

    // Start a hide animation
    button.hide(true);
    expect(button.activeTween).not.toBeNull();

    // Show should cancel the previous tween
    button.show(true);
    expect(button.visible).toBe(true);
  });

  // Test canceling active tween on hide
  test('cancels active tween when hiding', () => {
    const button = new Button({});

    // Start a show animation
    button.show(true);
    expect(button.activeTween).not.toBeNull();

    // Hide should cancel the previous tween
    button.hide(false);
    expect(button.visible).toBe(false);
  });

});
