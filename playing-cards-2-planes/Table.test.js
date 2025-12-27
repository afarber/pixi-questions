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

vi.mock('./Left.js', () => ({
  Left: class MockLeft extends Container {}
}));

vi.mock('./Right.js', () => ({
  Right: class MockRight extends Container {}
}));

import { Table } from './Table.js';

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

describe('Table', () => {
  let spriteSheet;
  let screen;
  let table;

  beforeEach(() => {
    spriteSheet = createMockSpriteSheet();
    screen = { width: 720, height: 720 };
    table = new Table(screen);
  });

  describe('_getFreeCells', () => {
    it('returns [0,1,2,3] when empty', () => {
      const freeCells = table._getFreeCells();
      expect(freeCells).toEqual([0, 1, 2, 3]);
    });

    it('returns empty array when full', () => {
      table.addCard(spriteSheet, 'AS', null, null, null);
      table.addCard(spriteSheet, 'KH', null, null, null);
      table.addCard(spriteSheet, '7D', null, null, null);
      table.addCard(spriteSheet, 'TD', null, null, null);

      const freeCells = table._getFreeCells();
      expect(freeCells).toEqual([]);
    });
  });

  describe('addCard', () => {
    it('returns false when all 4 cells are occupied', () => {
      // Fill all 4 cells
      table.addCard(spriteSheet, 'AS', null, null, null);
      table.addCard(spriteSheet, 'KH', null, null, null);
      table.addCard(spriteSheet, '7D', null, null, null);
      table.addCard(spriteSheet, 'TD', null, null, null);

      // 5th card should fail
      const result = table.addCard(spriteSheet, '9C', null, null, null);
      expect(result).toBe(false);
    });
  });
});
