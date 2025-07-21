import { Container, Graphics, Text } from "pixi.js";
import { MyButton } from "./MyButton";
import { Easing, Tween } from "@tweenjs/tween.js";

const DRAWER_ANIMATION_DURATION = 300;
const OVERLAY_ALPHA = 0.5;

export class MyDrawer extends Container {
  constructor(app, width, height) {
    super();

    this.app = app;
    this.screenWidth = width;
    this.screenHeight = height;
    this.isVisible = false;
    this.currentQuestion = "";
    this.onYesCallback = null;
    this.onNoCallback = null;

    this.#createComponents();
    this.#setupInteractivity();

    this.visible = false;
  }

  #createComponents() {
    // Create overlay background
    this.overlay = new Graphics()
      .rect(0, 0, this.screenWidth, this.screenHeight)
      .fill({ color: 0x000000, alpha: OVERLAY_ALPHA });
    
    this.overlay.eventMode = "static";
    this.overlay.on("pointerdown", () => this.hide());
    this.addChild(this.overlay);

    // Create drawer container
    const drawerHeight = 300;
    const drawerPadding = 40;
    
    this.drawerContainer = new Graphics()
      .roundRect(0, 0, this.screenWidth, drawerHeight, 20)
      .fill({ color: 0xffffff });
    
    this.drawerContainer.y = this.screenHeight;
    this.addChild(this.drawerContainer);

    // Create question text
    this.questionText = new Text({
      text: "",
      style: {
        fontSize: 32,
        fill: 0x000000,
        fontWeight: "bold",
        align: "center",
        wordWrap: true,
        wordWrapWidth: this.screenWidth - drawerPadding * 2
      }
    });
    this.questionText.anchor.set(0.5, 0);
    this.questionText.x = this.screenWidth / 2;
    this.questionText.y = drawerPadding;
    this.drawerContainer.addChild(this.questionText);

    // Create YES button
    this.yesButton = new MyButton({ 
      text: "___YES___",
      width: 200,
      height: 60
    });
    this.yesButton.x = this.screenWidth / 2;
    this.yesButton.y = drawerHeight / 2 + 20;
    this.yesButton.onPress.connect(() => this.#handleYes());
    this.drawerContainer.addChild(this.yesButton);

    // Create NO button
    this.noButton = new MyButton({ 
      text: "___NO___",
      width: 200,
      height: 60
    });
    this.noButton.x = this.screenWidth / 2;
    this.noButton.y = drawerHeight / 2 + 100;
    this.noButton.onPress.connect(() => this.#handleNo());
    this.drawerContainer.addChild(this.noButton);
  }

  #setupInteractivity() {
    this.eventMode = "static";
  }

  #handleYes() {
    if (this.onYesCallback) {
      this.onYesCallback();
    }
    this.hide();
  }

  #handleNo() {
    if (this.onNoCallback) {
      this.onNoCallback();
    }
    this.hide();
  }

  show(questionKey, onYes = null, onNo = null) {
    if (this.isVisible) return;

    this.currentQuestion = `Do you want to ${questionKey}?`;
    this.onYesCallback = onYes;
    this.onNoCallback = onNo;

    this.questionText.text = this.currentQuestion;
    this.visible = true;
    this.isVisible = true;

    // Animate drawer sliding up
    new Tween(this.drawerContainer)
      .to({ y: this.screenHeight - 300 }, DRAWER_ANIMATION_DURATION)
      .easing(Easing.Cubic.Out)
      .start();

    // Fade in overlay
    this.overlay.alpha = 0;
    new Tween(this.overlay)
      .to({ alpha: OVERLAY_ALPHA }, DRAWER_ANIMATION_DURATION)
      .easing(Easing.Cubic.Out)
      .start();
  }

  hide() {
    if (!this.isVisible) return;

    this.isVisible = false;

    // Animate drawer sliding down
    new Tween(this.drawerContainer)
      .to({ y: this.screenHeight }, DRAWER_ANIMATION_DURATION)
      .easing(Easing.Cubic.In)
      .start();

    // Fade out overlay
    new Tween(this.overlay)
      .to({ alpha: 0 }, DRAWER_ANIMATION_DURATION)
      .easing(Easing.Cubic.In)
      .onComplete(() => {
        this.visible = false;
      })
      .start();
  }

  resize(width, height) {
    this.screenWidth = width;
    this.screenHeight = height;

    // Update overlay size
    this.overlay.clear()
      .rect(0, 0, width, height)
      .fill({ color: 0x000000, alpha: OVERLAY_ALPHA });

    // Update drawer container
    this.drawerContainer.clear()
      .roundRect(0, 0, width, 300, 20)
      .fill({ color: 0xffffff });

    // Reposition elements
    this.questionText.x = width / 2;
    this.questionText.style.wordWrapWidth = width - 80;
    
    this.yesButton.x = width / 2;
    this.noButton.x = width / 2;

    // Reset position if hidden
    if (!this.isVisible) {
      this.drawerContainer.y = height;
    }
  }
}