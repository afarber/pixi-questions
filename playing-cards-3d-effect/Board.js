import { Container, Graphics, Point } from "pixi.js";
import { CARD_WIDTH, CARD_HEIGHT } from "./Card.js";

export const NUM_CELLS = 4;

export class Board extends Container {
  constructor() {
    super();

    const background = this.createBackground();
    this.addChild(background);
  }

  createBackground() {
    const g = new Graphics();
    g.setFillStyle({ color: "BlanchedAlmond" });

    for (let i = 0; i < NUM_CELLS; i++) {
      for (let j = 0; j < NUM_CELLS; j++) {
        if ((i + j) % 2 === 0) {
          g.rect(i * CARD_WIDTH, j * CARD_HEIGHT, CARD_WIDTH, CARD_HEIGHT);
          g.fill();
        }
      }
    }

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
}
