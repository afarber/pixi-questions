/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { UI_PADDING, UI_WIDTH } from "../Theme.js";

/**
 * Manages the three-column layout system for the application.
 * Handles responsive resizing and fullscreen transitions.
 */
export class LayoutManager {
  #resizeTimeout = null;

  constructor(app, leftPanel, midPanel, rightPanel, dialogs = []) {
    this.app = app;
    this.leftPanel = leftPanel;
    this.midPanel = midPanel;
    this.rightPanel = rightPanel;
    this.dialogs = dialogs;
  }

  /**
   * Updates the layout with current screen dimensions.
   * Uses setTimeout to handle fullscreen transition timing issues.
   */
  updateLayout() {
    if (this.#resizeTimeout) {
      clearTimeout(this.#resizeTimeout);
    }

    this.#resizeTimeout = setTimeout(() => {
      this.#performLayout();
    }, 250);
  }

  /**
   * Performs the actual layout calculations and panel resizing.
   */
  #performLayout() {
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;

    console.log("LayoutManager: updateLayout", screenWidth, screenHeight);

    // Left panel: Fixed width, full height with padding
    this.leftPanel.resize(UI_PADDING, UI_PADDING, UI_WIDTH, screenHeight - 2 * UI_PADDING);

    // Middle panel: Flexible width between fixed panels
    const middleWidth = screenWidth - 2 * UI_WIDTH - 4 * UI_PADDING;
    this.midPanel.resize(UI_WIDTH + 2 * UI_PADDING, UI_PADDING, middleWidth, screenHeight - 2 * UI_PADDING);

    // Right panel: Fixed width, positioned at right edge
    this.rightPanel.resize(screenWidth - UI_WIDTH - UI_PADDING, UI_PADDING, UI_WIDTH, screenHeight - 2 * UI_PADDING);

    // Update all dialogs
    this.dialogs.forEach(dialog => {
      if (dialog && dialog.resize && typeof dialog.resize === 'function') {
        dialog.resize();
      }
    });
  }

  /**
   * Sets up event listeners for window resize and fullscreen changes.
   */
  setupEventListeners() {
    const handleResize = () => this.updateLayout();

    addEventListener("resize", handleResize);
    addEventListener("fullscreenchange", handleResize);

    // Initial layout
    this.updateLayout();

    return () => {
      removeEventListener("resize", handleResize);
      removeEventListener("fullscreenchange", handleResize);
    };
  }

  /**
   * Cleanup method to clear any pending timeouts.
   */
  destroy() {
    if (this.#resizeTimeout) {
      clearTimeout(this.#resizeTimeout);
      this.#resizeTimeout = null;
    }
  }
}
