import { Application, Assets, Sprite, Text } from "pixi.js";
import { Board } from "./Board";
import { Tile, TILE_SIZE } from "./Tile";
import { Tween, Easing } from "@tweenjs/tween.js";

(async () => {
  const app = new Application();
  await app.init({ background: "LightSalmon", resizeTo: window, hello: true });

  // append the app canvas to the document body
  document.body.appendChild(app.canvas);

  // the app stage will handle the move events
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  const boardContainer = new Board();
  app.stage.addChild(boardContainer);

  // create 3 interactive, draggable Tiles with initial off-screen position
  const r = new Tile("Red", -3, -3, -30, app.stage);
  const g = new Tile("Green", -3, -3, 0, app.stage);
  const b = new Tile("Blue", -3, -3, 80, app.stage);
  // create a static, non-draggable Tile
  const c = new Tile("Cyan", 7, 0, 5);

  boardContainer.addChild(r);
  boardContainer.addChild(g);
  boardContainer.addChild(b);
  boardContainer.addChild(c);

  const bunny = await createBunny();
  boardContainer.addChild(bunny);

  const label = createLabel();
  boardContainer.addChild(label);

  console.log("__YES__");
  console.log("__NO__");
  console.log("__CANCEL__");

  const rTween = createTileTween(r, finalPositions.r, Easing.Bounce.Out, 300);
  const gTween = createTileTween(g, finalPositions.g, Easing.Elastic.Out, 600);
  const bTween = createTileTween(b, finalPositions.b, Easing.Back.Out, 900);

  app.ticker.add((time) => {
    // Update all tweens
    rTween.update();
    gTween.update();
    bTween.update();

    bunny.rotation += 0.05 * time.deltaTime;
    label.skew.x += 0.02 * time.deltaTime;
    label.skew.y += 0.01 * time.deltaTime;
  });

  const onResize = () => {
    boardContainer.resize(app.screen.width, app.screen.height);
  };

  addEventListener("resize", onResize);
  onResize();
})();

async function createBunny() {
  const texture = await Assets.load("https://pixijs.com/assets/bunny.png");
  const bunny = new Sprite(texture);
  bunny.anchor.set(0.5);
  bunny.x = TILE_SIZE / 2;
  bunny.y = TILE_SIZE / 2;
  return bunny;
}

function createLabel() {
  const label = new Text({ text: "__NO__" });
  label.x = TILE_SIZE * 7.5;
  label.y = TILE_SIZE * 7.5;
  label.anchor.set(0.5);
  return label;
}

// Define final positions for the tiles
const finalPositions = {
  r: { x: (3 + 0.5) * TILE_SIZE, y: (3 + 0.5) * TILE_SIZE, angle: -30 },
  g: { x: (4 + 0.5) * TILE_SIZE, y: (3 + 0.5) * TILE_SIZE, angle: 0 },
  b: { x: (5 + 0.5) * TILE_SIZE, y: (3 + 0.5) * TILE_SIZE, angle: 80 },
};

function createTileTween(tile, final, easingFn, delay) {
  return new Tween({ x: tile.x, y: tile.y, angle: 0, scale: 0 })
    .to(
      {
        x: final.x,
        y: final.y,
        angle: final.angle,
        scale: 1,
      },
      1200
    )
    .easing(easingFn)
    .onUpdate((props) => {
      tile.x = props.x;
      tile.y = props.y;
      tile.angle = props.angle;
      tile.scale.set(props.scale);
    })
    .delay(delay)
    .start();
}
