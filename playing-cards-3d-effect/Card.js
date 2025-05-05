import { Container, PerspectiveMesh, Point, Rectangle } from "pixi.js";

export const CARD_WIDTH = 188;
export const CARD_HEIGHT = 263;

const CARD_SCALE = 1.4;

const SHADOW_COLOR = "Black";
const SHADOW_ALPHA = 0.1;
const SHADOW_OFFSET = new Point(12, 8);

const PERSPECTIVE = 400;
const NUM_VERTICES = 40;
const TILT_ANGLE = 5;

export class Card extends Container {
  constructor(spriteSheet, spriteKey, cardX, cardY, cardAngle, stage) {
    super();

    // the 4 corners of the tile in local coordinates, clockwise
    this.topLeftCorner = new Point(-CARD_WIDTH / 2, -CARD_HEIGHT / 2);
    this.topRightCorner = new Point(CARD_WIDTH / 2, -CARD_HEIGHT / 2);
    this.bottomRightCorner = new Point(CARD_WIDTH / 2, CARD_HEIGHT / 2);
    this.bottomLeftCorner = new Point(-CARD_WIDTH / 2, CARD_HEIGHT / 2);

    this.x = cardX;
    this.y = cardY;

    this.angle = cardAngle;

    this.interactiveChildren = false;
    this.cacheAsTexture = true;

    const texture = spriteSheet.textures[spriteKey];

    if (stage instanceof Container) {
      this.setupDraggable(stage, texture);
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

  // Setup static, non-draggable Tile
  setupStatic() {
    this.eventMode = "none";
    this.cursor = null;
  }

  // Setup interactive, draggable Card and add shadow
  setupDraggable(stage, texture) {
    this.eventMode = "static";
    this.cursor = "pointer";

    // The app.stage is needed to add/remove event listeners
    this.stage = stage;

    // Setting hitArea is important for correct pointerdown events delivery
    this.hitArea = new Rectangle(
      this.topLeftCorner.x,
      this.topLeftCorner.y,
      CARD_WIDTH,
      CARD_HEIGHT
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
      texture: texture,
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
    this.scale.x = CARD_SCALE;
    this.scale.y = CARD_SCALE;
    this.setLocalShadowPosition();
    this.shadow.visible = true;

    // Calculate offset between the pointer position and the tile position
    // Both positions are in the parent's coordinate system
    const pointerParentPos = e.getLocalPosition(this.parent);
    this.parentGrabPoint.x = pointerParentPos.x - this.x;
    this.parentGrabPoint.y = pointerParentPos.y - this.y;

    // Add a 3D effect, where the card is tilted based on the grab point
    const normalizedGrabX = this.parentGrabPoint.x / (CARD_WIDTH / 2);
    const normalizedGrabY = this.parentGrabPoint.y / (CARD_HEIGHT / 2);

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

    // put the dragged card on the top
    let parent = this.parent;
    parent.removeChild(this);
    parent.addChild(this);
  }

  onDragEnd(e) {
    this.scale.x = 1;
    this.scale.y = 1;
    this.shadow.visible = false;

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
    const cardGlobalPos = this.getGlobalPosition();

    // Add the shadow offset in that global space
    const shadowGlobalPos = new Point(
      cardGlobalPos.x + SHADOW_OFFSET.x,
      cardGlobalPos.y + SHADOW_OFFSET.y
    );

    // Convert back to the card's local coordinate system
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
