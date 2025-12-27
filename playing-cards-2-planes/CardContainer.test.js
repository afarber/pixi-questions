/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container, Sprite } from 'pixi.js';

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

vi.mock('./Right.js', () => ({
  Right: class MockRight extends Container {}
}));

import { CardContainer } from './CardContainer.js';
import { Card } from './Card.js';

// Concrete implementation for testing the abstract CardContainer
class TestCardContainer extends CardContainer {
  constructor(screen) {
    super(screen);
    this._maxCards = 3;
  }

  _repositionCards() {
    const cards = this.children.filter((child) => child instanceof Card);
    cards.forEach((card, index) => {
      card.x = index * 100;
      card.y = 100;
      card.baseX = card.x;
      card.baseY = card.y;
      card.angle = 0;
    });
  }
}

// Create a mock sprite sheet
const createMockSpriteSheet = () => ({
  textures: {
    'AS': { width: 188, height: 263 },
    'KH': { width: 188, height: 263 },
    '7D': { width: 188, height: 263 },
    'TD': { width: 188, height: 263 },
  }
});

describe('CardContainer', () => {
  let spriteSheet;
  let screen;
  let container;

  beforeEach(() => {
    spriteSheet = createMockSpriteSheet();
    screen = { width: 720, height: 720 };
    container = new TestCardContainer(screen);
  });

  describe('_getCardCount', () => {
    it('returns 0 for empty container', () => {
      expect(container._getCardCount()).toBe(0);
    });

    it('counts only Card children, not other sprites', () => {
      // Add a Card
      container.addCard(spriteSheet, 'AS', null, null, null);
      // Add a non-Card child (plain Sprite)
      const sprite = new Sprite();
      container.addChild(sprite);

      expect(container._getCardCount()).toBe(1);
      expect(container.children.length).toBe(2);
    });
  });

  describe('addCard', () => {
    it('returns true when container has space', () => {
      const result = container.addCard(spriteSheet, 'AS', null, null, null);
      expect(result).toBe(true);
    });

    it('returns false when container is at max capacity', () => {
      container.addCard(spriteSheet, 'AS', null, null, null);
      container.addCard(spriteSheet, 'KH', null, null, null);
      container.addCard(spriteSheet, '7D', null, null, null);
      // Container is now at max capacity (3)
      const result = container.addCard(spriteSheet, 'TD', null, null, null);
      expect(result).toBe(false);
    });

    it('creates card with correct textureKey', () => {
      container.addCard(spriteSheet, 'KH', null, null, null);
      const cards = container.children.filter((child) => child instanceof Card);
      expect(cards.length).toBe(1);
      expect(cards[0].textureKey).toBe('KH');
    });

    it('with null startPos places card without animation', () => {
      container.addCard(spriteSheet, 'AS', null, null, null);
      const cards = container.children.filter((child) => child instanceof Card);
      const card = cards[0];
      // Card should be at position set by _repositionCards (0, 100 for first card)
      expect(card.x).toBe(0);
      expect(card.y).toBe(100);
    });

    it('with startPos animates card to final position', () => {
      const startPos = { x: 500, y: 500 };
      container.addCard(spriteSheet, 'AS', startPos, 45, 0.5);
      const cards = container.children.filter((child) => child instanceof Card);
      const card = cards[0];
      // Card starts at startPos (before animation completes)
      expect(card.x).toBe(500);
      expect(card.y).toBe(500);
      expect(card.angle).toBe(45);
      expect(card.alpha).toBe(0.5);
    });
  });

  describe('removeCard', () => {
    it('decreases card count by 1', () => {
      container.addCard(spriteSheet, 'AS', null, null, null);
      container.addCard(spriteSheet, 'KH', null, null, null);
      expect(container._getCardCount()).toBe(2);

      const cards = container.children.filter((child) => child instanceof Card);
      container.removeCard(cards[0]);
      expect(container._getCardCount()).toBe(1);
    });
  });
});
