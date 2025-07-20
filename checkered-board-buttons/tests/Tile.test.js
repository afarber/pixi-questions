// Tests for Tile.js component
// Tests our tile positioning, drag setup, and grid snapping logic

import { describe, test, expect, vi } from 'vitest';
import { Tile, TILE_SIZE } from '../Tile.js';

describe('Tile', () => {
  
  // Test basic tile creation
  test('creates tile successfully', () => {
    const tile = new Tile('Red', 3, 3, 0);
    
    // Tile should be a Container (from our mock)
    expect(tile).toBeDefined();
    expect(tile.children).toBeDefined();
    expect(Array.isArray(tile.children)).toBe(true);
  });
  
  // Test that TILE_SIZE constant is defined
  test('TILE_SIZE constant is defined', () => {
    expect(TILE_SIZE).toBeDefined();
    expect(typeof TILE_SIZE).toBe('number');
    expect(TILE_SIZE).toBeGreaterThan(0);
  });
  
  // Test tile positioning calculation
  // Tiles should be centered in their grid cell
  test('positions tile correctly in grid', () => {
    const col = 3;
    const row = 2;
    const tile = new Tile('Blue', col, row, 0);
    
    // Tile should be positioned at center of grid cell
    const expectedX = (col + 0.5) * TILE_SIZE;
    const expectedY = (row + 0.5) * TILE_SIZE;
    
    expect(tile.x).toBe(expectedX);
    expect(tile.y).toBe(expectedY);
  });
  
  // Test that tile creates graphics child
  test('creates graphics child', () => {
    const tile = new Tile('Green', 1, 1, 0);
    
    // Tile should have at least one child (the graphics)
    expect(tile.children.length).toBeGreaterThan(0);
    
    // The graphics child should be the last added child
    const graphics = tile.children[tile.children.length - 1];
    expect(graphics.rectCalls).toBeDefined();
    expect(graphics.fillCalls).toBeDefined();
  });
  
  // Test that graphics uses correct size and color
  test('creates graphics with correct properties', () => {
    const color = 'Purple';
    const tile = new Tile(color, 0, 0, 0);
    
    // Get the graphics child
    const graphics = tile.children[tile.children.length - 1];
    
    // Should have one rect call with correct size
    expect(graphics.rectCalls).toHaveLength(1);
    const rectCall = graphics.rectCalls[0];
    expect(rectCall.w).toBe(TILE_SIZE);
    expect(rectCall.h).toBe(TILE_SIZE);
    
    // Should have one fill call with correct color
    expect(graphics.fillCalls).toHaveLength(1);
    const fillCall = graphics.fillCalls[0];
    expect(fillCall.color).toBe(color);
  });
  
  // Test static tile setup (no stage parameter)
  test('sets up static tile correctly', () => {
    const tile = new Tile('Yellow', 0, 0, 0);
    
    // Static tiles should not be interactive
    expect(tile.eventMode).toBe('none');
    expect(tile.cursor).toBeNull();
    
    // Should not have shadow (only draggable tiles have shadows)
    const hasShadow = tile.children.some(child => child.shadow !== undefined);
    expect(hasShadow).toBe(false);
  });
  
  // Test draggable tile setup (with stage parameter)
  test('sets up draggable tile correctly', () => {
    // Create a mock stage
    const mockStage = {
      onpointermove: null,
      onpointerup: null,
      onpointercancel: null,
      onpointerupoutside: null,
      onpointercanceloutside: null
    };
    
    const tile = new Tile('Orange', 0, 0, 0, mockStage);
    
    // Draggable tiles should be interactive
    expect(tile.eventMode).toBe('static');
    expect(tile.cursor).toBe('pointer');
    
    // Should have stage reference
    expect(tile.stage).toBe(mockStage);
    
    // Should have hit area defined
    expect(tile.hitArea).toBeDefined();
    
    // Should have shadow child
    expect(tile.shadow).toBeDefined();
  });
  
  // Test hit area setup for draggable tiles
  test('sets up hit area correctly', () => {
    const mockStage = {};
    const tile = new Tile('Pink', 2, 2, 0, mockStage);
    
    // Hit area should be defined and cover the tile area
    expect(tile.hitArea).toBeDefined();
    expect(tile.hitArea.width).toBe(TILE_SIZE);
    expect(tile.hitArea.height).toBe(TILE_SIZE);
  });
  
  // Test topLeftCorner calculation
  test('calculates topLeftCorner correctly', () => {
    const tile = new Tile('Cyan', 0, 0, 0);
    
    // Top left corner should be offset by half tile size for centering
    expect(tile.topLeftCorner.x).toBe(-TILE_SIZE / 2);
    expect(tile.topLeftCorner.y).toBe(-TILE_SIZE / 2);
  });
  
  // Test shadow positioning method
  test('has shadow positioning method', () => {
    const mockStage = {};
    const tile = new Tile('Magenta', 0, 0, 0, mockStage);
    
    // Should have setLocalShadowPosition method
    expect(typeof tile.setLocalShadowPosition).toBe('function');
    
    // Method should not throw when called
    expect(() => tile.setLocalShadowPosition()).not.toThrow();
  });
  
  // Test angle property
  test('stores angle property', () => {
    const angle = 45;
    const tile = new Tile('Brown', 1, 1, angle);
    
    expect(tile.angle).toBe(angle);
  });
  
  // Test parentGrabPoint initialization for draggable tiles
  test('initializes parentGrabPoint for draggable tiles', () => {
    const mockStage = {};
    const tile = new Tile('Gray', 0, 0, 0, mockStage);
    
    // Should have parentGrabPoint defined
    expect(tile.parentGrabPoint).toBeDefined();
    expect(tile.parentGrabPoint.x).toBeDefined();
    expect(tile.parentGrabPoint.y).toBeDefined();
  });
  
  // Test that onpointerdown is set for draggable tiles
  test('sets up pointer events for draggable tiles', () => {
    const mockStage = {};
    const tile = new Tile('Lime', 0, 0, 0, mockStage);
    
    // Should have onpointerdown event handler
    expect(tile.onpointerdown).toBeDefined();
    expect(typeof tile.onpointerdown).toBe('function');
  });
  
  // Test different tile colors
  test('handles different tile colors', () => {
    const colors = ['Red', 'Green', 'Blue', 'Yellow', 'Purple'];
    
    colors.forEach(color => {
      const tile = new Tile(color, 0, 0, 0);
      const graphics = tile.children[tile.children.length - 1];
      
      // Each tile should use its specified color
      expect(graphics.fillCalls[0].color).toBe(color);
    });
  });
  
  // Test different grid positions
  test('handles different grid positions', () => {
    const positions = [
      [0, 0], [1, 0], [0, 1], [7, 7], [3, 5]
    ];
    
    positions.forEach(([col, row]) => {
      const tile = new Tile('Test', col, row, 0);
      
      // Each tile should be positioned correctly
      expect(tile.x).toBe((col + 0.5) * TILE_SIZE);
      expect(tile.y).toBe((row + 0.5) * TILE_SIZE);
    });
  });

});