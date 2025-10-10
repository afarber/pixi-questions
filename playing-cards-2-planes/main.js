import { Application, Assets, TexturePool } from "pixi.js";
import { Card } from "./Card.js";
import { Hand } from "./Hand.js";
import { Table } from "./Table.js";

(async () => {
  TexturePool.textureOptions.scaleMode = "nearest";

  const spriteSheet = await Assets.load("playing-cards.json");

  const app = new Application();
  await app.init({
    background: "DarkKhaki",
    resizeTo: window,
    antialias: true,
    hello: true
  });

  // Append the app canvas to the document body
  document.body.appendChild(app.canvas);

  // Create the two planes
  const table = new Table(app.screen);
  const hand = new Hand(app.screen);

  app.stage.addChild(table);
  app.stage.addChild(hand);

  // Click handler to switch card between planes with animation
  const onCardClick = (card) => {
    console.log(`onCardClick: ${card}`);

    // Disable hover effect immediately after the click
    // to avoid interfering with tween animation
    card.disableHoverEffect();

    // End all ongoing tweens (jumping to final values) to prevent conflicts
    Card.endAllTweens();

    // Convert to stage coordinates using PixiJS transformation matrix
    const globalPos = card.parent.toGlobal(card.position);

    if (card.isParentTable()) {
      // Convert from stage to Hand's local coordinates
      const handPos = hand.toLocal(globalPos);
      table.removeCard(card);
      hand.addCard(spriteSheet, card.textureKey, handPos.x, handPos.y, card.angle, 0.7, onCardClick);
    } else if (card.isParentHand()) {
      // Convert from stage to Table's local coordinates
      const tablePos = table.toLocal(globalPos);
      hand.removeCard(card);
      table.addCard(spriteSheet, card.textureKey, tablePos.x, tablePos.y, card.angle, 0.7, onCardClick);
    }
  };

  // Get all available card texture keys, filtering with Card.isValidCard
  const cardTextureKeys = Object.keys(spriteSheet.textures).filter(Card.isValidCard);

  // Shuffle the cards
  const shuffledTextureKeys = cardTextureKeys.sort(() => Math.random() - 0.5);

  // Add 10 random cards to hand and 22 to table
  for (let i = 0; i < 10; i++) {
    hand.addCard(spriteSheet, shuffledTextureKeys[i], null, null, null, null, onCardClick);
  }
  for (let i = 10; i < 32; i++) {
    table.addCard(spriteSheet, shuffledTextureKeys[i], null, null, null, null, onCardClick);
  }

  let resizeTimeout;

  // Debounce resize handler to avoid excessive repositioning
  const onResize = () => {
    // The call is noop if the param is undefined or invalid
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
      table.resize();
      hand.resize();
    }, 500);
  };

  addEventListener("resize", onResize);
  onResize();

  // Update tween.js animations every frame
  app.ticker.add((time) => {
    Card.updateTweens(time.lastTime);
  });
})();
