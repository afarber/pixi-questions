/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

// Tests for SectionedList.js component
// Tests our custom scrollable list creation and functionality

import { describe, test, expect } from 'vitest';
import { Container } from 'pixi.js';
import { SectionedList } from '../components/SectionedList.js';

describe('SectionedList', () => {

  // Test basic list creation with default options
  test('creates list with default options', () => {
    const list = new SectionedList({});

    expect(list).toBeDefined();
    expect(list._width).toBe(200);
    expect(list._height).toBe(300);
  });

  // Test list creation with custom dimensions
  test('creates list with custom dimensions', () => {
    const list = new SectionedList({
      width: 300,
      height: 400
    });

    expect(list._width).toBe(300);
    expect(list._height).toBe(400);
  });

  // Test list creation with custom styling
  test('creates list with custom styling', () => {
    const list = new SectionedList({
      background: 'LightBlue',
      radius: 10,
      padding: 8,
      elementsMargin: 4
    });

    expect(list._background).toBe('LightBlue');
    expect(list._radius).toBe(10);
    expect(list._padding).toBe(8);
    expect(list._elementsMargin).toBe(4);
  });

  // Test background and mask are created
  test('creates background, content, and mask', () => {
    const list = new SectionedList({});

    expect(list._bg).toBeDefined();
    expect(list._content).toBeDefined();
    expect(list._mask).toBeDefined();
  });

  // Test scrollbar is created
  test('creates scrollbar', () => {
    const list = new SectionedList({});

    expect(list._scrollBar).toBeDefined();
    expect(list._scrollBar.visible).toBe(false);
  });

  // Test addItem adds items to content
  test('addItem adds items to content', () => {
    const list = new SectionedList({});
    const item = new Container();
    item.height = 50;

    list.addItem(item);

    expect(list._items.length).toBe(1);
    expect(list._items[0]).toBe(item);
  });

  // Test removeItems clears all items
  test('removeItems clears all items', () => {
    const list = new SectionedList({});
    const item1 = new Container();
    const item2 = new Container();
    item1.height = 50;
    item2.height = 50;

    list.addItem(item1);
    list.addItem(item2);
    expect(list._items.length).toBe(2);

    list.removeItems();
    expect(list._items.length).toBe(0);
  });

  // Test content height calculation
  test('calculates content height correctly', () => {
    const list = new SectionedList({ elementsMargin: 10 });
    const item1 = new Container();
    const item2 = new Container();
    item1.height = 50;
    item2.height = 30;

    list.addItem(item1);
    list.addItem(item2);

    // 50 + 10 (margin) + 30 = 90
    expect(list._contentHeight).toBe(90);
  });

  // Test setSize updates dimensions
  test('setSize updates dimensions', () => {
    const list = new SectionedList({ width: 200, height: 300 });

    list.setSize({ width: 400, height: 500 });

    expect(list._width).toBe(400);
    expect(list._height).toBe(500);
    expect(list.options.width).toBe(400);
    expect(list.options.height).toBe(500);
  });

  // Test resize method for MyList compatibility
  test('resize method updates position and size', () => {
    const list = new SectionedList({});

    list.resize(100, 200, 300, 400);

    expect(list.position.x).toBe(100);
    expect(list.position.y).toBe(200);
    expect(list._width).toBe(300);
    expect(list._height).toBe(400);
  });

  // Test scrollbar visibility based on content
  test('scrollbar visible when content overflows', () => {
    const list = new SectionedList({
      height: 100,
      padding: 0
    });

    // Add items that exceed viewport
    for (let i = 0; i < 5; i++) {
      const item = new Container();
      item.height = 30;
      list.addItem(item);
    }

    // 5 * 30 = 150 > 100
    expect(list._scrollBar.visible).toBe(true);
  });

  // Test scrollbar hidden when content fits
  test('scrollbar hidden when content fits', () => {
    const list = new SectionedList({
      height: 200,
      padding: 0
    });

    const item = new Container();
    item.height = 50;
    list.addItem(item);

    // 50 < 200
    expect(list._scrollBar.visible).toBe(false);
  });

  // Test options object is accessible
  test('options object is accessible', () => {
    const list = new SectionedList({
      width: 250,
      height: 350
    });

    expect(list.options).toBeDefined();
    expect(list.options.width).toBe(250);
    expect(list.options.height).toBe(350);
  });

  // Test initial scroll position is 0
  test('initial scroll position is 0', () => {
    const list = new SectionedList({});

    expect(list._scrollY).toBe(0);
  });

  // Test event mode is static for interactivity
  test('has correct event mode for interactivity', () => {
    const list = new SectionedList({});

    expect(list.eventMode).toBe('static');
  });

});
