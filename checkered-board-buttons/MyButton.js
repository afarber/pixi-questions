import { Graphics } from "pixi.js";
import { FancyButton } from "@pixi/ui";
import { sound } from "@pixi/sound";
import { Group, Easing, Tween } from "@tweenjs/tween.js";
import {
  UI_HEIGHT,
  UI_WIDTH,
  UI_RADIUS,
  UI_BACKGROUND_DEFAULT,
  UI_BACKGROUND_HOVER,
  UI_BACKGROUND_PRESSED,
  UI_BACKGROUND_DISABLED
} from "./Theme";

// Create a shared tween group for all buttons
export const buttonsTweenGroup = new Group();

// duration of the show/hide animation in milliseconds
const HIDE_SHOW_DURATION = 200;

const DEFAULT_OPTIONS = {
  text: "",
  width: UI_WIDTH,
  height: UI_HEIGHT,
  radius: UI_RADIUS
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
        .fill({ color: UI_BACKGROUND_DEFAULT }),
      hoverView: new Graphics()
        .roundRect(0, 0, options.width, options.height, options.radius)
        .fill({ color: UI_BACKGROUND_HOVER }),
      pressedView: new Graphics()
        .roundRect(0, 0, options.width, options.height, options.radius)
        .fill({ color: UI_BACKGROUND_PRESSED }),
      disabledView: new Graphics()
        .roundRect(0, 0, options.width, options.height, options.radius)
        .fill({ color: UI_BACKGROUND_DISABLED }),
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
    //sound.play("click_005");
  }

  handleDown() {
    sound.play("click_002");
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

  // for clearer graphics, recreate the views instead of scaling them
  resize(w, h, r) {
    this.defaultView = new Graphics()
      .roundRect(0, 0, w, h, r)
      .fill({ color: UI_BACKGROUND_DEFAULT });
    this.hoverView = new Graphics()
      .roundRect(0, 0, w, h, r)
      .fill({ color: UI_BACKGROUND_HOVER });
    this.pressedView = new Graphics()
      .roundRect(0, 0, w, h, r)
      .fill({ color: UI_BACKGROUND_PRESSED });
    this.disabledView = new Graphics()
      .roundRect(0, 0, w, h, r)
      .fill({ color: UI_BACKGROUND_DISABLED });

    // workaround for buttons losing disabled appearance
    this.enabled = !this.enabled;
    this.enabled = !this.enabled;
  }
}
