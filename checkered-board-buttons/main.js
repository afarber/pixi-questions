import {
  Application,
  Assets,
  Container,
  Graphics,
  Point,
  Sprite,
} from "pixi.js";
import { Tile, CELL } from "./Tile";

(async () => {
  let boardScale = 1.0;
  let boardOrigin = new Point();

  // the relative offset point of the click on the tile
  let grabPoint = new Point();
  let draggedTile;

  function onDragStart({ target, global }) {
    draggedTile = target;
    draggedTile.toLocal(global, null, grabPoint);
    grabPoint.x *= draggedTile.scale.x;
    grabPoint.y *= draggedTile.scale.y;
    app.stage.cursor = "pointer";
    app.stage.on("pointermove", onDragMove);
    // put the dragged object on the top
    app.stage.removeChild(draggedTile);
    app.stage.addChild(draggedTile);
    draggedTile.startDragging();
    console.log("onDragStart:", draggedTile.x, draggedTile.y);
  }

  function onDragMove({ global: { x, y } }) {
    draggedTile.x = x - grabPoint.x;
    draggedTile.y = y - grabPoint.y;
    console.log("onDragMove:", draggedTile.x, draggedTile.y);
  }

  function onDragEnd() {
    // reset the tile scale and calculate its col and row
    draggedTile.stopDragging();
    // the next 2 lines are not needed here, but
    // in my real game the tile is put beneath the HUD
    app.stage.removeChild(draggedTile);
    app.stage.addChildAt(draggedTile, app.stage.children.length);
    app.stage.cursor = null;
    app.stage.off("pointermove", onDragMove);
    console.log("onDragEnd:", draggedTile.x, draggedTile.y);
    draggedTile = null;
  }

  const app = new Application();
  await app.init({ background: "#CCFFCC", resizeTo: window });
  // Append the app canvas to the document body
  document.body.appendChild(app.canvas);

  // The stage will handle the move events
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  app.stage.removeChildren();

  const rootContainer = new Container();
  app.stage.addChild(rootContainer);

  const background = createBackground();
  rootContainer.addChild(background);

  const r = new Tile("red", onDragStart, onDragEnd, 3, 3);
  const g = new Tile("green", onDragStart, onDragEnd, 4, 3);
  const b = new Tile("blue", onDragStart, onDragEnd, 5, 3);

  rootContainer.addChild(r);
  rootContainer.addChild(g);
  rootContainer.addChild(b);

  function resizeRootContainer(appWidth, appHeight) {
    const boardSize = 8 * CELL;
    const appSize = Math.min(appWidth, appHeight);
    boardScale = appSize / boardSize;
    rootContainer.scale.set(boardScale);

    boardOrigin.x = (appWidth - appSize) / 2;
    boardOrigin.y = (appHeight - appSize) / 2;
    rootContainer.position.set(boardOrigin.x, boardOrigin.y);

    console.log(
      "resizeRootContainer",
      appWidth,
      appHeight,
      boardSize,
      appSize,
      boardScale,
      boardOrigin
    );
  }

  const bunny = await createBunny();
  rootContainer.addChild(bunny);

  app.ticker.add((time) => {
    bunny.rotation += 0.1 * time.deltaTime;
  });

  const onResize = () => {
    console.log("onResize", CELL, app.screen.width, app.screen.height);
    resizeRootContainer(app.screen.width, app.screen.height);
  };

  addEventListener("resize", onResize);
  onResize();
})();

function createBackground() {
  const background = new Graphics();
  background.setFillStyle({ color: "0xCCCCFF" });

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if ((i + j) % 2 === 0) {
        background.rect(i * CELL, j * CELL, CELL, CELL);
        background.fill();
      }
    }
  }

  return background;
}

async function createBunny() {
  const texture = await Assets.load("https://pixijs.com/assets/bunny.png");
  const bunny = new Sprite(texture);
  bunny.anchor.set(0.5);
  bunny.x = CELL / 2;
  bunny.y = CELL / 2;
  return bunny;
}
