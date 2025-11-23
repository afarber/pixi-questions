/*
 * Copyright (c) 2025 Alexander Farber
 * SPDX-License-Identifier: MIT
 *
 * This file is part of the pixi-questions project (https://github.com/afarber/pixi-questions)
 */

import { Container, Texture, Sprite } from 'pixi.js';
import { Easing, Tween } from '@tweenjs/tween.js';

export const ANIMATION_DURATION = 300;
export const BACKGROUND_ALPHA = 0.8;
export const BACKGROUND_COLOR = 0x000000;

/**
 * Base class for modal dialogs.
 *
 * Subclasses must implement _setupPanel() which should:
 * - Create this.panelContainer (Container with eventMode 'static')
 * - Create this.questionText (Text element for the dialog question)
 * - Create this.yesButton and this.noButton (Button instances)
 * - Add all elements to panelContainer, then add panelContainer to this
 */
export class BaseDialog extends Container {
  constructor(app, tweenGroup) {
    super();

    this.app = app;
    this._tweenGroup = tweenGroup;
    this.zIndex = 1000;

    this.darkOverlay = null;
    this.panelContainer = null;
    this.questionText = null;
    this.yesButton = null;
    this.noButton = null;
    this.activeTween = null;
    this.keydownHandler = null;

    this.visible = false;
    this._setupBackground();
  }

  _setupBackground() {
    this.darkOverlay = new Sprite(Texture.WHITE);
    this.darkOverlay.tint = BACKGROUND_COLOR;
    this.darkOverlay.alpha = 0;
    this.darkOverlay.eventMode = 'static';
    this.darkOverlay.cursor = 'default';

    // Add click handler to background to close dialog on outside click
    this.darkOverlay.on('pointerdown', () => {
      this.hide();
    });

    this.addChild(this.darkOverlay);
  }

  _updateQuestion(text) {
    this.questionText.text = text;
  }

  _setupCallbacks(onYes, onNo) {
    this.yesButton.onPress = () => {
      if (onYes) onYes();
      this.hide();
    };

    this.noButton.onPress = () => {
      if (onNo) onNo();
      this.hide();
    };
  }

  show(text, onYes = null, onNo = null) {
    this._updateQuestion(text);
    this._setupCallbacks(onYes, onNo);
    this._setupKeyHandler();

    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }

    this.visible = true;
    this.resize();

    this.darkOverlay.alpha = 0;
    // Set pivot.y to -400 to position panel above screen, then animate to 0 for slide-down effect
    this.panelContainer.pivot.y = -400;

    // Show buttons with slight delay for visual appeal
    this.yesButton.show(true, 100);
    this.noButton.show(true, 200);

    this.activeTween = new Tween(this.darkOverlay)
      .group(this._tweenGroup)
      .to({ alpha: BACKGROUND_ALPHA }, ANIMATION_DURATION * 0.67)
      .easing(Easing.Linear.None)
      .start();

    new Tween(this.panelContainer.pivot)
      .group(this._tweenGroup)
      .to({ y: 0 }, ANIMATION_DURATION)
      .easing(Easing.Back.Out)
      .start();
  }

  hide() {
    this._removeKeyHandler();

    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }

    // Hide buttons first
    this.yesButton.hide(true);
    this.noButton.hide(true);

    this.activeTween = new Tween(this.darkOverlay)
      .group(this._tweenGroup)
      .to({ alpha: 0 }, ANIMATION_DURATION * 0.67)
      .easing(Easing.Linear.None)
      .onComplete(() => {
        this.visible = false;
      })
      .start();

    new Tween(this.panelContainer.pivot)
      .group(this._tweenGroup)
      .to({ y: -500 }, ANIMATION_DURATION)
      .easing(Easing.Back.In)
      .start();
  }

  resize() {
    const width = this.app.screen.width;
    const height = this.app.screen.height;

    // Update dark tinted background to cover full screen
    this.darkOverlay.width = width;
    this.darkOverlay.height = height;

    // Keep panel centered
    this.panelContainer.x = width * 0.5;
    this.panelContainer.y = height * 0.5;
  }

  _setupKeyHandler() {
    this.keydownHandler = (event) => {
      if (event.key === 'Escape') {
        // Close dialog (acts like clicking NO button)
        this.hide();
      }
    };

    document.addEventListener('keydown', this.keydownHandler, true);
  }

  _removeKeyHandler() {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler, true);
      this.keydownHandler = null;
    }
  }
}
