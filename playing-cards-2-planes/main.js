/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Application, Assets, Container, Graphics, Rectangle, TexturePool } from 'pixi.js';
import { Card } from './Card.js';
import { Hand } from './Hand.js';
import { Table } from './Table.js';
import { Left } from './Left.js';
import { Right } from './Right.js';
import { Background } from './Background.js';
import { APP_BACKGROUND, APP_BOUNDS_LANDSCAPE, APP_BOUNDS_PORTRAIT, CARD_AREA_SIZE } from './Theme.js';

(async () => {
  TexturePool.textureOptions.scaleMode = 'nearest';

  const spriteSheet = await Assets.load('playing-cards.json');

  const app = new Application();
  await app.init({
    background: APP_BACKGROUND,
    resizeTo: window,
    antialias: true,
    hello: true
  });

  // Append the app canvas to the document body
  document.body.appendChild(app.canvas);

  // Orientation detection helpers
  const isLandscape = () => app.screen.width >= app.screen.height;
  const getAppBounds = () => (isLandscape() ? APP_BOUNDS_LANDSCAPE : APP_BOUNDS_PORTRAIT);
  const getCardOffset = () => {
    const bounds = getAppBounds();
    return {
      x: (bounds.width - CARD_AREA_SIZE) / 2,
      y: (bounds.height - CARD_AREA_SIZE) / 2
    };
  };

  // Layer 1: Background (unscaled, fills actual screen)
  const background = new Background(app.screen);
  app.stage.addChild(background);

  // Layer 2: App container (scaled to fit screen)
  const appContainer = new Container();
  app.stage.addChild(appContainer);

  // Layer 3: Card container (positioned within appContainer)
  const cardContainer = new Container();
  appContainer.addChild(cardContainer);

  // Card planes use fixed CARD_AREA_SIZE coordinate system
  const cardBounds = new Rectangle(0, 0, CARD_AREA_SIZE, CARD_AREA_SIZE);
  const left = new Left(cardBounds);
  const right = new Right(cardBounds);
  const table = new Table(cardBounds);
  const hand = new Hand(cardBounds);

  // Add to card container in z-order (back to front)
  cardContainer.addChild(table);
  cardContainer.addChild(left);
  cardContainer.addChild(right);
  cardContainer.addChild(hand);

  // Debug outlines (set alpha to 0 to hide)
  const debugAppBounds = new Graphics();
  debugAppBounds.alpha = 1;
  appContainer.addChild(debugAppBounds);

  const debugCardBounds = new Graphics();
  debugCardBounds.alpha = 1;
  cardContainer.addChild(debugCardBounds);

  const updateDebugOutlines = (appBounds) => {
    // Red outline for APP_BOUNDS
    debugAppBounds.clear();
    debugAppBounds.rect(0, 0, appBounds.width, appBounds.height);
    debugAppBounds.stroke({ width: 2, color: 0xff0000 });

    // Green outline for card area
    debugCardBounds.clear();
    debugCardBounds.rect(0, 0, CARD_AREA_SIZE, CARD_AREA_SIZE);
    debugCardBounds.stroke({ width: 2, color: 0x00ff00 });
  };

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

    let success = false;

    if (card.isParentTable()) {
      // Table to Hand
      const handPos = hand.toLocal(globalPos);
      success = hand.addCard(spriteSheet, card.textureKey, handPos, card.angle, 0.7, onCardClick);
      if (success) {
        table.removeCard(card);
      }
    } else if (card.isParentHand()) {
      // Hand to Table
      const tablePos = table.toLocal(globalPos);
      success = table.addCard(spriteSheet, card.textureKey, tablePos, card.angle, 0.7, onCardClick);
      if (success) {
        hand.removeCard(card);
      }
    } else if (card.isParentLeft()) {
      // Left to Table
      const tablePos = table.toLocal(globalPos);
      success = table.addCard(spriteSheet, card.textureKey, tablePos, card.angle, 0.7, onCardClick);
      if (success) {
        left.removeCard(card);
      }
    } else if (card.isParentRight()) {
      // Right to Table
      const tablePos = table.toLocal(globalPos);
      success = table.addCard(spriteSheet, card.textureKey, tablePos, card.angle, 0.7, onCardClick);
      if (success) {
        right.removeCard(card);
      }
    }

    // If the target container is full, shake the card and re-enable hover
    if (!success) {
      card.shake();
      card.enableHoverEffect();
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
      // Background fills actual screen (unscaled)
      background.resize();

      // Get layout for current orientation
      const appBounds = getAppBounds();

      // Scale app content to fit screen while maintaining aspect ratio
      const scale = Math.min(app.screen.width / appBounds.width, app.screen.height / appBounds.height);
      appContainer.scale.set(scale);

      // Center the app container in the window
      appContainer.x = (app.screen.width - appBounds.width * scale) / 2;
      appContainer.y = (app.screen.height - appBounds.height * scale) / 2;

      // Position card container within app bounds
      const cardOffset = getCardOffset();
      cardContainer.x = cardOffset.x;
      cardContainer.y = cardOffset.y;

      // Update debug outlines for current orientation
      updateDebugOutlines(appBounds);

      // Card containers resize (mostly no-op with fixed dimensions)
      left.resize();
      right.resize();
      table.resize();
      hand.resize();
    }, 500);
  };

  addEventListener('resize', onResize);
  onResize();

  // Update tween.js animations every frame
  app.ticker.add((time) => {
    Card.updateTweens(time.lastTime);
  });
})();
