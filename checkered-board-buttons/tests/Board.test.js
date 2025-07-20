// Tests for Board.js component
// Tests our checkered board creation logic and resize calculations

import { describe, test, expect } from 'vitest';
import { Board, NUM_CELLS } from '../Board.js';
import { TILE_SIZE } from '../Tile.js';

describe('Board', () => {
  
  // Test that Board can be created without errors
  test('creates board successfully', () => {
    const board = new Board();
    
    // Board should be a Container (from our mock)
    expect(board).toBeDefined();
    expect(board.children).toBeDefined();
    expect(Array.isArray(board.children)).toBe(true);
  });
  
  // Test that the board creates a background graphics object
  test('creates background graphics', () => {
    const board = new Board();
    
    // Board should have one child (the background)
    expect(board.children).toHaveLength(1);
    
    // The background should have rect and fill calls
    const background = board.children[0];
    expect(background.rectCalls).toBeDefined();
    expect(background.fillCalls).toBeDefined();
  });
  
  // Test our checkered pattern logic
  // We should have exactly 32 colored squares (half of 64 total squares)
  test('creates correct checkered pattern', () => {
    const board = new Board();
    const background = board.children[0];
    
    // Calculate how many squares should be colored
    // In an 8x8 board, every other square is colored: (i + j) % 2 === 0
    let expectedColoredSquares = 0;
    for (let i = 0; i < NUM_CELLS; i++) {
      for (let j = 0; j < NUM_CELLS; j++) {
        if ((i + j) % 2 === 0) {
          expectedColoredSquares++;
        }
      }
    }
    
    // Should be 32 colored squares
    expect(expectedColoredSquares).toBe(32);
    
    // Our background should have made 32 rect calls and 32 fill calls
    expect(background.rectCalls).toHaveLength(32);
    expect(background.fillCalls).toHaveLength(32);
  });
  
  // Test that squares are the correct size
  test('creates squares with correct size', () => {
    const board = new Board();
    const background = board.children[0];
    
    // All rectangles should be TILE_SIZE x TILE_SIZE
    background.rectCalls.forEach(rect => {
      expect(rect.w).toBe(TILE_SIZE);
      expect(rect.h).toBe(TILE_SIZE);
    });
  });
  
  // Test that squares are positioned correctly
  test('positions squares correctly', () => {
    const board = new Board();
    const background = board.children[0];
    
    // Check that first few squares are in expected positions
    const firstRect = background.rectCalls[0];
    
    // First colored square should be at (0,0) since (0+0) % 2 === 0
    expect(firstRect.x).toBe(0);
    expect(firstRect.y).toBe(0);
    
    // All rect positions should be multiples of TILE_SIZE
    background.rectCalls.forEach(rect => {
      expect(rect.x % TILE_SIZE).toBe(0);
      expect(rect.y % TILE_SIZE).toBe(0);
    });
  });
  
  // Test that all squares use the correct color
  test('uses correct fill color', () => {
    const board = new Board();
    const background = board.children[0];
    
    // All fill calls should use BlanchedAlmond color
    background.fillCalls.forEach(fill => {
      expect(fill.color).toBe('BlanchedAlmond');
    });
  });
  
  // Test the resize method calculations
  test('calculates scale correctly in resize', () => {
    const board = new Board();
    
    // Test resize with a square area
    board.resize(0, 0, 800, 800);
    
    // Board size should be NUM_CELLS * TILE_SIZE = 8 * 100 = 800
    const boardSize = NUM_CELLS * TILE_SIZE;
    expect(boardSize).toBe(800);
    
    // With 800x800 area, scale should be 1.0
    expect(board.scale.x).toBe(1);
    expect(board.scale.y).toBe(1);
  });
  
  // Test resize with rectangular area (should use minimum dimension)
  test('handles rectangular resize area', () => {
    const board = new Board();
    
    // Test with 1200x600 area - should scale to fit height
    board.resize(0, 0, 1200, 600);
    
    // Should scale to fit the smaller dimension (600)
    const boardSize = NUM_CELLS * TILE_SIZE;
    const expectedScale = 600 / boardSize;
    expect(board.scale.x).toBe(expectedScale);
    expect(board.scale.y).toBe(expectedScale);
  });
  
  // Test resize positioning
  test('centers board in resize area', () => {
    const board = new Board();
    
    // Test with offset position
    const x = 100;
    const y = 50;
    const w = 800;
    const h = 600;
    
    board.resize(x, y, w, h);
    
    // Board should be positioned relative to the given x,y
    expect(board.position.x).toBeGreaterThanOrEqual(x);
    expect(board.position.y).toBeGreaterThanOrEqual(y);
  });
  
  // Test that NUM_CELLS constant is used correctly
  test('uses NUM_CELLS constant', () => {
    // NUM_CELLS should be 8 for an 8x8 board
    expect(NUM_CELLS).toBe(8);
    
    const board = new Board();
    const background = board.children[0];
    
    // Should create squares for an 8x8 grid (32 colored squares)
    expect(background.rectCalls).toHaveLength(32);
  });

});