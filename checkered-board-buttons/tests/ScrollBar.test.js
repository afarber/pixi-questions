// Tests for ScrollBar.js component
// Tests our custom scrollbar creation and interaction

import { describe, test, expect, vi } from 'vitest';
import { ScrollBar } from '../ui/ScrollBar.js';

describe('ScrollBar', () => {

  // Test basic scrollbar creation with default options
  test('creates scrollbar with default options', () => {
    const scrollbar = new ScrollBar({});

    expect(scrollbar).toBeDefined();
    expect(scrollbar._width).toBe(6);
    expect(scrollbar._height).toBe(100);
  });

  // Test scrollbar creation with custom dimensions
  test('creates scrollbar with custom dimensions', () => {
    const scrollbar = new ScrollBar({
      width: 10,
      height: 200
    });

    expect(scrollbar._width).toBe(10);
    expect(scrollbar._height).toBe(200);
  });

  // Test scrollbar creation with custom colors
  test('creates scrollbar with custom colors', () => {
    const scrollbar = new ScrollBar({
      trackColor: 'Blue',
      thumbColor: 'Red'
    });

    expect(scrollbar._trackColor).toBe('Blue');
    expect(scrollbar._thumbColor).toBe('Red');
  });

  // Test track and thumb are created
  test('creates track and thumb graphics', () => {
    const scrollbar = new ScrollBar({});

    expect(scrollbar._track).toBeDefined();
    expect(scrollbar._thumb).toBeDefined();
  });

  // Test setScrollRatio updates thumb position
  test('setScrollRatio updates scroll ratio', () => {
    const scrollbar = new ScrollBar({ height: 100 });

    scrollbar.setScrollRatio(0.5);
    expect(scrollbar._scrollRatio).toBe(0.5);

    scrollbar.setScrollRatio(1);
    expect(scrollbar._scrollRatio).toBe(1);
  });

  // Test setScrollRatio clamps values
  test('setScrollRatio clamps to 0-1 range', () => {
    const scrollbar = new ScrollBar({});

    scrollbar.setScrollRatio(-0.5);
    expect(scrollbar._scrollRatio).toBe(0);

    scrollbar.setScrollRatio(1.5);
    expect(scrollbar._scrollRatio).toBe(1);
  });

  // Test setThumbRatio updates thumb size
  test('setThumbRatio updates thumb ratio', () => {
    const scrollbar = new ScrollBar({});

    scrollbar.setThumbRatio(0.5);
    expect(scrollbar._thumbRatio).toBe(0.5);
  });

  // Test setThumbRatio clamps values
  test('setThumbRatio clamps to 0-1 range', () => {
    const scrollbar = new ScrollBar({});

    scrollbar.setThumbRatio(-0.5);
    expect(scrollbar._thumbRatio).toBe(0);

    scrollbar.setThumbRatio(1.5);
    expect(scrollbar._thumbRatio).toBe(1);
  });

  // Test thumb has minimum height
  test('thumb has minimum height of 20px', () => {
    const scrollbar = new ScrollBar({ height: 100 });

    // Set very small thumb ratio
    scrollbar.setThumbRatio(0.01);

    const thumbHeight = scrollbar._getThumbHeight();
    expect(thumbHeight).toBe(20);
  });

  // Test onScroll callback can be set
  test('onScroll callback can be set', () => {
    const scrollbar = new ScrollBar({});
    const callback = vi.fn();

    scrollbar.onScroll = callback;
    expect(scrollbar.onScroll).toBe(callback);
  });

  // Test setHeight updates scrollbar height
  test('setHeight updates scrollbar height', () => {
    const scrollbar = new ScrollBar({ height: 100 });

    scrollbar.setHeight(200);
    expect(scrollbar._height).toBe(200);
  });

  // Test initial scroll ratio is 0
  test('initial scroll ratio is 0', () => {
    const scrollbar = new ScrollBar({});

    expect(scrollbar._scrollRatio).toBe(0);
  });

  // Test initial thumb ratio is 1
  test('initial thumb ratio is 1', () => {
    const scrollbar = new ScrollBar({});

    expect(scrollbar._thumbRatio).toBe(1);
  });

  // Test thumb is interactive
  test('thumb has correct event mode and cursor', () => {
    const scrollbar = new ScrollBar({});

    expect(scrollbar._thumb.eventMode).toBe('static');
    expect(scrollbar._thumb.cursor).toBe('pointer');
  });

});
