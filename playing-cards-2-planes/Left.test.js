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

vi.mock('./Right.js', () => ({
  Right: class MockRight extends Container {}
}));

import { Left } from './Left.js';
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

describe('Left', () => {
  let spriteSheet;
  let screen;
  let left;

  beforeEach(() => {
    spriteSheet = createMockSpriteSheet();
    screen = { width: 720, height: 720 };
    left = new Left(screen);
  });

  describe('addCard', () => {
    it('returns false when already holding 12 cards', () => {
      // Add 12 cards (max capacity)
      const keys = ['AS', 'KS', 'QS', 'JS', 'TS', '9S', '8S', '7S', 'KH', '7D', 'TD', '9C'];
      keys.forEach((key) => {
        const result = left.addCard(spriteSheet, key, null, null, null);
        expect(result).toBe(true);
      });

      // 13th card should fail
      const result = left.addCard(spriteSheet, 'AC', null, null, null);
      expect(result).toBe(false);
    });
  });

  describe('_repositionCards', () => {
    it('does nothing when empty', () => {
      // Should not throw when called on empty container
      expect(() => left._repositionCards()).not.toThrow();
      // Only non-Card children should exist (none in this case)
      const cards = left.children.filter((child) => child instanceof Card);
      expect(cards.length).toBe(0);
    });

    it('cards are sorted before positioning', () => {
      // Add cards in random order
      left.addCard(spriteSheet, 'KH', null, null, null);
      left.addCard(spriteSheet, 'AS', null, null, null);
      left.addCard(spriteSheet, '9C', null, null, null);
      left.addCard(spriteSheet, '7D', null, null, null);

      // Get cards in z-order (children array order)
      const cards = left.children.filter((child) => child instanceof Card);

      // Cards should be sorted: AS (Spades), 7D (Diamonds), 9C (Clubs), KH (Hearts)
      expect(cards[0].textureKey).toBe('AS');
      expect(cards[1].textureKey).toBe('7D');
      expect(cards[2].textureKey).toBe('9C');
      expect(cards[3].textureKey).toBe('KH');
    });
  });
});
