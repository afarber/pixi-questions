import { Container, Graphics } from "pixi.js";

// Default scrollbar styling
const DEFAULT_WIDTH = 6;
const DEFAULT_TRACK_COLOR = "LightGray";
const DEFAULT_THUMB_COLOR = "DarkGray";
const MIN_THUMB_HEIGHT = 20;

const DEFAULT_OPTIONS = {
  height: 100,
  width: DEFAULT_WIDTH,
  trackColor: DEFAULT_TRACK_COLOR,
  thumbColor: DEFAULT_THUMB_COLOR
};

export class ScrollBar extends Container {
  constructor(args) {
    super();

    const options = {
      ...DEFAULT_OPTIONS,
      ...args
    };

    this._height = options.height;
    this._width = options.width;
    this._trackColor = options.trackColor;
    this._thumbColor = options.thumbColor;

    // Scroll state
    this._scrollRatio = 0;
    this._thumbRatio = 1;
    this._isDragging = false;
    this._dragStartY = 0;
    this._dragStartRatio = 0;

    // Callback
    this.onScroll = null;

    // Create track
    this._track = new Graphics();
    this.addChild(this._track);

    // Create thumb
    this._thumb = new Graphics();
    this._thumb.eventMode = "static";
    this._thumb.cursor = "pointer";
    this.addChild(this._thumb);

    // Bind event handlers
    this._onThumbPointerDown = this._onThumbPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);

    this._thumb.on("pointerdown", this._onThumbPointerDown);

    // Initial render
    this._updateGraphics();
  }

  _onThumbPointerDown(e) {
    this._isDragging = true;
    this._dragStartY = e.global.y;
    this._dragStartRatio = this._scrollRatio;

    // Listen on stage for move/up events
    const stage = this._thumb.stage;
    if (stage) {
      stage.on("pointermove", this._onPointerMove);
      stage.on("pointerup", this._onPointerUp);
      stage.on("pointerupoutside", this._onPointerUp);
    }
  }

  _onPointerMove(e) {
    if (!this._isDragging) {
      return;
    }

    const deltaY = e.global.y - this._dragStartY;
    const trackHeight = this._height;
    const thumbHeight = this._getThumbHeight();
    const availableHeight = trackHeight - thumbHeight;

    if (availableHeight <= 0) {
      return;
    }

    // Calculate new scroll ratio
    const deltaRatio = deltaY / availableHeight;
    let newRatio = this._dragStartRatio + deltaRatio;

    // Clamp to 0-1
    newRatio = Math.max(0, Math.min(1, newRatio));

    this._scrollRatio = newRatio;
    this._updateThumbPosition();

    if (this.onScroll) {
      this.onScroll(this._scrollRatio);
    }
  }

  _onPointerUp() {
    this._isDragging = false;

    // Remove stage listeners
    const stage = this._thumb.stage;
    if (stage) {
      stage.off("pointermove", this._onPointerMove);
      stage.off("pointerup", this._onPointerUp);
      stage.off("pointerupoutside", this._onPointerUp);
    }
  }

  _getThumbHeight() {
    const height = this._height * this._thumbRatio;
    return Math.max(MIN_THUMB_HEIGHT, height);
  }

  _updateGraphics() {
    // Draw track
    this._track.clear();
    this._track
      .roundRect(0, 0, this._width, this._height, this._width / 2)
      .fill({ color: this._trackColor });

    // Draw thumb
    this._updateThumb();
  }

  _updateThumb() {
    const thumbHeight = this._getThumbHeight();

    this._thumb.clear();
    this._thumb
      .roundRect(0, 0, this._width, thumbHeight, this._width / 2)
      .fill({ color: this._thumbColor });

    this._updateThumbPosition();
  }

  _updateThumbPosition() {
    const thumbHeight = this._getThumbHeight();
    const availableHeight = this._height - thumbHeight;
    this._thumb.y = availableHeight * this._scrollRatio;
  }

  // Public methods

  setScrollRatio(ratio) {
    this._scrollRatio = Math.max(0, Math.min(1, ratio));
    this._updateThumbPosition();
  }

  setThumbRatio(ratio) {
    this._thumbRatio = Math.max(0, Math.min(1, ratio));
    this._updateThumb();
  }

  setHeight(height) {
    this._height = height;
    this._updateGraphics();
  }
}
