/*
 * Copyright (c) 2026 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Application, Assets, TexturePool } from 'pixi.js';
import { SkatEngine } from './engine/SkatEngine.js';
import { TableScene } from './ui/TableScene.js';
import { PromptOverlay } from './ui/PromptOverlay.js';

TexturePool.textureOptions.scaleMode = 'nearest';

const app = new Application();
await app.init({
  resizeTo: window,
  antialias: true,
  background: '#0f3a3e'
});

document.getElementById('app').appendChild(app.canvas);

const cardSheet = await Assets.load('/assets/playing-cards.json');
const avatarSheet = await Assets.load('/assets/eight-kings.json');

const engine = new SkatEngine();
const scene = new TableScene(app, cardSheet, avatarSheet, (action) => engine.dispatchPlayerAction(action));
const overlay = new PromptOverlay(document.getElementById('overlay-root'), (action) => engine.dispatchPlayerAction(action));
let latestSnapshot = null;

engine.subscribe((snapshot) => {
  latestSnapshot = snapshot;
  overlay.render(snapshot);
});

app.ticker.add(() => {
  if (!latestSnapshot) {
    return;
  }
  scene.render(latestSnapshot);
});

engine.startGame();
