import { Application } from "pixi.js";
import { Board } from "./Board";
import { Card } from "./Card";

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

  const r = new Card("red", 3, 3, app.stage);
  const g = new Card("green", 4, 3, app.stage);
  const b = new Card("blue", 5, 3, app.stage);

  boardContainer.addChild(r);
  boardContainer.addChild(g);
  boardContainer.addChild(b);

  const onResize = () => {
    boardContainer.resize(app.screen.width, app.screen.height);
  };

  addEventListener("resize", onResize);
  onResize();
})();
