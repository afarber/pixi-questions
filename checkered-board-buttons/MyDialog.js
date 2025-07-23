import { Container, Graphics, Texture, Sprite, Text } from "pixi.js";
import { Easing, Tween, Group } from "@tweenjs/tween.js";
import {
  UI_WIDTH,
  UI_HEIGHT,
  UI_RADIUS,
  UI_BACKGROUND,
  TITLE_TEXT_STYLE
} from "./Theme";

export const dialogTweenGroup = new Group();

const ANIMATION_DURATION = 300;
const BACKGROUND_ALPHA = 0.8;
const BACKGROUND_COLOR = 0x000000;
const PANEL_WIDTH = UI_WIDTH * 2;
const PANEL_HEIGHT = UI_HEIGHT * 3;
const PANEL_PADDING = 20;

const QUESTION_MAP = {
  "___SWAP___": "___QUESTION_SWAP___",
  "___SKIP___": "___QUESTION_SKIP___",
  "___RESIGN___": "___QUESTION_RESIGN___",
  "___SHARE___": "___QUESTION_SHARE___",
  "___PLAY___": "___QUESTION_PLAY___"
};

export class MyDialog extends Container {
  constructor(app, screenWidth, screenHeight) {
    super();
    
    this.app = app;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    this.bg = null;
    this.panel = null;
    this.panelBackground = null;
    this.questionText = null;
    this.buttonsContainer = null;
    this.activeTween = null;
    
    this.visible = false;
    this.#setupBackground();
    this.#setupPanel();
  }

  #setupBackground() {
    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = BACKGROUND_COLOR;
    this.bg.alpha = 0;
    this.bg.eventMode = 'static';
    this.bg.cursor = 'default';
    this.addChild(this.bg);
  }

  #setupPanel() {
    this.panel = new Container();
    this.panel.pivot.set(0, 0);
    
    this.panelBackground = new Graphics()
      .roundRect(-PANEL_WIDTH / 2, -PANEL_HEIGHT / 2, PANEL_WIDTH, PANEL_HEIGHT, UI_RADIUS)
      .fill({ color: UI_BACKGROUND });
    
    this.questionText = new Text({
      text: "___QUESTION_SWAP___",
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
    
    this.buttonsContainer = new Container();
    this.buttonsContainer.y = PANEL_HEIGHT / 4;
    
    this.panel.addChild(this.panelBackground);
    this.panel.addChild(this.questionText);
    this.panel.addChild(this.buttonsContainer);
    this.addChild(this.panel);
  }

  #updateQuestion(questionKey) {
    const questionText = QUESTION_MAP[questionKey] || "___QUESTION_SWAP___";
    this.questionText.text = questionText;
  }

  show(questionKey, onYes = null, onNo = null) {
    this.#updateQuestion(questionKey);
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }

    this.visible = true;
    this.resize(this.screenWidth, this.screenHeight);
    
    this.bg.alpha = 0;
    this.panel.pivot.y = -400;

    this.activeTween = new Tween(this.bg, dialogTweenGroup)
      .to({ alpha: BACKGROUND_ALPHA }, ANIMATION_DURATION * 0.67)
      .easing(Easing.Linear.None)
      .start();

    new Tween(this.panel.pivot, dialogTweenGroup)
      .to({ y: 0 }, ANIMATION_DURATION)
      .easing(Easing.Back.Out)
      .start();
  }

  hide() {
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }

    this.activeTween = new Tween(this.bg, dialogTweenGroup)
      .to({ alpha: 0 }, ANIMATION_DURATION * 0.67)
      .easing(Easing.Linear.None)
      .onComplete(() => {
        this.visible = false;
      })
      .start();

    new Tween(this.panel.pivot, dialogTweenGroup)
      .to({ y: -500 }, ANIMATION_DURATION)
      .easing(Easing.Back.In)
      .start();
  }

  resize(width, height) {
    this.screenWidth = width;
    this.screenHeight = height;
    
    this.bg.width = width;
    this.bg.height = height;
    
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }
}