import { Container, PerspectiveMesh, Rectangle, Point, Texture } from "pixi.js";

export const CELL = 100;

const SHADOW_COLOR = 0x000000;
const SHADOW_ALPHA = 0.1;
const SHADOW_OFFSET = new Point(8, 6);

const TILE_SCALE = 1.4;
const TILE_ALPHA = 0.7;

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

      this.points = [
        { x: -CELL / 2, y: -CELL / 2 },
        { x: CELL / 2, y: -CELL / 2 },
        { x: CELL / 2, y: CELL / 2 },
        { x: -CELL / 2, y: CELL / 2 },
      ];
      this.outPoints = this.points.map((p) => ({ ...p }));

      this.onpointerdown = (e) => this.onDragStart(e);
    } else {
      this.eventMode = "none";
      this.cursor = null;
    }

    this.shadow = new PerspectiveMesh({
      texture: Texture.WHITE,
      verticesX: 10,
      verticesY: 10,
      // top left corner
      x0: -CELL / 2 + SHADOW_OFFSET.x,
      y0: -CELL / 2 + SHADOW_OFFSET.y,
      // top right corner
      x1: CELL / 2 + SHADOW_OFFSET.x,
      y1: -CELL / 2 + SHADOW_OFFSET.y,
      // bottom right corner
      x2: CELL / 2 + SHADOW_OFFSET.x,
      y2: CELL / 2 + SHADOW_OFFSET.y,
      // bottom left corner
      x3: -CELL / 2 + SHADOW_OFFSET.x,
      y3: CELL / 2 + SHADOW_OFFSET.y,
    });
    this.shadow.tint = SHADOW_COLOR;
    this.shadow.alpha = SHADOW_ALPHA;
    this.shadow.visible = false;
    this.addChild(this.shadow);

    this.mesh = new PerspectiveMesh({
      texture: Texture.WHITE,
      verticesX: 10,
      verticesY: 10,
      // top left corner
      x0: -CELL / 2,
      y0: -CELL / 2,
      // top right corner
      x1: CELL / 2,
      y1: -CELL / 2,
      // bottom right corner
      x2: CELL / 2,
      y2: CELL / 2,
      // bottom left corner
      x3: -CELL / 2,
      y3: CELL / 2,
    });
    this.mesh.tint = color;
    this.addChild(this.mesh);

    this.interactiveChildren = false;
    this.cacheAsTexture = true;
  }

  onDragStart(e) {
    this.scale.x = TILE_SCALE;
    this.scale.y = TILE_SCALE;
    this.alpha = TILE_ALPHA;
    this.shadow.visible = true;

    // store the local mouse coordinates into grab point
    e.getLocalPosition(this, this.grabPoint);
    console.log("this.grabPoint:", this.grabPoint);

    // add a 3D effect, where the tile is tilted based on the grab point
    const normalizedGrabX = (this.grabPoint.x - CELL / 2) / (CELL / 2);
    const normalizedGrabY = (this.grabPoint.y - CELL / 2) / (CELL / 2);

    const perspective = 300;

    // max 15 deg tilt based on grab point
    const angleX = normalizedGrabY * 15;
    const angleY = normalizedGrabX * 15;

    this.rotate3D(this.points, this.outPoints, angleX, angleY, perspective);

    this.mesh.setCorners(
      this.outPoints[0].x,
      this.outPoints[0].y,
      this.outPoints[1].x,
      this.outPoints[1].y,
      this.outPoints[2].x,
      this.outPoints[2].y,
      this.outPoints[3].x,
      this.outPoints[3].y
    );

    this.shadow.setCorners(
      this.outPoints[0].x + SHADOW_OFFSET.x,
      this.outPoints[0].y + SHADOW_OFFSET.y,
      this.outPoints[1].x + SHADOW_OFFSET.x,
      this.outPoints[1].y + SHADOW_OFFSET.y,
      this.outPoints[2].x + SHADOW_OFFSET.x,
      this.outPoints[2].y + SHADOW_OFFSET.y,
      this.outPoints[3].x + SHADOW_OFFSET.x,
      this.outPoints[3].y + SHADOW_OFFSET.y
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
    let col = Math.floor(this.x / CELL);
    let row = Math.floor(this.y / CELL);
    // ensure the col is between 0 and 7
    col = Math.max(col, 0);
    col = Math.min(col, 7);
    // ensure the row is between 0 and 7
    row = Math.max(row, 0);
    row = Math.min(row, 7);
    // snap to the center of the grid cell
    this.x = (col + 0.5) * CELL;
    this.y = (row + 0.5) * CELL;

    this.onpointerdown = (e) => this.onDragStart(e);

    this.stage.onpointermove = null;

    this.stage.onpointerup = null;
    this.stage.onpointercancel = null;
    this.stage.onpointerupoutside = null;
    this.stage.onpointercanceloutside = null;

    // Reset mesh to flat
    this.mesh.setCorners(
      -CELL / 2,
      -CELL / 2,
      CELL / 2,
      -CELL / 2,
      CELL / 2,
      CELL / 2,
      -CELL / 2,
      CELL / 2
    );

    this.shadow.setCorners(
      -CELL / 2 + SHADOW_OFFSET.x,
      -CELL / 2 + SHADOW_OFFSET.y,
      CELL / 2 + SHADOW_OFFSET.x,
      -CELL / 2 + SHADOW_OFFSET.y,
      CELL / 2 + SHADOW_OFFSET.x,
      CELL / 2 + SHADOW_OFFSET.y,
      -CELL / 2 + SHADOW_OFFSET.x,
      CELL / 2 + SHADOW_OFFSET.y
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

  // Function to apply 3D rotation to the points
  rotate3D(points, outPoints, angleX, angleY, perspective) {
    const radX = (angleX * Math.PI) / 180;
    const radY = (angleY * Math.PI) / 180;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    for (let i = 0; i < points.length; i++) {
      const src = points[i];
      const out = outPoints[i];

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

      out.x = xY * scale;
      out.y = yX * scale;
    }
  }
}
