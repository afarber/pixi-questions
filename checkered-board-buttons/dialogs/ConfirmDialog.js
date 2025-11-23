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
import { BaseDialog } from './BaseDialog.js';

export const confirmDialogTweenGroup = new Group();

const PANEL_WIDTH = UI_WIDTH * 2;
const PANEL_HEIGHT = UI_HEIGHT * 3;
const PANEL_PADDING = 20;
const BUTTON_SPACING = 20;

/**
 * A simple confirmation dialog with Yes/No buttons.
 * Displays a question text and calls the appropriate callback based on user choice.
 */
export class ConfirmDialog extends BaseDialog {
  constructor(app) {
    super(app, confirmDialogTweenGroup);
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
    this.questionText.y = -PANEL_HEIGHT / 4;

    const buttonsContainer = new Container();
    buttonsContainer.y = PANEL_HEIGHT / 4;

    this.yesButton = new Button({ text: '___YES___' });
    this.noButton = new Button({ text: '___NO___' });

    this.yesButton.x = -UI_WIDTH / 2 - BUTTON_SPACING / 2;
    this.noButton.x = UI_WIDTH / 2 + BUTTON_SPACING / 2;

    buttonsContainer.addChild(this.yesButton);
    buttonsContainer.addChild(this.noButton);

    this.panelContainer.addChild(panelBackground);
    this.panelContainer.addChild(this.questionText);
    this.panelContainer.addChild(buttonsContainer);
    this.addChild(this.panelContainer);
  }
}
