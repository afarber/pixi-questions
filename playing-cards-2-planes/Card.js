import { Container, PerspectiveMesh, Point, Rectangle } from "pixi.js";

export const CARD_WIDTH = 188;
export const CARD_HEIGHT = 263;

const PERSPECTIVE = 400;
const NUM_VERTICES = 40;

export class Card extends Container {
  constructor(spriteSheet, textureKey, cardX, cardY, cardAngle, clickHandler = null) {
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

    const texture = spriteSheet.textures[textureKey];

    // Setup as clickable card
    this.#setupClickable(clickHandler);

    // The 4 corners of the tile in local coordinates, clockwise (for future 3D use)
    this.flatCornerPoints = [
      this.topLeftCorner,
      this.topRightCorner,
      this.bottomRightCorner,
      this.bottomLeftCorner,
    ];

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

  // Setup clickable card
  #setupClickable(clickHandler) {
    if (clickHandler) {
      this.eventMode = "static";
      this.cursor = "pointer";

      // Setting hitArea is important for correct click events delivery
      this.hitArea = new Rectangle(
        this.topLeftCorner.x,
        this.topLeftCorner.y,
        CARD_WIDTH,
        CARD_HEIGHT
      );

      this.onpointerdown = () => clickHandler(this);
    } else {
      this.eventMode = "none";
      this.cursor = null;
    }
  }

  // Apply 3D tilt effect to the card (for PlaneTable cards in future stages)
  apply3DTilt(angleX, angleY) {
    const projectedCornerPoints = this.#rotate3D(
      this.flatCornerPoints,
      angleX,
      angleY,
      PERSPECTIVE
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
  }

  // Reset card to flat (no 3D tilt)
  resetToFlat() {
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

  // Function to apply 3D rotation to the corner points and return projected points
  #rotate3D(cornerPoints, angleX, angleY, perspective) {
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
