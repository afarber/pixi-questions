import { Application, Assets } from "pixi.js";
import { Board, NUM_CELLS } from "./Board";

(async () => {
  const app = new Application();
  await app.init({
    background: "DarkKhaki",
    resizeTo: window,
    antialias: true,
    hello: true,
  });

  // append the app canvas to the document body
  document.body.appendChild(app.canvas);

  // the app stage will handle the move events
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  const spriteSheet = await Assets.load("playing-cards.json");

  const boardContainer = new Board(app.stage);
  app.stage.addChild(boardContainer);

  // Create 3 interactive, draggable Cards with random positions and angle
  boardContainer.createRandomCard(spriteSheet, "TC");
  boardContainer.createRandomCard(spriteSheet, "JH");
  boardContainer.createRandomCard(spriteSheet, "QS");

  const onResize = () => {
    boardContainer.resize(app.screen.width, app.screen.height);
  };

  addEventListener("resize", onResize);
  onResize();
})();
