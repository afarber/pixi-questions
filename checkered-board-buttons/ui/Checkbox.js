import { Container, Graphics, Text } from "pixi.js";

// Default checkbox dimensions
const BOX_SIZE = 24;
const BOX_RADIUS = 4;
const BOX_COLOR = "White";
const CHECK_COLOR = "DarkGreen";
const CHECK_STROKE = 4;
const TEXT_OFFSET = 10;

const DEFAULT_OPTIONS = {
  text: "",
  boxSize: BOX_SIZE,
  boxRadius: BOX_RADIUS,
  boxColor: BOX_COLOR,
  checkColor: CHECK_COLOR
};

export class Checkbox extends Container {
  constructor(args) {
    super();

    const options = {
      ...DEFAULT_OPTIONS,
      ...args
    };

    this._boxSize = options.boxSize;
    this._boxRadius = options.boxRadius;
    this._boxColor = options.boxColor;
    this._checkColor = options.checkColor;
    this._checked = false;

    // Callback
    this.onToggle = null;

    // Create unchecked view (empty box)
    this._uncheckedView = new Graphics()
      .roundRect(0, 0, this._boxSize, this._boxSize, this._boxRadius)
      .fill({ color: this._boxColor });
    this.addChild(this._uncheckedView);

    // Create checked view (box with checkmark)
    this._checkedView = new Graphics()
      .roundRect(0, 0, this._boxSize, this._boxSize, this._boxRadius)
      .fill({ color: this._boxColor });

    // Draw checkmark
    const s = this._boxSize;
    this._checkedView
      .moveTo(s * 0.25, s * 0.5)
      .lineTo(s * 0.42, s * 0.67)
      .lineTo(s * 0.75, s * 0.33)
      .stroke({ width: CHECK_STROKE, color: this._checkColor });

    this._checkedView.visible = false;
    this.addChild(this._checkedView);

    // Create text label
    this._textView = new Text({
      text: options.text,
      style: {
        fontSize: 18,
        fill: 0x000000
      }
    });
    this._textView.x = this._boxSize + TEXT_OFFSET;
    this._textView.y = (this._boxSize - this._textView.height) / 2;
    this.addChild(this._textView);

    // Set up interactivity
    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointerdown", this._onPointerDown.bind(this));
  }

  _onPointerDown() {
    this._checked = !this._checked;
    this._updateViews();

    if (this.onToggle) {
      this.onToggle(this, this._checked);
    }
  }

  _updateViews() {
    this._uncheckedView.visible = !this._checked;
    this._checkedView.visible = this._checked;
  }

  // Public properties

  get checked() {
    return this._checked;
  }

  set checked(value) {
    if (this._checked === value) {
      return;
    }
    this._checked = value;
    this._updateViews();
  }

  get text() {
    return this._textView.text;
  }

  set text(value) {
    this._textView.text = value;
    // Recenter text vertically
    this._textView.y = (this._boxSize - this._textView.height) / 2;
  }
}
