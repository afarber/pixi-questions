import { Container, Graphics, Texture, Sprite } from "pixi.js";
import { Easing, Tween, Group } from "@tweenjs/tween.js";

export const dialogTweenGroup = new Group();

const ANIMATION_DURATION = 300;
const BACKGROUND_ALPHA = 0.8;
const BACKGROUND_COLOR = 0x000000;

export class MyDialog extends Container {
  constructor(app, screenWidth, screenHeight) {
    super();
    
    this.app = app;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    this.bg = null;
    this.panel = null;
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
    this.addChild(this.panel);
  }

  show() {
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