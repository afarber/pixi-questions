import { Container, Matrix, PerspectiveMesh, Point, Rectangle } from "pixi.js";

export const CARD_WIDTH = 188;
export const CARD_HEIGHT = 263;

const CARD_SCALE = 1.4;

const SHADOW_COLOR = "Black";
const SHADOW_ALPHA = 0.1;
const SHADOW_OFFSET = new Point(12, 8);

const PERSPECTIVE = 300;
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

    // TODO do not rotate the card yet due to problems with:
    // 1. the shadow no more pointing to the southeast, independent of the card angle
    // 2. the grab point is not correct while the card is dragged
    // this.angle = cardAngle;

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

  // setup static, non-draggable Tile
  setupStatic() {
    this.eventMode = "none";
    this.cursor = null;
  }

  // setup interactive, draggable Tile and add shadow
  setupDraggable(stage, texture) {
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
      texture: texture,
      // Use less vertices for the shadow
      verticesX: NUM_VERTICES / 4,
      verticesY: NUM_VERTICES / 4,
      // Use same corner points as the tile,
      // since the shadow is initially invisible
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
    this.shadow.visible = true;

    console.log("onDragStart", this.angle, this.rotation);

    // Store the local mouse coordinates into grab point
    e.getLocalPosition(this, this.grabPoint);

    // Add a 3D effect, where the tile is tilted based on the grab point
    const normalizedGrabX = this.grabPoint.x / (CARD_WIDTH / 2);
    const normalizedGrabY = this.grabPoint.y / (CARD_HEIGHT / 2);

    // Max TILT_ANGLE degree tilt based on grab point
    const angleX = normalizedGrabY * TILT_ANGLE;
    const angleY = normalizedGrabX * TILT_ANGLE;

    // Get the projected corner points
    const projectedCornerPoints = this.rotate3D(
      this.cornerPoints,
      angleX,
      angleY,
      PERSPECTIVE
    );

    // Tilt the mesh based on the grab point
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

    // TODO the offsets should point to the normalized global southeast direction, multiplied by SHADOW_OFFSET
    // In other words the shadow should always point to the southeast, independent of the card angle
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

    // the shadow is invisible again,
    // no need to reset its corners
  }

  onDragMove(e) {
    const pos = e.getLocalPosition(this.parent);
    // set the new position of the tile
    // to be same as mouse position
    // minus the grab point offset
    this.x = pos.x - this.grabPoint.x;
    this.y = pos.y - this.grabPoint.y;
  }

  // Make shadow offset independent of card rotation
  getRotationIndependentShadowOffset() {
    // Define the desired shadow direction (southeast) as a vector
    const southeastVector = new Point(1, 1);

    // Create a rotation Matrix for the *inverse* of the card's rotation
    const inverseRotationMatrix = new Matrix();
    inverseRotationMatrix.rotate(-this.rotation);

    // Apply the inverse rotation to the southeast vector
    const rotatedSoutheast = inverseRotationMatrix.apply(southeastVector);

    // Normalize the rotated vector to get a direction
    const magnitude = Math.sqrt(
      rotatedSoutheast.x * rotatedSoutheast.x +
        rotatedSoutheast.y * rotatedSoutheast.y
    );
    const normalizedRotatedSoutheast = new Point(
      rotatedSoutheast.x / magnitude,
      rotatedSoutheast.y / magnitude
    );

    // Scale the normalized direction vector by the desired shadow offset magnitude
    const rotatedOffsetX =
      normalizedRotatedSoutheast.x *
      Math.sqrt(
        SHADOW_OFFSET.x * SHADOW_OFFSET.x + SHADOW_OFFSET.y * SHADOW_OFFSET.y
      );
    const rotatedOffsetY =
      normalizedRotatedSoutheast.y *
      Math.sqrt(
        SHADOW_OFFSET.x * SHADOW_OFFSET.x + SHADOW_OFFSET.y * SHADOW_OFFSET.y
      );

    return new Point(rotatedOffsetX, rotatedOffsetY);
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
