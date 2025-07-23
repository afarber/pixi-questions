import { Container, Graphics, Texture, Sprite, Text } from "pixi.js";
import { Group, Easing, Tween } from "@tweenjs/tween.js";
import { UI_WIDTH, UI_HEIGHT, UI_RADIUS, UI_BACKGROUND, TITLE_TEXT_STYLE } from "./Theme";
import { MyButton } from "./MyButton";

export const dialogTweenGroup = new Group();

const ANIMATION_DURATION = 300;
const BACKGROUND_ALPHA = 0.8;
const BACKGROUND_COLOR = 0x000000;
const PANEL_WIDTH = UI_WIDTH * 2;
const PANEL_HEIGHT = UI_HEIGHT * 3;
const PANEL_PADDING = 20;
const BUTTON_SPACING = 20;

const QUESTION_MAP = {
  "___SWAP___": "___QUESTION_SWAP___",
  "___SKIP___": "___QUESTION_SKIP___",
  "___RESIGN___": "___QUESTION_RESIGN___",
  "___SHARE___": "___QUESTION_SHARE___",
  "___PLAY___": "___QUESTION_PLAY___"
};

export class MyDialog extends Container {
  constructor(app) {
    super();

    this.app = app;
    this.zIndex = 1000;

    this.darkOverlay = null;
    this.panelContainer = null;
    this.panelBackground = null;
    this.questionText = null;
    this.buttonsContainer = null;
    this.yesButton = null;
    this.noButton = null;
    this.activeTween = null;

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

    this.questionText = new Text({
      text: "___QUESTION_DEFAULT___",
      style: {
        ...TITLE_TEXT_STYLE,
        fontSize: 18,
        align: "center",
        wordWrap: true,
        wordWrapWidth: PANEL_WIDTH - PANEL_PADDING * 2
      }
    });
    this.questionText.anchor.set(0.5, 0.5);
    this.questionText.y = -PANEL_HEIGHT / 4;

    this.buttonsContainer = new Container();
    this.buttonsContainer.y = PANEL_HEIGHT / 4;

    this.yesButton = new MyButton({ text: "___YES___" });
    this.noButton = new MyButton({ text: "___NO___" });

    this.yesButton.x = -UI_WIDTH / 2 - BUTTON_SPACING / 2;
    this.noButton.x = UI_WIDTH / 2 + BUTTON_SPACING / 2;

    this.buttonsContainer.addChild(this.yesButton);
    this.buttonsContainer.addChild(this.noButton);

    this.panelContainer.addChild(this.panelBackground);
    this.panelContainer.addChild(this.questionText);
    this.panelContainer.addChild(this.buttonsContainer);
    this.addChild(this.panelContainer);
  }

  #updateQuestion(questionKey) {
    const questionText = QUESTION_MAP[questionKey] || "___QUESTION_DEFAULT___";
    this.questionText.text = questionText;
  }

  #setupCallbacks(onYes, onNo) {
    this.yesButton.onPress.disconnectAll();
    this.noButton.onPress.disconnectAll();

    this.yesButton.onPress.connect(() => {
      if (onYes) onYes();
      this.hide();
    });

    this.noButton.onPress.connect(() => {
      if (onNo) onNo();
      this.hide();
    });
  }

  show(questionKey, onYes = null, onNo = null) {
    this.#updateQuestion(questionKey);
    this.#setupCallbacks(onYes, onNo);
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

    this.activeTween = new Tween(this.darkOverlay, dialogTweenGroup)
      .to({ alpha: BACKGROUND_ALPHA }, ANIMATION_DURATION * 0.67)
      .easing(Easing.Linear.None)
      .start();

    const panelTween = new Tween(this.panelContainer.pivot, dialogTweenGroup)
      .to({ y: 0 }, ANIMATION_DURATION)
      .easing(Easing.Back.Out)
      .start();
  }

  hide() {
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }

    // Hide buttons first
    this.yesButton.hide(true);
    this.noButton.hide(true);

    this.activeTween = new Tween(this.darkOverlay, dialogTweenGroup)
      .to({ alpha: 0 }, ANIMATION_DURATION * 0.67)
      .easing(Easing.Linear.None)
      .onComplete(() => {
        this.visible = false;
      })
      .start();

    const panelTween = new Tween(this.panelContainer.pivot, dialogTweenGroup)
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
}
