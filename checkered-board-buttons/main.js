import { Application, Assets, Graphics, Sprite, Text } from "pixi.js";
import { FancyButton } from "@pixi/ui";
import { Board, NUM_CELLS } from "./Board";
import { Tile, TILE_SIZE } from "./Tile";

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

  const manifest = {
    bundles: [
      {
        name: "ui-assets",
        assets: [
          {
            alias: "button-large",
            src: "./assets/button-large.png"
          },
          {
            alias: "button-large-hover",
            src: "./assets/button-large-hover.png"
          },
          {
            alias: "button-large-press",
            src: "./assets/button-large-press.png"
          },
          {
            alias: "button-small",
            src: "./assets/button-small.png"
          },
          {
            alias: "button-small-hover",
            src: "./assets/button-small-hover.png"
          },
          {
            alias: "button-small-press",
            src: "./assets/button-small-press.png"
          }
        ]
      }
    ]
  };

  await Assets.init({ manifest: manifest });
  await Assets.loadBundle("ui-assets");
  console.log("Assets loaded");

  const button = new FancyButton({
    defaultView: "button-large",
    hoverView: "button-large-hover",
    pressedView: "button-large-press",
    width: 301,
    height: 112,
    anchor: 0.5,
    x: app.screen.width / 2,
    y: app.screen.height / 2,
    text: "Click me!",
    animations: {
      hover: {
        props: {
          scale: {
            x: 1.1,
            y: 1.1
          }
        },
        duration: 100
      },
      pressed: {
        props: {
          scale: {
            x: 0.9,
            y: 0.9
          }
        },
        duration: 100
      }
    }
  });

  button.onPress.connect(() => console.log("Button pressed!"));
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
