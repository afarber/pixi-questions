import { Application, Assets, Spritesheet } from "pixi.js";
import { Board } from "./Board";
import { Card } from "./Card";

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

  const boardContainer = new Board();
  app.stage.addChild(boardContainer);

  const spriteSheet = await Assets.load("playing-cards.json");

  const tcTexture = spriteSheet.textures["TC"];
  const jhTexture = spriteSheet.textures["JH"];
  const qsTexture = spriteSheet.textures["QS"];

  // create 3 interactive, draggable Cards
  const r = new Card(tcTexture, 1, 1, app.stage);
  const g = new Card(jhTexture, 2, 1, app.stage);
  const b = new Card(qsTexture, 3, 1, app.stage);

  boardContainer.addChild(r);
  boardContainer.addChild(g);
  boardContainer.addChild(b);

  const onResize = () => {
    boardContainer.resize(app.screen.width, app.screen.height);
  };

  addEventListener("resize", onResize);
  onResize();
})();
