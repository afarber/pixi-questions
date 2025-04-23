import { Container, Graphics, Rectangle, Point } from "pixi.js";

export const CELL = 100;

export class Tile extends Container {
  constructor(color, col, row, stage) {
    super();

    this.x = (col + 0.5) * CELL;
    this.y = (row + 0.5) * CELL;

    if (stage instanceof Container) {
      this.stage = stage;
      this.eventMode = "static";
      this.cursor = "pointer";
      // setting hitArea is important for correct pointerdown events delivery
      this.hitArea = new Rectangle(-CELL / 2, -CELL / 2, CELL, CELL);
      // the relative offset point of the click on the tile
      this.grabPoint = new Point();

      this.onpointerdown = (e) => this.onDragStart(e);
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
    console.log("onDragStart:", e.type, this.x, this.y);

    this.scale.x = 1.6;
    this.scale.y = 1.6;
    this.alpha = 0.8;
    // TODO display shadow

    // store the local mouse coordinates into grab point
    e.getLocalPosition(this, this.grabPoint);

    this.onpointerdown = null;

    this.stage.onpointermove = (e) => this.onDragMove(e);

    this.stage.onpointerup = (e) => this.onDragEnd(e);
    this.stage.onpointercancel = (e) => this.onDragEnd(e);
    this.stage.onpointerupoutside = (e) => this.onDragEnd(e);
    this.stage.onpointercanceloutside = (e) => this.onDragEnd(e);

    // put the dragged tile on the top
    let parent = this.parent;
    parent.removeChild(this);
    parent.addChild(this);
  }

  onDragEnd(e) {
    console.log("onDragEnd:", e.type, this.x, this.y);

    this.scale.x = 1;
    this.scale.y = 1;
    this.alpha = 1;
    // TODO hide shadow

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

    this.onpointerdown = (e) => this.onDragStart(e);

    this.stage.onpointermove = null;

    this.stage.onpointerup = null;
    this.stage.onpointercancel = null;
    this.stage.onpointerupoutside = null;
    this.stage.onpointercanceloutside = null;
  }

  onDragMove(e) {
    console.log("onDragMove:", e.type, this.x, this.y);

    const pos = e.getLocalPosition(this.parent);
    // set the new position of the tile
    // to be same as mouse position
    // minus the grab point offset
    this.x = pos.x - this.grabPoint.x;
    this.y = pos.y - this.grabPoint.y;
  }
}
