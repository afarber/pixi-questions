import { Container, Graphics, Rectangle, Point } from "pixi.js";

export const TILE_SIZE = 100;

const TILE_SCALE = 1.4;
const TILE_ALPHA = 0.7;

// The shadow offset in the screen coordinate system
const SHADOW_OFFSET = new Point(12, 8);
const SHADOW_COLOR = "Black";
const SHADOW_ALPHA = 0.1;

export class Tile extends Container {
  constructor(color, col, row, angle, stage) {
    super();

    this.x = (col + 0.5) * TILE_SIZE;
    this.y = (row + 0.5) * TILE_SIZE;

    this.angle = angle;

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

  // Setup static, non-draggable Tile
  setupStatic() {
    this.eventMode = "none";
    this.cursor = null;
  }

  // Setup interactive, draggable Tile and add shadow
  setupDraggable(stage) {
    this.eventMode = "static";
    this.cursor = "pointer";

    // The app.stage is needed to add/remove event listeners
    this.stage = stage;

    // Setting hitArea is important for correct pointerdown events delivery
    this.hitArea = new Rectangle(
      -TILE_SIZE / 2,
      -TILE_SIZE / 2,
      TILE_SIZE,
      TILE_SIZE
    );

    // The offset between the pointer position and the tile position
    this.parentGrabPoint = new Point();

    this.shadow = new Graphics()
      .rect(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE)
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
    this.setLocalShadowPosition();
    this.shadow.visible = true;

    // Calculate offset between the pointer position and the tile position
    // Both positions are in the parent's coordinate system
    const pointerParentPos = e.getLocalPosition(this.parent);
    this.parentGrabPoint.x = pointerParentPos.x - this.x;
    this.parentGrabPoint.y = pointerParentPos.y - this.y;

    console.log("parentGrabPoint:", this.parentGrabPoint);

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

    // Align x, y to the checker board grid
    let col = Math.floor(this.x / TILE_SIZE);
    let row = Math.floor(this.y / TILE_SIZE);
    // Ensure the col is between 0 and 7
    col = Math.max(col, 0);
    col = Math.min(col, 7);
    // Ensure the row is between 0 and 7
    row = Math.max(row, 0);
    row = Math.min(row, 7);
    // Snap to the center of the grid cell
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

    // Set the new tile position, but maintain the offset to the pointer
    // Both positions are in the parent's coordinate system
    const pointerParentPos = e.getLocalPosition(this.parent);
    this.x = pointerParentPos.x - this.parentGrabPoint.x;
    this.y = pointerParentPos.y - this.parentGrabPoint.y;
  }

  // At the screen, the shadow should always be southeast of the tile,
  // but the tile can be rotated and thus this calculation is needed
  setLocalShadowPosition() {
    // Find where the tile actually is on the screen (the global position)
    // (it differs from this.x, this.y - which are in the parent's coordinate system)
    const tileGlobalPos = this.getGlobalPosition();

    // Add the shadow offset in that global space
    const shadowGlobalPos = new Point(
      tileGlobalPos.x + SHADOW_OFFSET.x,
      tileGlobalPos.y + SHADOW_OFFSET.y
    );

    // Convert back to the tile's local coordinate system
    const shadowLocalPos = this.toLocal(shadowGlobalPos);

    // Set shadow position using the calculated local coordinates
    this.shadow.x = shadowLocalPos.x;
    this.shadow.y = shadowLocalPos.y;
  }
}
