import { Container, Graphics, Rectangle } from "pixi.js";

export const CELL = 100;

export class Tile extends Container {
  constructor(color, onDragStart, onDragEnd, col, row) {
    super();

    this.x = (col + 0.5) * CELL;
    this.y = (row + 0.5) * CELL;

    if (typeof onDragStart === "function" && typeof onDragEnd === "function") {
      this.eventMode = "static";
      this.cursor = "pointer";
      // setting hitArea is important for correct pointerdown events delivery
      this.hitArea = new Rectangle(-CELL / 2, -CELL / 2, CELL, CELL);
      this.on("pointerdown", onDragStart).on("pointerup", onDragEnd);
    } else {
      this.eventMode = "none";
    }

    this.graph = new Graphics();
    this.graph.setFillStyle({ color: color });
    this.graph.rect(-CELL / 2, -CELL / 2, CELL, CELL);
    this.graph.fill();
    this.addChild(this.graph);
    this.cacheAsBitmap = true;
  }

  startDragging() {
    this.scale.x = 1.6;
    this.scale.y = 1.6;
    this.alpha = 0.8;
  }

  stopDragging() {
    this.scale.x = 1;
    this.scale.y = 1;
    this.alpha = 1;

    // align x, y to the checker board grid
    let col = Math.floor(this.x / CELL);
    let row = Math.floor(this.y / CELL);
    // ensure the col is between 0 and 7
    col = Math.max(col, 0);
    col = Math.min(col, 7);
    // ensure the row is between 0 and 7
    row = Math.max(row, 0);
    row = Math.min(row, 7);

    this.x = (col + 0.5) * CELL;
    this.y = (row + 0.5) * CELL;
  }
}
