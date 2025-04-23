import { Container, Graphics, Point } from "pixi.js";
import { CELL } from "./Tile.js";

export class Board extends Container {
  constructor() {
    super();

    const background = this.createBackground();
    this.addChild(background);
  }

  createBackground() {
    const g = new Graphics();
    g.setFillStyle({ color: "0xCCCCFF" });

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 === 0) {
          g.rect(i * CELL, j * CELL, CELL, CELL);
          g.fill();
        }
      }
    }

    return g;
  }

  resize(w, h) {
    const boardSize = 8 * CELL;
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
