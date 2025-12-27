/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'pixi.js';
import { Card, CARD_HEIGHT } from './Card.js';
import { CardContainer } from './CardContainer.js';

// Since we have circular dependencies, we create minimal implementations
// for testing the integration behavior

// Simple Hand implementation
class TestHand extends CardContainer {
  constructor(screen) {
    super(screen);
    this._maxCards = 12;
  }

  _repositionCards() {
    const cards = this.children.filter((child) => child instanceof Card);
    cards.forEach((card, index) => {
      card.x = this._screen.width / 2 + index * 50;
      card.y = this._screen.height - CARD_HEIGHT / 2;
      card.baseX = card.x;
      card.baseY = card.y;
      card.angle = 0;
    });
  }
}

// Simple Left implementation
class TestLeft extends CardContainer {
  constructor(screen) {
    super(screen);
    this._maxCards = 12;
    this.scale.y = 0.75;
  }

  _repositionCards() {
    const cards = this.children.filter((child) => child instanceof Card);
    cards.forEach((card, index) => {
      card.x = 0;
      card.y = 100 + index * 50;
      card.baseX = card.x;
      card.baseY = card.y;
      card.angle = 90;
      card.hoverDirX = 1;
      card.hoverDirY = 0;
    });
  }
}

// Simple Right implementation
class TestRight extends CardContainer {
  constructor(screen) {
    super(screen);
    this._maxCards = 12;
    this.scale.y = 0.75;
  }

  _repositionCards() {
    const cards = this.children.filter((child) => child instanceof Card);
    cards.forEach((card, index) => {
      card.x = this._screen.width;
      card.y = 100 + index * 50;
      card.baseX = card.x;
      card.baseY = card.y;
      card.angle = -90;
      card.hoverDirX = -1;
      card.hoverDirY = 0;
    });
  }
}

// Simple Table implementation
class TestTable extends Container {
  constructor(screen) {
    super();
    this._screen = screen;
    this.scale.y = 0.75;
    this._cellCards = [null, null, null, null];
  }

  _getFreeCells() {
    const free = [];
    for (let i = 0; i < this._cellCards.length; i++) {
      if (this._cellCards[i] === null) {
        free.push(i);
      }
    }
    return free;
  }

  addCard(spriteSheet, textureKey, startPos, startAngle, startAlpha, clickHandler = null) {
    const freeCells = this._getFreeCells();
    if (freeCells.length === 0) {
      return false;
    }

    const cellIndex = freeCells[0];
    const x = this._screen.width / 2;
    const y = 100 + cellIndex * 100;
    const angle = 0;

    const card = new Card(spriteSheet, textureKey, clickHandler, x, y, angle);
    card.baseX = x;
    card.baseY = y;
    this.addChild(card);
    this._cellCards[cellIndex] = card;

    return true;
  }

  removeCard(card) {
    for (let i = 0; i < this._cellCards.length; i++) {
      if (this._cellCards[i] === card) {
        this._cellCards[i] = null;
        break;
      }
    }
    this.removeChild(card);
  }

  resize() {
    this.x = 0;
    this.y = 0;
  }
}

// Create a mock sprite sheet
const createMockSpriteSheet = () => ({
  textures: {
    'AS': { width: 188, height: 263 },
    'KH': { width: 188, height: 263 },
    '7D': { width: 188, height: 263 },
    'TD': { width: 188, height: 263 },
    '9C': { width: 188, height: 263 },
  }
});

describe('Integration Tests', () => {
  let spriteSheet;
  let screen;
  let hand;
  let table;
  let left;
  let right;

  beforeEach(() => {
    spriteSheet = createMockSpriteSheet();
    screen = { width: 720, height: 720 };
    hand = new TestHand(screen);
    table = new TestTable(screen);
    left = new TestLeft(screen);
    right = new TestRight(screen);
  });

  describe('Card movement between containers', () => {
    it('moving card from Hand to Table removes it from Hand', () => {
      // Add card to hand
      hand.addCard(spriteSheet, 'AS', null, null, null);
      expect(hand._getCardCount()).toBe(1);

      // Get the card
      const cards = hand.children.filter((child) => child instanceof Card);
      const card = cards[0];

      // Simulate moving card from Hand to Table
      // In real app, this involves coordinate conversion, but we test the container operations
      const startPos = { x: card.x, y: card.y };
      const success = table.addCard(spriteSheet, card.textureKey, startPos, card.angle, 0.7);
      if (success) {
        hand.removeCard(card);
      }

      expect(hand._getCardCount()).toBe(0);
    });

    it('moving card from Hand to Table adds it to Table', () => {
      // Add card to hand
      hand.addCard(spriteSheet, 'AS', null, null, null);

      // Get the card
      const cards = hand.children.filter((child) => child instanceof Card);
      const card = cards[0];

      // Simulate moving card from Hand to Table
      const startPos = { x: card.x, y: card.y };
      const tableCardCountBefore = table.children.filter((c) => c instanceof Card).length;
      const success = table.addCard(spriteSheet, card.textureKey, startPos, card.angle, 0.7);
      if (success) {
        hand.removeCard(card);
      }

      const tableCardCountAfter = table.children.filter((c) => c instanceof Card).length;
      expect(tableCardCountAfter).toBe(tableCardCountBefore + 1);
    });

    it('moving card from Table to Hand removes it from Table', () => {
      // Add card to table
      table.addCard(spriteSheet, 'AS', null, null, null);
      const tableCardsBefore = table.children.filter((c) => c instanceof Card);
      expect(tableCardsBefore.length).toBe(1);

      // Get the card
      const card = tableCardsBefore[0];

      // Simulate moving card from Table to Hand
      const startPos = { x: card.x, y: card.y };
      const success = hand.addCard(spriteSheet, card.textureKey, startPos, card.angle, 0.7);
      if (success) {
        table.removeCard(card);
      }

      const tableCardsAfter = table.children.filter((c) => c instanceof Card).length;
      expect(tableCardsAfter).toBe(0);
    });

    it('moving card from Left to Table removes it from Left', () => {
      // Add card to left
      left.addCard(spriteSheet, 'AS', null, null, null);
      expect(left._getCardCount()).toBe(1);

      // Get the card
      const cards = left.children.filter((child) => child instanceof Card);
      const card = cards[0];

      // Simulate moving card from Left to Table
      const startPos = { x: card.x, y: card.y };
      const success = table.addCard(spriteSheet, card.textureKey, startPos, card.angle, 0.7);
      if (success) {
        left.removeCard(card);
      }

      expect(left._getCardCount()).toBe(0);
    });
  });

  describe('Resize behavior', () => {
    it('resize event repositions all cards in all containers', () => {
      // Add cards to each container
      hand.addCard(spriteSheet, 'AS', null, null, null);
      left.addCard(spriteSheet, 'KH', null, null, null);
      right.addCard(spriteSheet, '7D', null, null, null);
      table.addCard(spriteSheet, 'TD', null, null, null);

      // Call resize on all containers
      hand.resize();
      left.resize();
      right.resize();
      table.resize();

      // Positions should remain valid after resize
      // (cards should still be in their containers)
      expect(hand._getCardCount()).toBe(1);
      expect(left._getCardCount()).toBe(1);
      expect(right._getCardCount()).toBe(1);
      const tableCardCount = table.children.filter((c) => c instanceof Card).length;
      expect(tableCardCount).toBe(1);
    });
  });
});
