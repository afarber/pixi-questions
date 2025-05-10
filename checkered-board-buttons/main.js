import { Application, Assets, Graphics, Sprite, Text } from "pixi.js";
import { FancyButton } from "@pixi/ui";
import { Board, NUM_CELLS } from "./Board";
import { Tile, TILE_SIZE } from "./Tile";

const BUTTON_WIDTH = 200;
const buttons = [];

(async () => {
  const app = new Application();
  await app.init({ background: "LightSalmon", resizeTo: window, hello: true });

  // append the app canvas to the document body
  document.body.appendChild(app.canvas);

  // the app stage will handle the move events
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  await Assets.init({ manifest: "./manifest.json" });
  const animalsAssets = await Assets.loadBundle("animals");

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

  const bunny = await createBunny("bunny");
  boardContainer.addChild(bunny);

  const label = createLabel();
  boardContainer.addChild(label);

  const button = createButton({
    width: BUTTON_WIDTH,
    height: 50,
    text: "Click me!"
  });

  button.onPress.connect(() => console.log("Button pressed!"));
  //button.enabled = false;
  app.stage.addChild(button);

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
    button.x = app.screen.width - button.width / 2;
    button.y = app.screen.height / 2;
  };

  addEventListener("resize", onResize);
  onResize();
})();

async function createBunny(textureAlias) {
  const bunny = Sprite.from(textureAlias);
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

function createButton(opts) {
  const button = new FancyButton({
    defaultView: new Graphics()
      .roundRect(0, 0, opts.width, opts.height, 20)
      .fill({ color: "BlanchedAlmond" }),
    hoverView: new Graphics()
      .roundRect(0, 0, opts.width, opts.height, 20)
      .fill({ color: "LightCoral" }),
    pressedView: new Graphics()
      .roundRect(0, 0, opts.width, opts.height, 20)
      .fill({ color: "LightPink" }),
    width: opts.width,
    height: opts.height,
    anchor: 0.5,
    text: opts.text,
    animations: {
      hover: {
        props: {
          scale: {
            x: 1.05,
            y: 1.05
          }
        },
        duration: 100
      },
      pressed: {
        props: {
          scale: {
            x: 0.95,
            y: 0.95
          }
        },
        duration: 100
      }
    }
  });

  return button;
}
