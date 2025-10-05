import { Application, Assets, TexturePool } from "pixi.js";
import { Tween, Easing } from "@tweenjs/tween.js";
import { Card } from "./Card.js";
import { Hand } from "./Hand.js";
import { Table } from "./Table.js";

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

    const oldX = card.x;
    const oldY = card.y;
    const oldAngle = card.angle;
    const oldParent = card.parent;

    if (card.isParentTable()) {
      table.removeCard(card);
      const newCard = hand.addCard(spriteSheet, card.textureKey, onCardClick);

      // Store target position after repositionCards() was called
      const targetX = newCard.x;
      const targetY = newCard.y;

      // Set starting position to old position
      newCard.x = oldParent.x + oldX;
      newCard.y = oldParent.y + oldY;
      newCard.angle = oldAngle;
      newCard.alpha = 0.7;

      const tween = new Tween(newCard, Card.tweenGroup)
        .to({ x: targetX, y: targetY, angle: 0, alpha: 1 }, 400)
        .easing(Easing.Cubic.Out);
      Card.tweenGroup.add(tween);
      tween.start();
    } else if (card.isParentHand()) {
      hand.removeCard(card);
      const newCard = table.addCard(spriteSheet, card.textureKey, onCardClick);

      // Store target position before animating from old position
      const targetX = newCard.x;
      const targetY = newCard.y;
      const targetAngle = newCard.angle;

      newCard.x = oldParent.x + oldX;
      newCard.y = oldParent.y + oldY;
      newCard.angle = 0;
      newCard.alpha = 0.7;

      const tween = new Tween(newCard, Card.tweenGroup)
        .to({ x: targetX, y: targetY, angle: targetAngle, alpha: 1 }, 400)
        .easing(Easing.Cubic.Out);
      Card.tweenGroup.add(tween);
      tween.start();
    }
  };

  // Get all available card texture keys, filtering with Card.isValidCard
  const cardTextureKeys = Object.keys(spriteSheet.textures).filter(Card.isValidCard);

  // Shuffle the cards
  const shuffledTextureKeys = cardTextureKeys.sort(() => Math.random() - 0.5);

  // Add 10 random cards to hand and 22 to table
  for (let i = 0; i < 10; i++) {
    hand.addCard(spriteSheet, shuffledTextureKeys[i], onCardClick);
  }
  for (let i = 10; i < 32; i++) {
    table.addCard(spriteSheet, shuffledTextureKeys[i], onCardClick);
  }

  let resizeTimeout;

  // Debounce resize handler to avoid excessive repositioning
  const onResize = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

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
