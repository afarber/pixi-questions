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

    // Calculate an offset to keep the board centered within the given panel area
    let boardOffset = new Point();
    boardOffset.x = x + (w - appSize) / 2;
    boardOffset.y = y + (h - appSize) / 2;
    this.position.set(boardOffset.x, boardOffset.y);

    console.log("Board.resize", { x, y, w, h, boardOrigin: boardOffset, boardScale });
  }
}
