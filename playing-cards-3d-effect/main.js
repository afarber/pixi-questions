import { Application, Assets } from "pixi.js";
import { Board, NUM_CELLS } from "./Board";
import { Card, CARD_WIDTH, CARD_HEIGHT } from "./Card";

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

  // Function to create a random card with proper bounds
  const createRandomCard = (spriteKey) => {
    const boardWidth = NUM_CELLS * CARD_WIDTH;
    const boardHeight = NUM_CELLS * CARD_HEIGHT;
    // Random position within the board container
    const x = Math.random() * (boardWidth - CARD_WIDTH) + CARD_WIDTH / 2;
    const y = Math.random() * (boardHeight - CARD_HEIGHT) + CARD_HEIGHT / 2;

    // Random angle between -60 and +60 degrees
    const angle = Math.random() * 120 - 60;

    return new Card(spriteSheet, spriteKey, x, y, angle, app.stage);
  };

  const spriteSheet = await Assets.load("playing-cards.json");

  // Create 3 interactive, draggable Cards with random positions and angles
  const card1 = createRandomCard("TC");
  const card2 = createRandomCard("JH");
  const card3 = createRandomCard("QS");

  boardContainer.addChild(card1);
  boardContainer.addChild(card2);
  boardContainer.addChild(card3);

  const onResize = () => {
    boardContainer.resize(app.screen.width, app.screen.height);
  };

  addEventListener("resize", onResize);
  onResize();
})();
