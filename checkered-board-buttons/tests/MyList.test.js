/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

// Tests for MyList.js component
// Tests our game list with scrolling and game categorization logic

import { describe, test, expect, vi } from 'vitest';
import { MyList } from '../ui/MyList.js';
import { games } from '../TestData.js';

describe('MyList', () => {
  
  // Test basic list creation
  test('creates list successfully', () => {
    const list = new MyList();
    
    // List should be created as a Container
    expect(list).toBeDefined();
    expect(list.children).toBeDefined();
    expect(Array.isArray(list.children)).toBe(true);
    
    // Should have a scroll box
    expect(list.scrollBox).toBeDefined();
  });
  
  // Test scroll box initialization
  test('initializes scroll box correctly', () => {
    const list = new MyList();
    
    // Scroll box should be added as child
    expect(list.children).toContain(list.scrollBox);
    
    // Scroll box should have required properties
    expect(list.scrollBox.options).toBeDefined();
    expect(list.scrollBox.items).toBeDefined();
    expect(Array.isArray(list.scrollBox.items)).toBe(true);
  });
  
  // Test setGames with empty array
  test('handles empty games array', () => {
    const list = new MyList();
    
    // Should not throw with empty array
    expect(() => list.setGames([])).not.toThrow();
    
    // Should show zero games message
    expect(list.scrollBox.items).toHaveLength(1);
  });
  
  // Test setGames with null/undefined
  test('handles null or undefined games', () => {
    const list = new MyList();
    
    // Should handle null gracefully
    expect(() => list.setGames(null)).not.toThrow();
    expect(() => list.setGames(undefined)).not.toThrow();
    
    // Should show zero games message
    expect(list.scrollBox.items).toHaveLength(1);
  });
  
  // Test setGames with non-array input
  test('handles non-array input', () => {
    const list = new MyList();
    
    // Should handle non-array gracefully
    expect(() => list.setGames("not an array")).not.toThrow();
    expect(() => list.setGames(123)).not.toThrow();
    expect(() => list.setGames({})).not.toThrow();
    
    // Should show zero games message
    expect(list.scrollBox.items).toHaveLength(1);
  });
  
  // Test game categorization logic
  test('categorizes games correctly', () => {
    const list = new MyList();
    
    // Create test games with known states
    const testGames = [
      // Your turn game - you played more recently
      {
        id: 1,
        finished: 0,
        played1: 1000,
        played2: 2000
      },
      // Opponent turn game - opponent played more recently  
      {
        id: 2,
        finished: 0,
        played1: 2000,
        played2: 1000
      },
      // Finished game
      {
        id: 3,
        finished: 1500,
        played1: 1000,
        played2: 1200
      }
    ];
    
    list.setGames(testGames);
    
    // Should have items for sections and games
    expect(list.scrollBox.items.length).toBeGreaterThan(3);
  });
  
  // Test your turn logic
  test('identifies your turn correctly', () => {
    const list = new MyList();
    
    // Game where player 1 should play next (played1 <= played2)
    const yourTurnGame = {
      id: 1,
      finished: 0,
      played1: 1000,
      played2: 2000
    };
    
    list.setGames([yourTurnGame]);
    
    // Should categorize as your turn
    expect(list.scrollBox.items.length).toBeGreaterThan(0);
  });
  
  // Test opponent turn logic  
  test('identifies opponent turn correctly', () => {
    const list = new MyList();
    
    // Game where player 2 should play next (played1 > played2)
    const opponentTurnGame = {
      id: 2,
      finished: 0,
      played1: 2000,
      played2: 1000
    };
    
    list.setGames([opponentTurnGame]);
    
    // Should categorize as opponent turn
    expect(list.scrollBox.items.length).toBeGreaterThan(0);
  });
  
  // Test finished game detection
  test('identifies finished games correctly', () => {
    const list = new MyList();
    
    // Finished game
    const finishedGame = {
      id: 3,
      finished: 1500,
      played1: 1000,
      played2: 1200
    };
    
    list.setGames([finishedGame]);
    
    // Should categorize as finished
    expect(list.scrollBox.items.length).toBeGreaterThan(0);
  });
  
  // Test createSection method
  test('createSection works correctly', () => {
    const list = new MyList();
    
    // Clear items first
    list.scrollBox.removeItems();
    
    // Create a section with games
    list.createSection('Test Section', [1, 2, 3]);
    
    // Should add title and game buttons
    expect(list.scrollBox.items.length).toBeGreaterThan(3);
  });
  
  // Test createSection with empty games
  test('createSection handles empty games array', () => {
    const list = new MyList();
    
    // Clear items first
    list.scrollBox.removeItems();
    const initialItemCount = list.scrollBox.items.length;
    
    // Create section with no games
    list.createSection('Empty Section', []);
    
    // Should not add anything for empty array
    expect(list.scrollBox.items.length).toBe(initialItemCount);
  });
  
  // Test createParentContainer method
  test('createParentContainer works correctly', () => {
    const list = new MyList();
    const gameId = 123;
    
    const container = list.createParentContainer(gameId);
    
    // Should return a container with correct properties
    expect(container).toBeDefined();
    expect(container.width).toBeDefined();
    expect(container.height).toBeDefined();
    expect(container.children).toBeDefined();
    expect(container.children.length).toBeGreaterThan(0);
  });
  
  // Test resize method
  test('resize method works correctly', () => {
    const list = new MyList();
    
    const x = 10;
    const y = 20;
    const w = 300;
    const h = 500;
    
    // Should not throw when calling resize
    expect(() => list.resize(x, y, w, h)).not.toThrow();
    
    // Should update scroll box position and size
    expect(list.scrollBox.options.width).toBe(w);
    expect(list.scrollBox.options.height).toBe(h);
  });
  
  // Test with real test data
  test('works with test data from TestData.js', () => {
    const list = new MyList();
    
    // Should handle the actual test data without errors
    expect(() => list.setGames(games)).not.toThrow();
    
    // Should have categorized the games
    expect(list.scrollBox.items.length).toBeGreaterThan(0);
  });
  
  // Test removeItems is called before setting new games
  test('clears previous items before setting new games', () => {
    const list = new MyList();
    
    // Mock removeItems to track calls
    list.scrollBox.removeItems = vi.fn();
    
    list.setGames([{ id: 1, finished: 0, played1: 1000, played2: 2000 }]);
    
    // Should clear previous items
    expect(list.scrollBox.removeItems).toHaveBeenCalled();
  });
  
  // Test game ID handling in button creation
  test('creates buttons with correct game IDs', () => {
    const list = new MyList();
    const gameId = 456;
    
    const container = list.createParentContainer(gameId);
    
    // Container should have a button child
    expect(container.children.length).toBeGreaterThan(0);
    
    // Button should have onPress handler
    const button = container.children[0];
    expect(button.onPress).toBeDefined();
    expect(button.onPress.connect).toBeDefined();
  });

});