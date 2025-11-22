/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, FillGradient, Graphics, Point } from "pixi.js";
import { Card, CARD_WIDTH, CARD_HEIGHT } from "./Card.js";

// Number of cells in the board
export const NUM_CELLS = 4;

export class Board extends Container {
  constructor(stage) {
    super();

    this.stage = stage;

    const background = this.#createBackground();
    this.addChild(background);
  }

  #createBackground() {
    const radialGradient = new FillGradient({
      type: "radial",
      center: { x: 0.5, y: 0.5 },
      innerRadius: 0,
      outerCenter: { x: 0.5, y: 0.5 },
      outerRadius: 0.5,
      colorStops: [
        { offset: 0, color: "BlanchedAlmond" }, // Center color
        { offset: 1, color: "DarkKhaki" }, // Edge color
      ],
      // Use normalized coordinate system where (0,0) is the top-left and (1,1) is the bottom-right of the shape
      textureSpace: "local",
    });

    console.log(this.width, this.height);
    const g = new Graphics().rect(0, 0, 400, 300).fill(radialGradient);

    return g;
  }

  resize(w, h) {
    const boardWidth = NUM_CELLS * CARD_WIDTH;
    const boardHeight = NUM_CELLS * CARD_HEIGHT;

    const boardSize = Math.max(boardWidth, boardHeight);
    const appSize = Math.min(w, h);

    let boardScale = appSize / boardSize;
    this.scale.set(boardScale);

    let boardOrigin = new Point();
    boardOrigin.x = (w - boardWidth * boardScale) / 2;
    boardOrigin.y = (h - boardHeight * boardScale) / 2;
    this.position.set(boardOrigin.x, boardOrigin.y);
  }

  // Function to create a random card with proper bounds
  createRandomCard(spriteSheet, spriteKey) {
    const boardWidth = NUM_CELLS * CARD_WIDTH;
    const boardHeight = NUM_CELLS * CARD_HEIGHT;

    // Random position within the board container
    const x = Math.random() * (boardWidth - CARD_WIDTH) + CARD_WIDTH / 2;
    const y = Math.random() * (boardHeight - CARD_HEIGHT) + CARD_HEIGHT / 2;

    // Random angle between -60 and +60 degrees
    const angle = Math.random() * 120 - 60;

    let card = new Card(spriteSheet, spriteKey, x, y, angle, this.stage);

    this.addChild(card);
    return card;
  }
}
