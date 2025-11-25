/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Graphics, FillGradient } from "pixi.js";
import { TABLE_COLOR_TOP, TABLE_COLOR_MID, TABLE_COLOR_BOTTOM } from "./Theme.js";

/**
 * Background container that renders a gradient representing the card table surface.
 * Uses a vertical gradient from darker green at top (farther) to lighter green at bottom (closer).
 * @extends Container
 */
export class Background extends Container {
  /**
   * Creates a new Background container.
   * @param {object} screen - The screen/viewport dimensions object with width and height
   */
  constructor(screen) {
    super();

    this._screen = screen;
    this._graphics = new Graphics();
    this.addChild(this._graphics);
    this._drawBackground();
  }

  /**
   * Handles window resize by redrawing the background to fill the new dimensions.
   */
  resize() {
    this._drawBackground();
  }

  /**
   * Draws the gradient background covering the entire screen.
   * @private
   */
  _drawBackground() {
    this._graphics.clear();

    // Vertical gradient: darker green at top (farther), lighter green at bottom (closer)
    const gradient = new FillGradient({
      type: 'linear',
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
      colorStops: [
        { offset: 0, color: TABLE_COLOR_TOP },
        { offset: 0.3, color: TABLE_COLOR_MID },
        { offset: 1, color: TABLE_COLOR_BOTTOM }
      ],
      textureSpace: 'local'
    });

    this._graphics.rect(0, 0, this._screen.width, this._screen.height);
    this._graphics.fill(gradient);
  }
}
