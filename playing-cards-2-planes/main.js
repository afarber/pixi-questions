import { Application, Assets, TexturePool } from "pixi.js";
import { PlaneHand } from "./PlaneHand.js";
import { PlaneTable } from "./PlaneTable.js";

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

  // Create the two planes
  const planeTable = new PlaneTable(app);
  const planeHand = new PlaneHand(app);

  app.stage.addChild(planeTable);
  app.stage.addChild(planeHand);

  // Check if a card key is valid (7-A of C/D/H/S)
  const isValidCard = (key) => {
    const validRanks = ["7", "8", "9", "T", "J", "Q", "K", "A"];
    const validSuits = ["C", "D", "H", "S"];
    return validRanks.some((rank) => key.startsWith(rank)) && validSuits.some((suit) => key.endsWith(suit));
  };

  // Click handler to switch card between planes
  const onCardClick = (card) => {
    if (card.parent === planeTable) {
      planeTable.removeCard(card);
      planeHand.addCard(spriteSheet, card.textureKey, onCardClick);
    } else if (card.parent === planeHand) {
      planeHand.removeCard(card);
      planeTable.addCard(spriteSheet, card.textureKey, onCardClick);
    }
  };

  // Get all available card texture keys, filtering with isValidCard
  const allTextureKeys = Object.keys(spriteSheet.textures).filter(isValidCard);

  // Shuffle the cards
  const shuffled = allTextureKeys.sort(() => Math.random() - 0.5);

  // Add 10 random cards to hand and 22 to table
  for (let i = 0; i < 10; i++) {
    planeHand.addCard(spriteSheet, shuffled[i], onCardClick);
  }
  for (let i = 10; i < 32; i++) {
    planeTable.addCard(spriteSheet, shuffled[i], onCardClick);
  }

  const onResize = () => {
    planeTable.resize();
    planeHand.resize();
  };

  addEventListener("resize", onResize);
  onResize();
})();
