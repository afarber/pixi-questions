import { Container, PerspectiveMesh, Rectangle, Point, Texture } from "pixi.js";

export const TILE_SIZE = 100;

const TILE_SCALE = 1.4;
const TILE_ALPHA = 0.7;

// The shadow offset in the screen coordinate system
const SHADOW_OFFSET = new Point(12, 8);
const SHADOW_COLOR = "Black";
const SHADOW_ALPHA = 0.1;

const PERSPECTIVE = 300;
const NUM_VERTICES = 20;
const TILT_ANGLE = 15;

export class Tile extends Container {
  constructor(color, col, row, angle, stage) {
    super();

    // the 4 corners of the tile in local coordinates, clockwise
    this.topLeftCorner = new Point(-TILE_SIZE / 2, -TILE_SIZE / 2);
    this.topRightCorner = new Point(TILE_SIZE / 2, -TILE_SIZE / 2);
    this.bottomRightCorner = new Point(TILE_SIZE / 2, TILE_SIZE / 2);
    this.bottomLeftCorner = new Point(-TILE_SIZE / 2, TILE_SIZE / 2);

    this.x = (col + 0.5) * TILE_SIZE;
    this.y = (row + 0.5) * TILE_SIZE;

    this.angle = angle;

    this.interactiveChildren = false;
    this.cacheAsTexture = true;

    if (stage instanceof Container) {
      this.setupDraggable(stage);
    } else {
      this.setupStatic();
    }

    this.mesh = new PerspectiveMesh({
      texture: Texture.WHITE,
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
    this.mesh.tint = color;
    this.addChild(this.mesh);
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
      this.topLeftCorner.x,
      this.topLeftCorner.y,
      TILE_SIZE,
      TILE_SIZE
    );

    // The offset between the pointer position and the tile position
    this.parentGrabPoint = new Point();

    // The 4 corners of the tile in local coordinates, clockwise
    this.flatCornerPoints = [
      this.topLeftCorner,
      this.topRightCorner,
      this.bottomRightCorner,
      this.bottomLeftCorner,
    ];

    this.shadow = new PerspectiveMesh({
      texture: Texture.WHITE,
      // Use less vertices for the shadow
      verticesX: NUM_VERTICES / 4,
      verticesY: NUM_VERTICES / 4,
      // The local corner coordinates, clockwise
      x0: this.topLeftCorner.x,
      y0: this.topLeftCorner.y,
      x1: this.topRightCorner.x,
      y1: this.topRightCorner.y,
      x2: this.bottomRightCorner.x,
      y2: this.bottomRightCorner.y,
      x3: this.bottomLeftCorner.x,
      y3: this.bottomLeftCorner.y,
    });
    this.shadow.tint = SHADOW_COLOR;
    this.shadow.alpha = SHADOW_ALPHA;
    this.shadow.visible = false;
    this.addChild(this.shadow);

    this.onpointerdown = (e) => this.onDragStart(e);
  }

  onDragStart(e) {
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

    // Add a 3D effect, where the tile is tilted based on the grab point
    const normalizedGrabX = this.parentGrabPoint.x / (TILE_SIZE / 2);
    const normalizedGrabY = this.parentGrabPoint.y / (TILE_SIZE / 2);

    // Max TILT_ANGLE degree tilt based on grab point
    const angleX = normalizedGrabY * TILT_ANGLE;
    const angleY = normalizedGrabX * TILT_ANGLE;

    // Get the projected corner points
    const projectedCornerPoints = this.rotate3D(
      this.flatCornerPoints,
      angleX,
      angleY,
      PERSPECTIVE
    );

    this.shadow.setCorners(
      projectedCornerPoints[0].x,
      projectedCornerPoints[0].y,
      projectedCornerPoints[1].x,
      projectedCornerPoints[1].y,
      projectedCornerPoints[2].x,
      projectedCornerPoints[2].y,
      projectedCornerPoints[3].x,
      projectedCornerPoints[3].y
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

    // Reset the mesh back to flat
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
