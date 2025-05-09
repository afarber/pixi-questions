import { Application, Assets, TexturePool } from "pixi.js";
import { Board } from "./Board";

(async () => {
  const app = new Application();
  await app.init({
    background: "DarkKhaki",
    resizeTo: window,
    antialias: true,
    hello: true
  });

  // append the app canvas to the document body
  document.body.appendChild(app.canvas);

  // the app stage will handle the move events
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  TexturePool.textureOptions.scaleMode = "nearest";

  const spriteSheet = await Assets.load("playing-cards.json");

  const boardContainer = new Board(app.stage);
  app.stage.addChild(boardContainer);

  // Create interactive, draggable cards with random positions and angle
  for (const textureKey of Object.keys(spriteSheet.textures)) {
    boardContainer.createRandomCard(spriteSheet, textureKey);
  }

  const onResize = () => {
    boardContainer.resize(app.screen.width, app.screen.height);
  };

  addEventListener("resize", onResize);
  onResize();
})();
