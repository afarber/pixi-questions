import { Graphics } from "pixi.js";
import { FancyButton } from "@pixi/ui";
import { Tween, Easing } from "@tweenjs/tween.js";

export const MY_BUTTON_WIDTH = 200;
export const MY_BUTTON_HEIGHT = 60;
export const MY_BUTTON_RADIUS = 20;

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
        .fill({ color: "LightGray" }),
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
  }
}

// TODO maybe recreate defaultView, hoverView, pressedView and disabledView
// when resizing the button, to have sharper graphics
