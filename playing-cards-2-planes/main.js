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

  // Get all available card texture keys and select 20 random ones
  const allTextureKeys = Object.keys(spriteSheet.textures);
  const selectedKeys = allTextureKeys.slice(0, 20); // Take first 20 cards for now

  // Add 10 cards to each plane
  for (let i = 0; i < 10; i++) {
    planeTable.addCard(spriteSheet, selectedKeys[i], onCardClick);
    planeHand.addCard(spriteSheet, selectedKeys[i + 10], onCardClick);
  }

  const onResize = () => {
    planeTable.resize();
    planeHand.resize();
  };

  addEventListener("resize", onResize);
  onResize();
})();
