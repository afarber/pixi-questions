import { Container, Graphics, Rectangle, Point } from "pixi.js";

export const TILE_SIZE = 100;

const TILE_SCALE = 1.4;
const TILE_ALPHA = 0.7;

const SHADOW_COLOR = "black";
const SHADOW_ALPHA = 0.1;
const SHADOW_OFFSET = new Point(8, 6);

export class Tile extends Container {
  constructor(color, col, row, stage) {
    super();

    this.x = (col + 0.5) * TILE_SIZE;
    this.y = (row + 0.5) * TILE_SIZE;

    if (stage instanceof Container) {
      this.setupDraggable(stage);
    } else {
      this.setupStatic();
    }

    this.g = new Graphics()
      .rect(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE)
      .fill({ color: color });
    this.addChild(this.g);
  }

  // setup static, non-draggable Tile
  setupStatic() {
    this.eventMode = "none";
    this.cursor = null;
  }

  // setup interactive, draggable Tile and add shadow
  setupDraggable(stage) {
    this.eventMode = "static";
    this.cursor = "pointer";

    // the app.stage is needed to add/remove event listeners
    this.stage = stage;

    // setting hitArea is important for correct pointerdown events delivery
    this.hitArea = new Rectangle(
      -TILE_SIZE / 2,
      -TILE_SIZE / 2,
      TILE_SIZE,
      TILE_SIZE
    );
    // the relative offset point of the click on the tile
    this.grabPoint = new Point();

    this.shadow = new Graphics()
      .rect(
        -TILE_SIZE / 2 + SHADOW_OFFSET.x,
        -TILE_SIZE / 2 + SHADOW_OFFSET.y,
        TILE_SIZE,
        TILE_SIZE
      )
      .fill({ color: SHADOW_COLOR, alpha: SHADOW_ALPHA });
    this.shadow.visible = false;
    this.addChild(this.shadow);

    this.onpointerdown = (e) => this.onDragStart(e);
  }

  onDragStart(e) {
    console.log("onDragStart:", e.type, this.x, this.y);

    this.scale.x = TILE_SCALE;
    this.scale.y = TILE_SCALE;
    this.alpha = TILE_ALPHA;
    this.shadow.visible = true;

    // store the local mouse coordinates into grab point
    e.getLocalPosition(this, this.grabPoint);
    console.log("this.grabPoint:", this.grabPoint);

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
    this.shadow.visible = false;

    // align x, y to the checker board grid
    let col = Math.floor(this.x / TILE_SIZE);
    let row = Math.floor(this.y / TILE_SIZE);
    // ensure the col is between 0 and 7
    col = Math.max(col, 0);
    col = Math.min(col, 7);
    // ensure the row is between 0 and 7
    row = Math.max(row, 0);
    row = Math.min(row, 7);
    // snap to the center of the grid cell
    this.x = (col + 0.5) * TILE_SIZE;
    this.y = (row + 0.5) * TILE_SIZE;

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
