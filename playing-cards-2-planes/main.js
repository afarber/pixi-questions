import { Application, Assets, TexturePool } from "pixi.js";
import { Card } from "./Card.js";
import { Hand } from "./Hand.js";
import { Table } from "./Table.js";
import { Left } from "./Left.js";
import { Right } from "./Right.js";
import { Background } from "./Background.js";
import { APP_BACKGROUND } from "./Theme.js";

(async () => {
  TexturePool.textureOptions.scaleMode = "nearest";

  const spriteSheet = await Assets.load("playing-cards.json");

  const app = new Application();
  await app.init({
    background: APP_BACKGROUND,
    resizeTo: window,
    antialias: true,
    hello: true
  });

  // Append the app canvas to the document body
  document.body.appendChild(app.canvas);

  // Create background (added first, rendered behind everything)
  const background = new Background(app.screen);
  app.stage.addChild(background);

  // Create the four planes
  const left = new Left(app.screen);
  const right = new Right(app.screen);
  const table = new Table(app.screen);
  const hand = new Hand(app.screen);

  // Add to stage in z-order (back to front)
  app.stage.addChild(left);
  app.stage.addChild(right);
  app.stage.addChild(table);
  app.stage.addChild(hand);

  // Click handler: Table to Hand, any other parent (Left, Right, Hand) to Table
  const onCardClick = (card) => {
    console.log(`onCardClick: ${card}`);

    // Disable hover effect immediately after the click
    // to avoid interfering with tween animation
    card.disableHoverEffect();

    // End all ongoing tweens (jumping to final values) to prevent conflicts
    Card.endAllTweens();

    // Convert to stage coordinates using PixiJS transformation matrix
    const globalPos = card.parent.toGlobal(card.position);
    // Note: angle is same in both coordinate spaces since planes are not rotated

    if (card.isParentTable()) {
      // Table to Hand
      const handPos = hand.toLocal(globalPos);
      table.removeCard(card);
      hand.addCard(spriteSheet, card.textureKey, handPos, card.angle, 0.7, onCardClick);
    } else if (card.isParentHand()) {
      // Hand to Table
      const tablePos = table.toLocal(globalPos);
      hand.removeCard(card);
      table.addCard(spriteSheet, card.textureKey, tablePos, card.angle, 0.7, onCardClick);
    } else if (card.isParentLeft()) {
      // Left to Table
      const tablePos = table.toLocal(globalPos);
      left.removeCard(card);
      table.addCard(spriteSheet, card.textureKey, tablePos, card.angle, 0.7, onCardClick);
    } else if (card.isParentRight()) {
      // Right to Table
      const tablePos = table.toLocal(globalPos);
      right.removeCard(card);
      table.addCard(spriteSheet, card.textureKey, tablePos, card.angle, 0.7, onCardClick);
    }
  };

  // Get all available card texture keys, filtering with Card.isValidCard
  const cardTextureKeys = Object.keys(spriteSheet.textures).filter(Card.isValidCard);

  // Shuffle the cards
  const shuffledTextureKeys = cardTextureKeys.sort(() => Math.random() - 0.5);

  // Distribute cards: 10 to hand, 10 to left, 10 to right, 2 to table
  for (let i = 0; i < 10; i++) {
    hand.addCard(spriteSheet, shuffledTextureKeys[i], null, null, null, onCardClick);
  }
  for (let i = 10; i < 20; i++) {
    left.addCard(spriteSheet, shuffledTextureKeys[i], null, null, null, onCardClick);
  }
  for (let i = 20; i < 30; i++) {
    right.addCard(spriteSheet, shuffledTextureKeys[i], null, null, null, onCardClick);
  }
  for (let i = 30; i < 32; i++) {
    table.addCard(spriteSheet, shuffledTextureKeys[i], null, null, null, onCardClick);
  }

  let resizeTimeout;

  // Debounce resize handler to avoid excessive repositioning
  const onResize = () => {
    // The call is noop if the param is undefined or invalid
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
      background.resize();
      left.resize();
      right.resize();
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
