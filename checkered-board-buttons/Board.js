import { Container, Graphics, Point } from "pixi.js";
import { TILE_SIZE } from "./Tile.js";

export class Board extends Container {
  constructor() {
    super();

    const background = this.createBackground();
    this.addChild(background);
  }

  createBackground() {
    const g = new Graphics();
    g.setFillStyle({ color: "BlanchedAlmond" });

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 === 0) {
          g.rect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          g.fill();
        }
      }
    }

    return g;
  }

  resize(w, h) {
    const boardSize = 8 * TILE_SIZE;
    const appSize = Math.min(w, h);
    let boardScale = appSize / boardSize;
    this.scale.set(boardScale);

    let boardOrigin = new Point();
    boardOrigin.x = (w - appSize) / 2;
    boardOrigin.y = (h - appSize) / 2;
    this.position.set(boardOrigin.x, boardOrigin.y);

    console.log(
      "Board.resize",
      w,
      "x",
      h,
      "origin",
      boardOrigin,
      "scale",
      boardScale
    );
  }
}
