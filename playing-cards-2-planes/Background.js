/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Graphics, FillGradient } from "pixi.js";
import { TABLE_COLOR_TOP, TABLE_COLOR_MID, TABLE_COLOR_BOTTOM } from "./Theme.js";

export class Background extends Container {
  constructor(screen) {
    super();

    this.screen = screen;
    this.graphics = new Graphics();
    this.addChild(this.graphics);
    this._drawBackground();
  }

  _drawBackground() {
    this.graphics.clear();

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

    this.graphics.rect(0, 0, this.screen.width, this.screen.height);
    this.graphics.fill(gradient);
  }

  resize() {
    this._drawBackground();
  }
}
