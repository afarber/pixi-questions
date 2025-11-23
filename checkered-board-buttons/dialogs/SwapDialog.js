/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Graphics, Text } from 'pixi.js';
import { Group } from '@tweenjs/tween.js';
import { UI_WIDTH, UI_HEIGHT, UI_RADIUS, UI_BACKGROUND, TITLE_TEXT_STYLE } from '../Theme.js';
import { Button } from '../components/Button.js';
import { Checkbox } from '../components/Checkbox.js';
import { BaseDialog } from './BaseDialog.js';

export const swapDialogTweenGroup = new Group();

const PANEL_WIDTH = UI_WIDTH * 2;
const PANEL_HEIGHT = UI_HEIGHT * 8;
const PANEL_PADDING = 20;
const BUTTON_SPACING = 20;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class SwapDialog extends BaseDialog {
  constructor(app) {
    super(app, swapDialogTweenGroup);
    this.checkboxes = [];
    this.randomLetters = [];
    this._setupPanel();
  }

  _setupPanel() {
    this.panelContainer = new Container();
    this.panelContainer.pivot.set(0, 0);
    this.panelContainer.eventMode = 'static';

    // Prevent clicks on panel from bubbling to background
    this.panelContainer.on('pointerdown', (event) => {
      event.stopPropagation();
    });

    const panelBackground = new Graphics()
      .roundRect(-PANEL_WIDTH / 2, -PANEL_HEIGHT / 2, PANEL_WIDTH, PANEL_HEIGHT, UI_RADIUS)
      .fill({ color: UI_BACKGROUND });

    this.questionText = new Text({
      text: '',
      style: {
        ...TITLE_TEXT_STYLE,
        fontSize: 18,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: PANEL_WIDTH - PANEL_PADDING * 2
      }
    });
    this.questionText.anchor.set(0.5, 0.5);
    this.questionText.y = -PANEL_HEIGHT / 2 + PANEL_PADDING + 20;

    const checkboxesContainer = new Container();

    for (let i = 0; i < 7; i++) {
      const checkbox = new Checkbox({});
      checkbox.y = i * 50;
      checkboxesContainer.addChild(checkbox);
      this.checkboxes.push(checkbox);
    }

    checkboxesContainer.x = -PANEL_WIDTH / 2 + PANEL_PADDING;
    checkboxesContainer.y = this.questionText.y + this.questionText.height + PANEL_PADDING;

    const buttonsContainer = new Container();
    buttonsContainer.y = PANEL_HEIGHT / 2 - PANEL_PADDING - 20;

    this.yesButton = new Button({ text: '___SWAP___' });
    this.noButton = new Button({ text: '___CANCEL___' });

    this.yesButton.x = -UI_WIDTH / 2 - BUTTON_SPACING / 2;
    this.noButton.x = UI_WIDTH / 2 + BUTTON_SPACING / 2;

    buttonsContainer.addChild(this.yesButton);
    buttonsContainer.addChild(this.noButton);

    this.panelContainer.addChild(panelBackground);
    this.panelContainer.addChild(this.questionText);
    this.panelContainer.addChild(checkboxesContainer);
    this.panelContainer.addChild(buttonsContainer);
    this.addChild(this.panelContainer);
  }

  show(text, onYes = null, onNo = null) {
    this._generateRandomLetters();
    for (let i = 0; i < this.randomLetters.length; i++) {
      this.checkboxes[i].text = this.randomLetters[i];
      this.checkboxes[i].checked = false;
    }

    super.show(text, onYes, onNo);
  }

  _generateRandomLetters() {
    this.randomLetters.length = 0;
    for (let i = 0; i < 7; i++) {
      const randomIndex = Math.floor(Math.random() * LETTERS.length);
      this.randomLetters.push(LETTERS[randomIndex]);
    }
  }
}
