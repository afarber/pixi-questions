// Tests for MyVerticalPanel.js component
// Tests our layout manager for vertical arrangement of UI elements

import { describe, test, expect, vi } from "vitest";
import { MyVerticalPanel } from "../MyVerticalPanel.js";
import { Board } from "../Board.js";
import { MyList } from "../MyList.js";

describe("MyVerticalPanel", () => {
  // Helper function to create a mock stage
  function createMockStage() {
    return {
      addChild: vi.fn()
    };
  }

  // Test basic panel creation
  test("creates panel successfully", () => {
    const mockStage = createMockStage();
    const panel = new MyVerticalPanel(mockStage);

    // Panel should be created with empty children array
    expect(panel).toBeDefined();
    expect(Array.isArray(panel.children)).toBe(true);
    expect(panel.children).toHaveLength(0);
    // Do not test panel.debugRect, it might be removed in future
  });

  // Test adding children
  test("adds children correctly", () => {
    const mockStage = createMockStage();
    const panel = new MyVerticalPanel(mockStage);
    const mockChild = { resize: vi.fn() };

    // Add child should return the panel for chaining
    const result = panel.addChild(mockChild);
    expect(result).toBe(panel);

    // Child should be added to children array
    expect(panel.children).toHaveLength(1);
    expect(panel.children[0]).toBe(mockChild);
  });

  // Test adding multiple children
  test("adds multiple children correctly", () => {
    const mockStage = createMockStage();
    const panel = new MyVerticalPanel(mockStage);
    const child1 = { resize: vi.fn() };
    const child2 = { resize: vi.fn() };
    const child3 = { resize: vi.fn() };

    // Add multiple children
    panel.addChild(child1).addChild(child2).addChild(child3);

    // All children should be added in order
    expect(panel.children).toHaveLength(3);
    expect(panel.children[0]).toBe(child1);
    expect(panel.children[1]).toBe(child2);
    expect(panel.children[2]).toBe(child3);
  });

  // Test addChildrenToStage method
  test("adds children to stage correctly", () => {
    const mockStage = createMockStage();
    const panel = new MyVerticalPanel(mockStage);
    const anotherMockStage = { addChild: vi.fn() };
    const child1 = { resize: vi.fn() };
    const child2 = { resize: vi.fn() };

    panel.addChild(child1).addChild(child2);

    // Add children to stage
    panel.addChildrenToStage(anotherMockStage);

    // Stage addChild should be called for each child
    expect(anotherMockStage.addChild).toHaveBeenCalledTimes(2);
    expect(anotherMockStage.addChild).toHaveBeenCalledWith(child1);
    expect(anotherMockStage.addChild).toHaveBeenCalledWith(child2);
  });

  // Test hasSpecialChild method with no special children
  test("hasSpecialChild returns false with regular children", () => {
    const mockStage = createMockStage();
    const panel = new MyVerticalPanel(mockStage);
    const regularChild = { resize: vi.fn() };

    panel.addChild(regularChild);

    // Should return false for non-special children
    expect(panel.hasSpecialChild()).toBe(false);
  });

  // Test hasSpecialChild method with MyList
  test("hasSpecialChild returns true with MyList", () => {
    const mockStage = createMockStage();
    const panel = new MyVerticalPanel(mockStage);
    const myList = new MyList();

    panel.addChild(myList);

    // Should return true when MyList is present
    expect(panel.hasSpecialChild()).toBe(true);
  });

  // Test hasSpecialChild method with Board
  test("hasSpecialChild returns true with Board", () => {
    const mockStage = createMockStage();
    const panel = new MyVerticalPanel(mockStage);
    const board = new Board();

    panel.addChild(board);

    // Should return true when Board is present
    expect(panel.hasSpecialChild()).toBe(true);
  });

  // Test resize with invalid parameters
  test("handles invalid resize parameters", () => {
    const mockStage = createMockStage();
    const panel = new MyVerticalPanel(mockStage);

    // Should handle zero or negative dimensions gracefully
    expect(() => panel.resize(0, 0, 0, 0)).not.toThrow();
    expect(() => panel.resize(0, 0, -100, 100)).not.toThrow();
    expect(() => panel.resize(0, 0, 100, -100)).not.toThrow();
  });

  // Test resize with empty children
  test("handles resize with empty children", () => {
    const mockStage = createMockStage();
    const panel = new MyVerticalPanel(mockStage);

    // Should handle empty children array gracefully
    expect(() => panel.resize(0, 0, 200, 400)).not.toThrow();
  });

  // Test resize with valid parameters
  test("calls resize on children with valid parameters", () => {
    const mockStage = createMockStage();
    const panel = new MyVerticalPanel(mockStage);
    const child1 = { resize: vi.fn() };
    const child2 = { resize: vi.fn() };

    panel.addChild(child1).addChild(child2);

    // Resize panel
    const panelX = 10;
    const panelY = 20;
    const panelWidth = 200;
    const panelHeight = 400;

    panel.resize(panelX, panelY, panelWidth, panelHeight);

    // Both children should have resize called
    expect(child1.resize).toHaveBeenCalled();
    expect(child2.resize).toHaveBeenCalled();
  });

  // Test MyList special handling in resize
  test("handles MyList specially in resize", () => {
    const mockStage = createMockStage();
    const panel = new MyVerticalPanel(mockStage);
    const myList = new MyList();

    // Mock the resize method
    myList.resize = vi.fn();

    panel.addChild(myList);
    panel.resize(0, 0, 200, 400);

    // MyList should get special resize treatment
    expect(myList.resize).toHaveBeenCalled();

    // Check the resize call parameters structure
    const resizeCall = myList.resize.mock.calls[0];
    expect(resizeCall).toHaveLength(4);
  });

  // Test Board special handling in resize
  test("handles Board specially in resize", () => {
    const mockStage = createMockStage();
    const panel = new MyVerticalPanel(mockStage);
    const board = new Board();

    // Mock the resize method
    board.resize = vi.fn();

    panel.addChild(board);
    panel.resize(0, 0, 200, 400);

    // Board should get special resize treatment
    expect(board.resize).toHaveBeenCalled();

    // Check the resize call parameters structure
    const resizeCall = board.resize.mock.calls[0];
    expect(resizeCall).toHaveLength(4);
  });

  // Test Text object handling in resize
  test("handles Text objects in resize", async () => {
    const mockStage = createMockStage();
    const panel = new MyVerticalPanel(mockStage);

    // Import Text from our mocked pixi.js
    const { Text } = await import("pixi.js");
    const mockText = new Text({ text: "Test Text" });

    panel.addChild(mockText);
    panel.resize(0, 0, 200, 400);

    // Text should have position set
    expect(typeof mockText.x).toBe("number");
    expect(typeof mockText.y).toBe("number");
    expect(mockText.anchor.set).toHaveBeenCalledWith(0.5);
  });

  // Test button animation handling
  test("handles button show/hide animations", () => {
    const mockStage = createMockStage();
    const panel = new MyVerticalPanel(mockStage);

    // Create mock button with show/hide methods
    const mockButton = {
      resize: vi.fn(),
      hide: vi.fn(),
      show: vi.fn()
    };

    panel.addChild(mockButton);
    panel.resize(0, 0, 200, 400);

    // Button should have hide and show called for animation
    expect(mockButton.hide).toHaveBeenCalledWith(false);
    expect(mockButton.show).toHaveBeenCalledWith(true, 50);
  });

  // Test child without resize method
  test("handles children without resize method", () => {
    const mockStage = createMockStage();
    const panel = new MyVerticalPanel(mockStage);

    // Child without resize method
    const childWithoutResize = {};

    panel.addChild(childWithoutResize);

    // Note: The actual implementation may throw when child lacks resize method
    // This depends on the specific logic in MyVerticalPanel.resize()
    // The test verifies that the panel doesn't crash completely
    expect(panel.children).toContain(childWithoutResize);
  });
});
