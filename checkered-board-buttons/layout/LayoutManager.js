/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { UI_PADDING, UI_WIDTH } from "../Theme.js";

// Width for the avatar panel
const AVATAR_PANEL_WIDTH = 80;

/**
 * Manages the multi-column layout system for the application.
 * Handles responsive resizing and fullscreen transitions.
 */
export class LayoutManager {
  _resizeTimeout = null;

  constructor(app, leftPanel, avatarPanel, midPanel, rightPanel, dialogs = []) {
    this.app = app;
    this.leftPanel = leftPanel;
    this.avatarPanel = avatarPanel;
    this.midPanel = midPanel;
    this.rightPanel = rightPanel;
    this.dialogs = dialogs;
  }

  /**
   * Updates the layout with current screen dimensions.
   * Uses setTimeout to handle fullscreen transition timing issues.
   */
  updateLayout() {
    if (this._resizeTimeout) {
      clearTimeout(this._resizeTimeout);
    }

    this._resizeTimeout = setTimeout(() => {
      this._performLayout();
    }, 250);
  }

  /**
   * Performs the actual layout calculations and panel resizing.
   */
  _performLayout() {
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;

    console.log("LayoutManager: updateLayout", screenWidth, screenHeight);

    // Left panel: Fixed width, full height with padding
    this.leftPanel.resize(UI_PADDING, UI_PADDING, UI_WIDTH, screenHeight - 2 * UI_PADDING);

    // Avatar panel: Between left and mid panels
    const avatarX = UI_WIDTH + 2 * UI_PADDING;
    this.avatarPanel.resize(avatarX, UI_PADDING, AVATAR_PANEL_WIDTH, screenHeight - 2 * UI_PADDING);

    // Middle panel: Flexible width between avatar and right panels
    const midX = avatarX + AVATAR_PANEL_WIDTH + UI_PADDING;
    const middleWidth = screenWidth - midX - UI_WIDTH - 2 * UI_PADDING;
    this.midPanel.resize(midX, UI_PADDING, middleWidth, screenHeight - 2 * UI_PADDING);

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
    if (this._resizeTimeout) {
      clearTimeout(this._resizeTimeout);
      this._resizeTimeout = null;
    }
  }
}
