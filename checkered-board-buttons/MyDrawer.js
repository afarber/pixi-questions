import { Container, Graphics, Text } from "pixi.js";
import { MyButton } from "./MyButton";
import { Easing, Tween } from "@tweenjs/tween.js";

export class MyDrawer extends Container {
  constructor(app, w, h) {
    super();
  }

  show(questionKey, onYes = null, onNo = null) {}

  hide() {}

  resize(w, h) {}
}
