import { Container, Graphics, Rectangle, Point } from "pixi.js";

export const CELL = 100;

export class Tile extends Container {
  isDragging = false;
  // the relative offset point of the click on the tile
  dragOffset = new Point();

  constructor(color, col, row, stage) {
    super();

    this.x = (col + 0.5) * CELL;
    this.y = (row + 0.5) * CELL;

    if (stage instanceof Container) {
      this.eventMode = "static";
      this.cursor = "pointer";
      // setting hitArea is important for correct pointerdown events delivery
      this.hitArea = new Rectangle(-CELL / 2, -CELL / 2, CELL, CELL);

      this.onpointerdown = (e) => this.onDragStart(e);
      this.onpointerup = (e) => this.onDragEnd(e);
      this.onpointerupoutside = (e) => this.onDragEnd(e);
      this.onpointercancel = (e) => this.onDragEnd(e);
    } else {
      this.eventMode = "none";
      this.cursor = null;
    }

    this.g = new Graphics();
    this.g.setFillStyle({ color: color });
    this.g.rect(-CELL / 2, -CELL / 2, CELL, CELL);
    this.g.fill();
    this.addChild(this.g);
    this.interactiveChildren = false;
    this.cacheAsTexture = true;
  }

  onDragStart(e) {
    console.log("onDragStart:", this.x, this.y);

    this.isDragging = true;
    this.scale.x = 1.6;
    this.scale.y = 1.6;
    this.alpha = 0.8;

    let parent = this.parent;
    // put the dragged tile on the top
    parent.removeChild(this);
    parent.addChild(this);
  }

  onDragEnd(e) {
    console.log("onDragEnd:", this.x, this.y);

    this.isDragging = false;
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

  onDragMove(e) {
    console.log("onDragMove:", this.x, this.y);

    if (this.isDragging) {
    }
  }
}
