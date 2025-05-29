import { Container, Graphics, Point } from "pixi.js";
import { TILE_SIZE } from "./Tile.js";
import { UI_PADDING, UI_WIDTH } from "./Theme.js";

// Number of cells in the board
export const NUM_CELLS = 8;

export class Board extends Container {
  constructor() {
    super();

    const background = this.createBackground();
    this.addChild(background);
  }

  createBackground() {
    const g = new Graphics();

    for (let i = 0; i < NUM_CELLS; i++) {
      for (let j = 0; j < NUM_CELLS; j++) {
        if ((i + j) % 2 === 0) {
          g.rect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          g.fill({ color: "BlanchedAlmond" });
        }
      }
    }

    return g;
  }

  resize(x, y, w, h) {
    const boardSize = NUM_CELLS * TILE_SIZE;
    const appSize = Math.min(w, h);
    let boardScale = appSize / boardSize;
    this.scale.set(boardScale);

    // calculate an offset to keep the board centered
    let boardOffset = new Point();
    boardOffset.x = (w - appSize) / 2 + 4 * UI_PADDING + UI_WIDTH;
    boardOffset.y = (h - appSize) / 2;
    this.position.set(x + boardOffset.x, y + boardOffset.y);

    console.log("Board.resize", { w, h, boardOrigin: boardOffset, boardScale });
  }
}
