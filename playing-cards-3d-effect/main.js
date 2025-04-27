import { Application, Assets } from "pixi.js";
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

  const tcTexture = await Assets.load({
    src: "playing-cards/TC.svg",
    data: {
      resolution: 4,
    },
  });

  const jhTexture = await Assets.load({
    src: "playing-cards/JH.svg",
    data: {
      resolution: 4,
    },
  });

  const qsTexture = await Assets.load({
    src: "playing-cards/QS.svg",
    data: {
      resolution: 4,
    },
  });

  // create 3 interactive, draggable Cards
  const r = new Card(tcTexture, 3, 3, app.stage);
  const g = new Card(jhTexture, 4, 3, app.stage);
  const b = new Card(qsTexture, 5, 3, app.stage);

  boardContainer.addChild(r);
  boardContainer.addChild(g);
  boardContainer.addChild(b);

  const onResize = () => {
    boardContainer.resize(app.screen.width, app.screen.height);
  };

  addEventListener("resize", onResize);
  onResize();
})();
