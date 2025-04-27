import { Container, PerspectiveMesh, Rectangle, Point, Texture } from "pixi.js";

export const CARD_WIDTH = 360;
export const CARD_HEIGHT = 504;

const CARD_SCALE = 1.4;

const SHADOW_COLOR = "black";
const SHADOW_ALPHA = 0.1;
const SHADOW_OFFSET = new Point(8, 6);

const PERSPECTIVE = 300;
const NUM_VERTICES = 30;
const TILT_ANGLE = 5;

export class Card extends Container {
  constructor(texture, col, row, stage) {
    super();

    // the 4 corners of the tile in local coordinates, clockwise
    this.topLeftCorner = new Point(-CARD_WIDTH / 2, -CARD_HEIGHT / 2);
    this.topRightCorner = new Point(CARD_WIDTH / 2, -CARD_HEIGHT / 2);
    this.bottomRightCorner = new Point(CARD_WIDTH / 2, CARD_HEIGHT / 2);
    this.bottomLeftCorner = new Point(-CARD_WIDTH / 2, CARD_HEIGHT / 2);

    this.x = (col + 0.5) * CARD_WIDTH;
    this.y = (row + 0.5) * CARD_HEIGHT;

    this.interactiveChildren = false;
    this.cacheAsTexture = true;

    if (stage instanceof Container) {
      this.setupDraggable(stage);
    } else {
      this.setupStatic();
    }

    this.mesh = new PerspectiveMesh({
      texture: texture,
      verticesX: NUM_VERTICES,
      verticesY: NUM_VERTICES,
      // the local corner coordinates, clockwise
      x0: this.topLeftCorner.x,
      y0: this.topLeftCorner.y,
      x1: this.topRightCorner.x,
      y1: this.topRightCorner.y,
      x2: this.bottomRightCorner.x,
      y2: this.bottomRightCorner.y,
      x3: this.bottomLeftCorner.x,
      y3: this.bottomLeftCorner.y,
    });
    this.addChild(this.mesh);
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
      this.topLeftCorner.x,
      this.topLeftCorner.y,
      CARD_WIDTH,
      CARD_HEIGHT
    );

    // the relative offset point of the click on the tile
    this.grabPoint = new Point();

    // the 4 corners of the tile in local coordinates, clockwise
    this.cornerPoints = [
      this.topLeftCorner,
      this.topRightCorner,
      this.bottomRightCorner,
      this.bottomLeftCorner,
    ];

    this.shadow = new PerspectiveMesh({
      texture: Texture.WHITE,
      verticesX: NUM_VERTICES,
      verticesY: NUM_VERTICES,
      // the local corner coordinates, clockwise
      x0: this.topLeftCorner.x + SHADOW_OFFSET.x,
      y0: this.topLeftCorner.y + SHADOW_OFFSET.y,
      x1: this.topRightCorner.x + SHADOW_OFFSET.x,
      y1: this.topRightCorner.y + SHADOW_OFFSET.y,
      x2: this.bottomRightCorner.x + SHADOW_OFFSET.x,
      y2: this.bottomRightCorner.y + SHADOW_OFFSET.y,
      x3: this.bottomLeftCorner.x + SHADOW_OFFSET.x,
      y3: this.bottomLeftCorner.y + SHADOW_OFFSET.y,
    });
    this.shadow.tint = SHADOW_COLOR;
    this.shadow.alpha = SHADOW_ALPHA;
    this.shadow.visible = false;
    this.addChild(this.shadow);

    this.onpointerdown = (e) => this.onDragStart(e);
  }

  onDragStart(e) {
    this.scale.x = CARD_SCALE;
    this.scale.y = CARD_SCALE;
    this.shadow.visible = true;

    // store the local mouse coordinates into grab point
    e.getLocalPosition(this, this.grabPoint);

    // add a 3D effect, where the tile is tilted based on the grab point
    const normalizedGrabX = this.grabPoint.x / (CARD_WIDTH / 2);
    const normalizedGrabY = this.grabPoint.y / (CARD_HEIGHT / 2);

    // max TILT_ANGLE degree tilt based on grab point
    const angleX = normalizedGrabY * TILT_ANGLE;
    const angleY = normalizedGrabX * TILT_ANGLE;

    // Get the projected corner points
    const projectedCornerPoints = this.rotate3D(
      this.cornerPoints,
      angleX,
      angleY,
      PERSPECTIVE
    );

    this.shadow.setCorners(
      projectedCornerPoints[0].x + SHADOW_OFFSET.x,
      projectedCornerPoints[0].y + SHADOW_OFFSET.y,
      projectedCornerPoints[1].x + SHADOW_OFFSET.x,
      projectedCornerPoints[1].y + SHADOW_OFFSET.y,
      projectedCornerPoints[2].x + SHADOW_OFFSET.x,
      projectedCornerPoints[2].y + SHADOW_OFFSET.y,
      projectedCornerPoints[3].x + SHADOW_OFFSET.x,
      projectedCornerPoints[3].y + SHADOW_OFFSET.y
    );

    this.mesh.setCorners(
      projectedCornerPoints[0].x,
      projectedCornerPoints[0].y,
      projectedCornerPoints[1].x,
      projectedCornerPoints[1].y,
      projectedCornerPoints[2].x,
      projectedCornerPoints[2].y,
      projectedCornerPoints[3].x,
      projectedCornerPoints[3].y
    );

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
    this.scale.x = 1;
    this.scale.y = 1;
    this.shadow.visible = false;

    // align x, y to the checker board grid
    let col = Math.floor(this.x / CARD_WIDTH);
    let row = Math.floor(this.y / CARD_HEIGHT);
    // ensure the col is between 0 and 7
    col = Math.max(col, 0);
    col = Math.min(col, 7);
    // ensure the row is between 0 and 7
    row = Math.max(row, 0);
    row = Math.min(row, 7);
    // snap to the center of the grid cell
    this.x = (col + 0.5) * CARD_WIDTH;
    this.y = (row + 0.5) * CARD_HEIGHT;

    this.onpointerdown = (e) => this.onDragStart(e);

    this.stage.onpointermove = null;

    this.stage.onpointerup = null;
    this.stage.onpointercancel = null;
    this.stage.onpointerupoutside = null;
    this.stage.onpointercanceloutside = null;

    // Reset the both meshes back to flat
    this.shadow.setCorners(
      this.topLeftCorner.x + SHADOW_OFFSET.x,
      this.topLeftCorner.y + SHADOW_OFFSET.y,
      this.topRightCorner.x + SHADOW_OFFSET.x,
      this.topRightCorner.y + SHADOW_OFFSET.y,
      this.bottomRightCorner.x + SHADOW_OFFSET.x,
      this.bottomRightCorner.y + SHADOW_OFFSET.y,
      this.bottomLeftCorner.x + SHADOW_OFFSET.x,
      this.bottomLeftCorner.y + SHADOW_OFFSET.y
    );

    this.mesh.setCorners(
      this.topLeftCorner.x,
      this.topLeftCorner.y,
      this.topRightCorner.x,
      this.topRightCorner.y,
      this.bottomRightCorner.x,
      this.bottomRightCorner.y,
      this.bottomLeftCorner.x,
      this.bottomLeftCorner.y
    );
  }

  onDragMove(e) {
    const pos = e.getLocalPosition(this.parent);
    // set the new position of the tile
    // to be same as mouse position
    // minus the grab point offset
    this.x = pos.x - this.grabPoint.x;
    this.y = pos.y - this.grabPoint.y;
  }

  // Function to apply 3D rotation to the corner points and return projected points
  rotate3D(cornerPoints, angleX, angleY, perspective) {
    const radX = (angleX * Math.PI) / 180;
    const radY = (angleY * Math.PI) / 180;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    // Create new projected points by mapping the corner points
    return cornerPoints.map((src) => {
      // Create a new Point for the projection
      const projected = new Point();

      // Flat plane initially
      const x = src.x;
      const y = src.y;
      let z = 0;

      // Rotate around Y axis
      const xY = cosY * x - sinY * z;
      z = sinY * x + cosY * z;

      // Rotate around X axis
      const yX = cosX * y - sinX * z;
      z = sinX * y + cosX * z;

      // Apply perspective projection
      const scale = perspective / (perspective - z);

      projected.x = xY * scale;
      projected.y = yX * scale;

      return projected;
    });
  }
}
