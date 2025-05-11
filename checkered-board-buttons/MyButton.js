import { Graphics } from "pixi.js";
import { FancyButton } from "@pixi/ui";
import { Group, Easing, Tween } from "@tweenjs/tween.js";

// Create a shared tween group for all buttons
export const buttonsTweenGroup = new Group();

export const MY_BUTTON_WIDTH = 200;
export const MY_BUTTON_HEIGHT = 60;
export const MY_BUTTON_RADIUS = 20;

// duration of the show/hide animation in milliseconds
const HIDE_SHOW_DURATION = 200;

const DEFAULT_OPTIONS = {
  text: "",
  width: MY_BUTTON_WIDTH,
  height: MY_BUTTON_HEIGHT,
  radius: MY_BUTTON_RADIUS
};

export class MyButton extends FancyButton {
  constructor(args) {
    const options = {
      ...DEFAULT_OPTIONS,
      ...args
    };

    super({
      defaultView: new Graphics()
        .roundRect(0, 0, options.width, options.height, options.radius)
        .fill({ color: "SkyBlue" }),
      hoverView: new Graphics()
        .roundRect(0, 0, options.width, options.height, options.radius)
        .fill({ color: "LightBlue" }),
      pressedView: new Graphics()
        .roundRect(0, 0, options.width, options.height, options.radius)
        .fill({ color: "LightCoral" }),
      disabledView: new Graphics()
        .roundRect(0, 0, options.width, options.height, options.radius)
        .fill({ color: "DarkGray" }),
      width: options.width,
      height: options.height,
      anchor: 0.5,
      text: options.text,
      animations: {
        hover: {
          props: {
            scale: {
              x: 1.05,
              y: 1.05
            }
          },
          duration: 100
        },
        pressed: {
          props: {
            scale: {
              x: 0.95,
              y: 0.95
            }
          },
          duration: 100
        }
      }
    });

    this.activeTween = null;

    this.onHover.connect(this.handleHover.bind(this));
    this.onDown.connect(this.handleDown.bind(this));
    this.onUp.connect(this.handleUp.bind(this));
    this.on("pointerupoutside", this.handleUp.bind(this));
    this.on("pointerout", this.handleUp.bind(this));
  }

  handleHover() {
    //sfx.play("common/sfx-hover.wav");
  }

  handleDown() {
    //sfx.play("common/sfx-press.wav");
  }

  handleUp() {}

  show(animated = true, delay = 0) {
    // Cancel any running tween on this object
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }

    this.visible = true;

    if (!animated) {
      this.scale.set(1, 1);
      return;
    }

    this.scale.set(0, 0);

    this.activeTween = new Tween(this.scale, buttonsTweenGroup)
      .delay(delay)
      .to({ x: 1, y: 1 }, HIDE_SHOW_DURATION)
      .easing(Easing.Back.Out)
      .start();
  }

  hide(animated = true) {
    // Cancel any running tween on this object
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }

    if (!animated) {
      this.scale.set(0, 0);
      this.visible = false;
      return;
    }

    this.activeTween = new Tween(this.scale, buttonsTweenGroup)
      .to({ x: 0, y: 0 }, HIDE_SHOW_DURATION)
      .easing(Easing.Back.In)
      .onComplete(() => {
        this.visible = false;
      })
      .start();
  }
}

// TODO maybe recreate defaultView, hoverView, pressedView, disabledView
// when resizing the button, to have sharper graphics
