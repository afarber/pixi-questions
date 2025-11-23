/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Text } from 'pixi.js';
import { SectionedList } from './SectionedList';
import { Button } from './Button';
import { UI_HEIGHT, UI_WIDTH, UI_RADIUS, UI_PADDING, UI_BACKGROUND, TITLE_TEXT_STYLE } from '../Theme';

/**
 * Displays a list of games organized into sections (your turn, their turn, finished).
 * Each game is shown as a clickable button within a scrollable list.
 */
export class GamesList extends Container {
  constructor() {
    super();

    this.sectionedList = new SectionedList({
      background: UI_BACKGROUND,
      width: UI_WIDTH + 2 * UI_PADDING,
      height: 3.5 * UI_HEIGHT,
      radius: UI_RADIUS,
      elementsMargin: UI_PADDING,
      padding: UI_PADDING
    });
    this.addChild(this.sectionedList);
  }

  setGames(games) {
    this.sectionedList.removeItems();

    if (!Array.isArray(games) || games.length == 0) {
      const zeroGames = new Text({
        text: '___ZERO_GAMES___',
        style: TITLE_TEXT_STYLE
      });

      this.sectionedList.addItem(zeroGames);
      return;
    }

    const yourGames = [];
    const opponentGames = [];
    const finishedGames = [];

    for (const game of games) {
      const isFinished = game.finished > 0;
      if (isFinished) {
        finishedGames.push(game.id);
      } else {
        const myTurn = game.played1 <= game.played2;
        if (myTurn) {
          yourGames.push(game.id);
        } else {
          opponentGames.push(game.id);
        }
      }
    }

    this.createSection('___YOUR_TURN___', yourGames);
    this.createSection('___HIS_TURN___', opponentGames);
    this.createSection('___ARCHIVE___', finishedGames);
  }

  // Create a parent container for a button.
  // It is needed, because button anchor is set to 0.5
  // and thus the scroll box would be misplacing it.
  createParentContainer(gameId) {
    const parentContainer = new Container();
    parentContainer.width = UI_WIDTH;
    parentContainer.height = UI_HEIGHT;

    const button = new Button({
      text: `___GAME___ ${gameId}`
    });
    button.x = UI_WIDTH / 2;
    button.y = UI_HEIGHT / 2;
    parentContainer.addChild(button);

    button.onPress = () => console.log(`Game ${gameId} pressed!`);
    return parentContainer;
  }

  createSection(title, gameIds) {
    if (Array.isArray(gameIds) && gameIds.length > 0) {
      const sectionTitle = new Text({
        text: title,
        style: TITLE_TEXT_STYLE
      });

      this.sectionedList.addItem(sectionTitle);

      for (const gid of gameIds) {
        const parentContainer = this.createParentContainer(gid);
        this.sectionedList.addItem(parentContainer);
      }
    }
  }

  resize(x, y, w, h) {
    this.sectionedList.position.set(x, y);
    this.sectionedList.setSize({ width: w, height: h });
  }
}
