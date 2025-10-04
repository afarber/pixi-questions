import { Application, Assets, TexturePool } from "pixi.js";
import { Group, Tween, Easing } from "@tweenjs/tween.js";
import { Card } from "./Card.js";
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

  // Create tween group for managing card animations
  const cardsTweenGroup = new Group();

  // Click handler to switch card between planes with animation
  const onCardClick = (card) => {
    // End all ongoing tweens (jumping to final values) to prevent conflicts
    cardsTweenGroup.getAll().forEach((tween) => tween.end());
    cardsTweenGroup.removeAll();

    const oldX = card.x;
    const oldY = card.y;
    const oldAngle = card.angle;
    const oldParent = card.parent;

    // Disable hover effect immediately after the click
    // to avoid interfering with tween animation
    card.disableHoverEffect();

    if (card.isParentTable()) {
      planeTable.removeCard(card);
      const newCard = planeHand.addCard(spriteSheet, card.textureKey, onCardClick);

      // Store target position after repositionCards() was called
      const targetX = newCard.x;
      const targetY = newCard.y;

      // Set starting position to old position
      newCard.x = oldParent.x + oldX;
      newCard.y = oldParent.y + oldY;
      newCard.angle = oldAngle;
      newCard.alpha = 0.7;

      const tween = new Tween(newCard, cardsTweenGroup).to({ x: targetX, y: targetY, angle: 0, alpha: 1 }, 400).easing(Easing.Cubic.Out);
      cardsTweenGroup.add(tween);
      tween.start();
    } else if (card.isParentHand()) {
      planeHand.removeCard(card);
      const newCard = planeTable.addCard(spriteSheet, card.textureKey, onCardClick);

      // Store target position before animating from old position
      const targetX = newCard.x;
      const targetY = newCard.y;
      const targetAngle = newCard.angle;

      newCard.x = oldParent.x + oldX;
      newCard.y = oldParent.y + oldY;
      newCard.angle = 0;
      newCard.alpha = 0.7;

      const tween = new Tween(newCard, cardsTweenGroup).to({ x: targetX, y: targetY, angle: targetAngle, alpha: 1 }, 400).easing(Easing.Cubic.Out);
      cardsTweenGroup.add(tween);
      tween.start();
    }
  };

  // Get all available card texture keys, filtering with Card.isValidCard
  const allTextureKeys = Object.keys(spriteSheet.textures).filter(Card.isValidCard);

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

  // Update tween.js animations every frame
  app.ticker.add((time) => {
    cardsTweenGroup.update(time.lastTime);
  });
})();
