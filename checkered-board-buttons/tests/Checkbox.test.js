/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

// Tests for MyCheckbox.js component
// Tests our custom checkbox creation and state management

import { describe, test, expect, vi } from 'vitest';
import { Checkbox } from '../ui/Checkbox.js';

describe('MyCheckbox', () => {

  // Test basic checkbox creation with default options
  test('creates checkbox with default options', () => {
    const checkbox = new Checkbox({});

    // Checkbox should be created successfully
    expect(checkbox).toBeDefined();
    expect(checkbox._boxSize).toBe(24);
    expect(checkbox._boxRadius).toBe(4);
  });

  // Test checkbox creation with custom text
  test('creates checkbox with custom text', () => {
    const checkboxText = 'Test Option';
    const checkbox = new Checkbox({ text: checkboxText });

    expect(checkbox.text).toBe(checkboxText);
  });

  // Test initial state is unchecked
  test('initial state is unchecked', () => {
    const checkbox = new Checkbox({});

    expect(checkbox.checked).toBe(false);
    expect(checkbox._uncheckedView.visible).toBe(true);
    expect(checkbox._checkedView.visible).toBe(false);
  });

  // Test checked property setter
  test('setting checked updates state and views', () => {
    const checkbox = new Checkbox({});

    checkbox.checked = true;
    expect(checkbox.checked).toBe(true);
    expect(checkbox._uncheckedView.visible).toBe(false);
    expect(checkbox._checkedView.visible).toBe(true);

    checkbox.checked = false;
    expect(checkbox.checked).toBe(false);
    expect(checkbox._uncheckedView.visible).toBe(true);
    expect(checkbox._checkedView.visible).toBe(false);
  });

  // Test setting same value doesn't trigger update
  test('setting same checked value is ignored', () => {
    const checkbox = new Checkbox({});

    checkbox.checked = false;
    // Should not throw or cause issues
    expect(checkbox.checked).toBe(false);
  });

  // Test text property getter and setter
  test('text property getter and setter work', () => {
    const checkbox = new Checkbox({ text: 'Initial' });

    expect(checkbox.text).toBe('Initial');

    checkbox.text = 'Updated';
    expect(checkbox.text).toBe('Updated');
  });

  // Test event mode and cursor
  test('has correct event mode and cursor', () => {
    const checkbox = new Checkbox({});

    expect(checkbox.eventMode).toBe('static');
    expect(checkbox.cursor).toBe('pointer');
  });

  // Test onToggle callback can be set
  test('onToggle callback can be set', () => {
    const checkbox = new Checkbox({});
    const callback = vi.fn();

    checkbox.onToggle = callback;
    expect(checkbox.onToggle).toBe(callback);
  });

  // Test views are created
  test('creates unchecked and checked views', () => {
    const checkbox = new Checkbox({});

    expect(checkbox._uncheckedView).toBeDefined();
    expect(checkbox._checkedView).toBeDefined();
  });

  // Test text view is created
  test('creates text view', () => {
    const checkbox = new Checkbox({});

    expect(checkbox._textView).toBeDefined();
  });

  // Test custom box size
  test('creates checkbox with custom box size', () => {
    const checkbox = new Checkbox({ boxSize: 32 });

    expect(checkbox._boxSize).toBe(32);
  });

  // Test custom colors
  test('creates checkbox with custom colors', () => {
    const checkbox = new Checkbox({
      boxColor: 'LightGray',
      checkColor: 'Blue'
    });

    expect(checkbox._boxColor).toBe('LightGray');
    expect(checkbox._checkColor).toBe('Blue');
  });

  // Test empty options object
  test('handles empty options object', () => {
    const checkbox = new Checkbox({});

    expect(checkbox).toBeDefined();
    expect(checkbox.text).toBe('');
    expect(checkbox.checked).toBe(false);
  });

});
