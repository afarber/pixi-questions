import { Application, Assets, Graphics, Sprite } from "pixi.js";
import { CELL } from "./Tile";

(async () => {
  const app = new Application();
  await app.init({ background: "#CCFFCC", resizeTo: window });
  // Append the app canvas to the document body
  document.body.appendChild(app.canvas);

  const background = createBackground();
  app.stage.addChild(background);

  const bunny = await createBunny();
  app.stage.addChild(bunny);

  const centerBunny = () => {
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;
  };

  addEventListener("resize", centerBunny);
  centerBunny();

  app.ticker.add((time) => {
    bunny.rotation += 0.1 * time.deltaTime;
  });
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
  return bunny;
}
