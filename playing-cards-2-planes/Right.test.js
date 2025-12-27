/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container } from 'pixi.js';

// Mock the circular dependencies
vi.mock('./Hand.js', () => ({
  Hand: class MockHand extends Container {}
}));

vi.mock('./Table.js', () => ({
  Table: class MockTable extends Container {}
}));

vi.mock('./Left.js', () => ({
  Left: class MockLeft extends Container {}
}));

import { Right } from './Right.js';
import { Card } from './Card.js';

// Create a mock sprite sheet
const createMockSpriteSheet = () => ({
  textures: {
    'AS': { width: 188, height: 263 },
    'KS': { width: 188, height: 263 },
    'QS': { width: 188, height: 263 },
    'JS': { width: 188, height: 263 },
    'TS': { width: 188, height: 263 },
    '9S': { width: 188, height: 263 },
    '8S': { width: 188, height: 263 },
    '7S': { width: 188, height: 263 },
    'KH': { width: 188, height: 263 },
    '7D': { width: 188, height: 263 },
    'TD': { width: 188, height: 263 },
    '9C': { width: 188, height: 263 },
    'AC': { width: 188, height: 263 },
  }
});

describe('Right', () => {
  let spriteSheet;
  let screen;
  let right;

  beforeEach(() => {
    spriteSheet = createMockSpriteSheet();
    screen = { width: 720, height: 720 };
    right = new Right(screen);
  });

  it('has max capacity of 12 cards', () => {
    expect(right._maxCards).toBe(12);
  });

  describe('addCard', () => {
    it('returns false when already holding 12 cards', () => {
      // Add 12 cards (max capacity)
      const keys = ['AS', 'KS', 'QS', 'JS', 'TS', '9S', '8S', '7S', 'KH', '7D', 'TD', '9C'];
      keys.forEach((key) => {
        const result = right.addCard(spriteSheet, key, null, null, null);
        expect(result).toBe(true);
      });

      // 13th card should fail
      const result = right.addCard(spriteSheet, 'AC', null, null, null);
      expect(result).toBe(false);
    });
  });

  describe('container properties', () => {
    it('has scale.y of 0.75', () => {
      expect(right.scale.y).toBe(0.75);
    });
  });

  describe('card properties after positioning', () => {
    it('cards are rotated -90 degrees base angle', () => {
      right.addCard(spriteSheet, 'AS', null, null, null);
      const cards = right.children.filter((child) => child instanceof Card);
      // Single card should be at -90 degrees (no tilt applied)
      expect(cards[0].angle).toBe(-90);
    });

    it('cards are positioned at X = screen.width (right edge)', () => {
      right.addCard(spriteSheet, 'AS', null, null, null);
      const cards = right.children.filter((child) => child instanceof Card);
      // Card position should be at screen width plus jitter (jitter is -4 to +4)
      // baseX = screen.width + jitterX, so it should be within 4 pixels of 720
      expect(cards[0].baseX).toBeGreaterThanOrEqual(720 - 4);
      expect(cards[0].baseX).toBeLessThanOrEqual(720 + 4);
    });

    it('cards have hoverDirX = -1 for inward hover push', () => {
      right.addCard(spriteSheet, 'AS', null, null, null);
      const cards = right.children.filter((child) => child instanceof Card);
      expect(cards[0].hoverDirX).toBe(-1);
      expect(cards[0].hoverDirY).toBe(0);
    });
  });

  describe('_repositionCards', () => {
    it('does nothing when empty', () => {
      // Should not throw when called on empty container
      expect(() => right._repositionCards()).not.toThrow();
      const cards = right.children.filter((child) => child instanceof Card);
      expect(cards.length).toBe(0);
    });

    it('cards are reversed after sorting for correct z-order', () => {
      // Add cards in random order
      right.addCard(spriteSheet, 'KH', null, null, null);
      right.addCard(spriteSheet, 'AS', null, null, null);
      right.addCard(spriteSheet, '9C', null, null, null);
      right.addCard(spriteSheet, '7D', null, null, null);

      // Get cards in z-order (children array order)
      const cards = right.children.filter((child) => child instanceof Card);

      // After sorting (S, D, C, H) and reversing, the order should be:
      // Hearts at index 0 (will be at top visually), Spades at index 3 (at bottom)
      // But the code does: sort -> remove -> add (which preserves sorted order)
      // Then iterates in reverse order to set positions
      // So z-order stays: AS, 7D, 9C, KH
      // But positions are assigned in reverse: KH gets first Y, AS gets last Y
      expect(cards[0].textureKey).toBe('AS');
      expect(cards[1].textureKey).toBe('7D');
      expect(cards[2].textureKey).toBe('9C');
      expect(cards[3].textureKey).toBe('KH');

      // Verify reverse positioning: first sorted card (AS) should have higher Y
      // because iteration is reversed
      expect(cards[0].y).toBeGreaterThan(cards[3].y);
    });
  });
});
