/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container } from 'pixi.js';

// Mock the container classes to avoid circular dependencies
vi.mock('./Hand.js', () => ({
  Hand: class MockHand extends Container {
    constructor() {
      super();
      this._isHand = true;
    }
  }
}));

vi.mock('./Table.js', () => ({
  Table: class MockTable extends Container {
    constructor() {
      super();
      this._isTable = true;
    }
  }
}));

vi.mock('./Left.js', () => ({
  Left: class MockLeft extends Container {
    constructor() {
      super();
      this._isLeft = true;
    }
  }
}));

vi.mock('./Right.js', () => ({
  Right: class MockRight extends Container {
    constructor() {
      super();
      this._isRight = true;
    }
  }
}));

import { Card } from './Card.js';
import { Hand } from './Hand.js';
import { Table } from './Table.js';
import { Left } from './Left.js';
import { Right } from './Right.js';

// Create a mock sprite sheet
const createMockSpriteSheet = () => ({
  textures: {
    'AS': { width: 188, height: 263 },
    'KH': { width: 188, height: 263 },
    '7D': { width: 188, height: 263 },
    'TD': { width: 188, height: 263 },
    '9C': { width: 188, height: 263 },
    'QS': { width: 188, height: 263 },
    'JH': { width: 188, height: 263 },
    '8S': { width: 188, height: 263 },
  }
});

describe('Card', () => {
  let spriteSheet;

  beforeEach(() => {
    spriteSheet = createMockSpriteSheet();
  });

  describe('Static Methods', () => {
    describe('isValidCard', () => {
      it('returns true for valid keys like "AS", "7H", "TD"', () => {
        expect(Card.isValidCard('AS')).toBe(true);
        expect(Card.isValidCard('7H')).toBe(true);
        expect(Card.isValidCard('TD')).toBe(true);
        expect(Card.isValidCard('KC')).toBe(true);
        expect(Card.isValidCard('QD')).toBe(true);
        expect(Card.isValidCard('JS')).toBe(true);
        expect(Card.isValidCard('9H')).toBe(true);
        expect(Card.isValidCard('8C')).toBe(true);
      });

      it('returns false for invalid keys like "1S", "AX", "ZZ"', () => {
        expect(Card.isValidCard('1S')).toBe(false);
        expect(Card.isValidCard('AX')).toBe(false);
        expect(Card.isValidCard('ZZ')).toBe(false);
        expect(Card.isValidCard('6H')).toBe(false);
        expect(Card.isValidCard('2D')).toBe(false);
        expect(Card.isValidCard('')).toBe(false);
        expect(Card.isValidCard('A')).toBe(false);
      });
    });

    describe('compareCards', () => {
      it('sorts by suit order: Spades, Diamonds, Clubs, Hearts', () => {
        const cardS = new Card(spriteSheet, 'AS');
        const cardD = new Card(spriteSheet, 'TD');
        const cardC = new Card(spriteSheet, '9C');
        const cardH = new Card(spriteSheet, 'KH');

        const cards = [cardH, cardC, cardD, cardS];
        cards.sort(Card.compareCards);

        expect(cards[0].textureKey).toBe('AS');
        expect(cards[1].textureKey).toBe('TD');
        expect(cards[2].textureKey).toBe('9C');
        expect(cards[3].textureKey).toBe('KH');
      });

      it('sorts by rank within same suit: A, K, Q, J, T, 9, 8, 7', () => {
        const cardA = new Card(spriteSheet, 'AS');
        const cardQ = new Card(spriteSheet, 'QS');
        const card8 = new Card(spriteSheet, '8S');

        // Test Spades: A, Q, 8
        const spades = [card8, cardQ, cardA];
        spades.sort(Card.compareCards);
        expect(spades[0].textureKey).toBe('AS');
        expect(spades[1].textureKey).toBe('QS');
        expect(spades[2].textureKey).toBe('8S');
      });
    });
  });

  describe('Instance Methods', () => {
    it('isParentHand() returns true when card is in Hand container', () => {
      const hand = new Hand();
      const card = new Card(spriteSheet, 'AS');
      hand.addChild(card);
      expect(card.isParentHand()).toBe(true);
    });

    it('isParentHand() returns false when card is in Table container', () => {
      const table = new Table();
      const card = new Card(spriteSheet, 'AS');
      table.addChild(card);
      expect(card.isParentHand()).toBe(false);
    });

    it('isParentTable() returns true when card is in Table container', () => {
      const table = new Table();
      const card = new Card(spriteSheet, 'AS');
      table.addChild(card);
      expect(card.isParentTable()).toBe(true);
    });

    it('isParentLeft() returns true when card is in Left container', () => {
      const left = new Left();
      const card = new Card(spriteSheet, 'AS');
      left.addChild(card);
      expect(card.isParentLeft()).toBe(true);
    });

    it('isParentRight() returns true when card is in Right container', () => {
      const right = new Right();
      const card = new Card(spriteSheet, 'AS');
      right.addChild(card);
      expect(card.isParentRight()).toBe(true);
    });
  });
});
