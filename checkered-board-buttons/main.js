import { Application, Assets, Graphics, Sprite, Text } from "pixi.js";
import { Button } from "@pixi/ui";
import { Board, NUM_CELLS } from "./Board";
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
  const r = new Tile("Red", 3, 3, -30, app.stage);
  const g = new Tile("Green", 4, 3, 0, app.stage);
  const b = new Tile("Blue", 5, 3, 80, app.stage);
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

  const button = new Button(
    new Graphics().roundRect(0, 0, 100, 50, 15).fill("white")
  );

  button.onPress.connect(() => console.log("onPress"));
  app.stage.addChild(button.view);

  console.log("__YES__");
  console.log("__NO__");
  console.log("__CANCEL__");

  app.ticker.add((time) => {
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
  label.x = (NUM_CELLS - 0.5) * TILE_SIZE;
  label.y = (NUM_CELLS - 0.5) * TILE_SIZE;
  label.anchor.set(0.5);
  return label;
}
