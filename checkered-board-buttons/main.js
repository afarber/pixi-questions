import { Application, Assets, Sprite } from "pixi.js";
import { Board } from "./Board";
import { Tile, CELL } from "./Tile";

(async () => {
  const app = new Application();
  await app.init({ background: "#CCFFCC", resizeTo: window });
  // append the app canvas to the document body
  document.body.appendChild(app.canvas);

  // the app stage will handle the move events
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  const boardContainer = new Board();
  app.stage.addChild(boardContainer);

  const bunny = await createBunny();
  boardContainer.addChild(bunny);

  const r = new Tile("red", 3, 3, app.stage);
  const g = new Tile("green", 4, 3, app.stage);
  const b = new Tile("blue", 5, 3, app.stage);

  boardContainer.addChild(r);
  boardContainer.addChild(g);
  boardContainer.addChild(b);

  app.ticker.add((time) => {
    bunny.rotation += 0.05 * time.deltaTime;
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
  bunny.x = CELL / 2;
  bunny.y = CELL / 2;
  return bunny;
}
