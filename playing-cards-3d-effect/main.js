import { Application } from "pixi.js";
import { Board } from "./Board";
import { Card } from "./Card";

(async () => {
  const app = new Application();
  await app.init({ background: "DarkKhaki", resizeTo: window });

  // append the app canvas to the document body
  document.body.appendChild(app.canvas);

  // the app stage will handle the move events
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  const boardContainer = new Board();
  app.stage.addChild(boardContainer);

  // create 3 interactive, draggable Cards
  const r = new Card("Red", 3, 3, app.stage);
  const g = new Card("Green", 4, 3, app.stage);
  const b = new Card("Blue", 5, 3, app.stage);
  // create a static, non-draggable Card
  const c = new Card("Cyan", 7, 0);

  boardContainer.addChild(r);
  boardContainer.addChild(g);
  boardContainer.addChild(b);
  boardContainer.addChild(c);

  const onResize = () => {
    boardContainer.resize(app.screen.width, app.screen.height);
  };

  addEventListener("resize", onResize);
  onResize();
})();
