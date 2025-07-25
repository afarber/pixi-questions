import { Container, Graphics, Texture, Sprite, Text } from "pixi.js";
import { Group, Easing, Tween } from "@tweenjs/tween.js";
import { UI_WIDTH, UI_HEIGHT, UI_RADIUS, UI_BACKGROUND, TITLE_TEXT_STYLE } from "../Theme.js";
import { MyButton } from "../MyButton.js";

export const dialogTweenGroup = new Group();

const ANIMATION_DURATION = 300;
const BACKGROUND_ALPHA = 0.8;
const BACKGROUND_COLOR = 0x000000;
const PANEL_WIDTH = UI_WIDTH * 2.5;
const PANEL_HEIGHT = UI_HEIGHT * 4;
const PANEL_PADDING = 20;
const BUTTON_SPACING = 20;
const CHECKBOX_SIZE = 20;
const CHECKBOX_SPACING = 10;
const LETTER_SPACING = 40;

export class MySwapDialog extends Container {
  constructor(app) {
    super();

    this.app = app;
    this.zIndex = 1000;

    this.darkOverlay = null;
    this.panelContainer = null;
    this.panelBackground = null;
    this.titleText = null;
    this.instructionText = null;
    this.checkboxContainer = null;
    this.buttonsContainer = null;
    this.swapButton = null;
    this.cancelButton = null;
    this.activeTween = null;
    this.keydownHandler = null;

    this.randomLetters = [];
    this.checkboxes = [];
    this.selectedLetters = new Set();

    this.visible = false;
    this.#setupBackground();
    this.#setupPanel();
  }

  #setupBackground() {
    this.darkOverlay = new Sprite(Texture.WHITE);
    this.darkOverlay.tint = BACKGROUND_COLOR;
    this.darkOverlay.alpha = 0;
    this.darkOverlay.eventMode = "static";
    this.darkOverlay.cursor = "default";

    // Add click handler to background to close dialog on outside click
    this.darkOverlay.on("pointerdown", () => {
      this.hide();
    });

    this.addChild(this.darkOverlay);
  }

  #setupPanel() {
    this.panelContainer = new Container();
    this.panelContainer.pivot.set(0, 0);
    this.panelContainer.eventMode = "static";

    // Prevent clicks on panel from bubbling to background
    this.panelContainer.on("pointerdown", (event) => {
      event.stopPropagation();
    });

    this.panelBackground = new Graphics()
      .roundRect(-PANEL_WIDTH / 2, -PANEL_HEIGHT / 2, PANEL_WIDTH, PANEL_HEIGHT, UI_RADIUS)
      .fill({ color: UI_BACKGROUND });

    this.titleText = new Text({
      text: "___SWAP___",
      style: {
        ...TITLE_TEXT_STYLE,
        fontSize: 24,
        align: "center"
      }
    });
    this.titleText.anchor.set(0.5, 0.5);
    this.titleText.y = -PANEL_HEIGHT / 2 + 40;

    this.instructionText = new Text({
      text: "___QUESTION_SWAP___",
      style: {
        ...TITLE_TEXT_STYLE,
        fontSize: 16,
        align: "center",
        wordWrap: true,
        wordWrapWidth: PANEL_WIDTH - PANEL_PADDING * 2
      }
    });
    this.instructionText.anchor.set(0.5, 0.5);
    this.instructionText.y = -PANEL_HEIGHT / 2 + 90;

    this.checkboxContainer = new Container();
    this.checkboxContainer.y = -50;

    this.buttonsContainer = new Container();
    this.buttonsContainer.y = PANEL_HEIGHT / 2 - 60;

    this.swapButton = new MyButton({ text: "___SWAP___" });
    this.cancelButton = new MyButton({ text: "___CANCEL___" });

    this.swapButton.x = -UI_WIDTH / 2 - BUTTON_SPACING / 2;
    this.cancelButton.x = UI_WIDTH / 2 + BUTTON_SPACING / 2;

    this.buttonsContainer.addChild(this.swapButton);
    this.buttonsContainer.addChild(this.cancelButton);

    this.panelContainer.addChild(this.panelBackground);
    this.panelContainer.addChild(this.titleText);
    this.panelContainer.addChild(this.instructionText);
    this.panelContainer.addChild(this.checkboxContainer);
    this.panelContainer.addChild(this.buttonsContainer);
    this.addChild(this.panelContainer);
  }

  #generateRandomLetters() {
    // Check if LETTERS global array is available
    if (typeof LETTERS === 'undefined' || !Array.isArray(LETTERS)) {
      console.warn('LETTERS array not available, using fallback letters');
      this.randomLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      return;
    }

    this.randomLetters = [];
    for (let i = 0; i < 7; i++) {
      const randomIndex = Math.floor(Math.random() * LETTERS.length);
      this.randomLetters.push(LETTERS[randomIndex]);
    }
  }

  #createCheckboxes() {
    // Clear existing checkboxes
    this.checkboxContainer.removeChildren();
    this.checkboxes = [];
    this.selectedLetters.clear();

    const startY = -80;
    
    this.randomLetters.forEach((letter, index) => {
      const checkboxItem = new Container();
      checkboxItem.y = startY + index * LETTER_SPACING;

      // Checkbox background
      const checkboxBg = new Graphics()
        .roundRect(-CHECKBOX_SIZE / 2, -CHECKBOX_SIZE / 2, CHECKBOX_SIZE, CHECKBOX_SIZE, 3)
        .stroke({ color: 0x666666, width: 2 })
        .fill({ color: 0xffffff });

      // Checkmark (initially hidden)
      const checkmark = new Graphics()
        .moveTo(-6, -2)
        .lineTo(-2, 2)
        .lineTo(6, -6)
        .stroke({ color: 0x0066cc, width: 3 });
      checkmark.visible = false;

      // Letter text
      const letterText = new Text({
        text: letter,
        style: {
          ...TITLE_TEXT_STYLE,
          fontSize: 20,
          align: "left"
        }
      });
      letterText.anchor.set(0, 0.5);
      letterText.x = CHECKBOX_SIZE / 2 + CHECKBOX_SPACING;

      // Make checkbox interactive
      checkboxItem.eventMode = "static";
      checkboxItem.cursor = "pointer";

      checkboxItem.on("pointerdown", () => {
        const isSelected = this.selectedLetters.has(index);
        if (isSelected) {
          this.selectedLetters.delete(index);
          checkmark.visible = false;
        } else {
          this.selectedLetters.add(index);
          checkmark.visible = true;
        }
      });

      checkboxItem.addChild(checkboxBg);
      checkboxItem.addChild(checkmark);
      checkboxItem.addChild(letterText);

      this.checkboxContainer.addChild(checkboxItem);
      this.checkboxes.push({ checkboxItem, checkmark, letter, index });
    });
  }

  #setupCallbacks(onSwap, onCancel) {
    this.swapButton.onPress.disconnectAll();
    this.cancelButton.onPress.disconnectAll();

    this.swapButton.onPress.connect(() => {
      if (onSwap) {
        // Get selected letters in order and concatenate them
        const selectedLetterArray = Array.from(this.selectedLetters)
          .sort((a, b) => a - b)
          .map(index => this.randomLetters[index]);
        const selectedString = selectedLetterArray.join('');
        console.log('Selected letters:', selectedString);
        onSwap(selectedString);
      }
      this.hide();
    });

    this.cancelButton.onPress.connect(() => {
      if (onCancel) onCancel();
      this.hide();
    });
  }

  show(onSwap = null, onCancel = null) {
    this.#generateRandomLetters();
    this.#createCheckboxes();
    this.#setupCallbacks(onSwap, onCancel);
    this.#setupKeyHandler();
    
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
    this.swapButton.show(true, 100);
    this.cancelButton.show(true, 200);

    this.activeTween = new Tween(this.darkOverlay, dialogTweenGroup)
      .to({ alpha: BACKGROUND_ALPHA }, ANIMATION_DURATION * 0.67)
      .easing(Easing.Linear.None)
      .start();

    new Tween(this.panelContainer.pivot, dialogTweenGroup)
      .to({ y: 0 }, ANIMATION_DURATION)
      .easing(Easing.Back.Out)
      .start();
  }

  hide() {
    this.#removeKeyHandler();
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }

    // Hide buttons first
    this.swapButton.hide(true);
    this.cancelButton.hide(true);

    this.activeTween = new Tween(this.darkOverlay, dialogTweenGroup)
      .to({ alpha: 0 }, ANIMATION_DURATION * 0.67)
      .easing(Easing.Linear.None)
      .onComplete(() => {
        this.visible = false;
      })
      .start();

    new Tween(this.panelContainer.pivot, dialogTweenGroup)
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

  #setupKeyHandler() {
    this.keydownHandler = (event) => {
      if (event.key === "Escape") {
        // Close dialog (acts like clicking Cancel button)
        this.hide();
      }
    };

    document.addEventListener("keydown", this.keydownHandler, true);
  }

  #removeKeyHandler() {
    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler, true);
      this.keydownHandler = null;
    }
  }
}