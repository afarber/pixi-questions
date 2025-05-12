import { Application, Assets, Sprite, Text } from "pixi.js";
import { Board, NUM_CELLS } from "./Board";
import { Tile, TILE_SIZE } from "./Tile";
import { MyButton, buttonsTweenGroup } from "./MyButton";
import { MyList } from "./MyList";
import { UI_WIDTH, UI_PADDING, UI_BACKGROUND, UI_HEIGHT } from "./Theme";
import { games } from "./TestData";

const RIGHT_BUTTONS_NUM = 10;
const rightButtons = [];

// TODO: add a component to display player avatar in sprite, etc
// TODO: below such 2 components, add a "Bookmark" text
// TODO: add "total" (top) and "hint" (bottom) texts

(async () => {
  const app = new Application();
  await app.init({ background: "LightSalmon", resizeTo: window, hello: true });

  // append the app canvas to the document body
  document.body.appendChild(app.canvas);

  // the app stage will handle the move events
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  await Assets.init({ manifest: "./manifest.json" });
  await Assets.loadBundle("animals");

  const boardContainer = new Board();
  app.stage.addChild(boardContainer);

  // create 3 interactive, draggable Tiles with initial off-screen position
  const r = new Tile("Red", 3, 3, -30, app.stage);
  const g = new Tile("Green", 4, 3, 0, app.stage);
  const b = new Tile("Blue", 5, 3, 80, app.stage);
  // create a static, non-draggable Tile
  const c = new Tile("Cyan", 7, 0, 5);

  boardContainer.addChild(r);
  boardContainer.addChild(g);
  boardContainer.addChild(b);
  boardContainer.addChild(c);

  const bunny = await createBunny("bunny");
  boardContainer.addChild(bunny);

  const label = createLabel();
  boardContainer.addChild(label);

  const newGameButton = new MyButton({ text: "__NEW_GAME__" });
  app.stage.addChild(newGameButton);

  const gamesList = new MyList();
  app.stage.addChild(gamesList);

  const twoLettersButton = new MyButton({ text: "__TWO_LETTERS__" });
  app.stage.addChild(twoLettersButton);
  const threeLettersButton = new MyButton({ text: "__THREE_LETTERS__" });
  app.stage.addChild(threeLettersButton);
  const rareOneButton = new MyButton({ text: "__RARE_LETTER_1__" });
  app.stage.addChild(rareOneButton);
  const rareTwoButton = new MyButton({ text: "__RARE_LETTER_2__" });
  app.stage.addChild(rareTwoButton);

  gamesList.setGames(games);

  for (let i = 0; i < RIGHT_BUTTONS_NUM; i++) {
    const button = new MyButton({
      text: `Button ${i + 1}`
    });

    button.onPress.connect(() => console.log(`Button ${i + 1} pressed!`));
    button.enabled = i % 4 !== 1;
    app.stage.addChild(button);
    rightButtons.push(button);
  }

  app.ticker.add((time) => {
    buttonsTweenGroup.update();

    bunny.rotation += 0.05 * time.deltaTime;
    label.skew.x += 0.02 * time.deltaTime;
    label.skew.y += 0.01 * time.deltaTime;
  });

  const onResize = () => {
    boardContainer.resize(
      app.screen.width - 2 * UI_WIDTH - 8 * UI_PADDING,
      app.screen.height
    );

    const verticalButtonPadding =
      (app.screen.height - 2 * UI_PADDING - RIGHT_BUTTONS_NUM * UI_HEIGHT) /
      (RIGHT_BUTTONS_NUM - 1);

    for (let i = 0; i < rightButtons.length; i++) {
      const button = rightButtons[i];
      button.x = app.screen.width - UI_WIDTH / 2 - 2 * UI_PADDING;
      button.y =
        UI_PADDING + UI_HEIGHT / 2 + (UI_HEIGHT + verticalButtonPadding) * i;
      button.hide(false);
      button.show(true, 50);
    }

    newGameButton.x = 2 * UI_PADDING + UI_WIDTH / 2;
    newGameButton.y = UI_PADDING + UI_HEIGHT / 2;
    newGameButton.hide(false);
    newGameButton.show(true, 50);

    gamesList.x = UI_PADDING;
    gamesList.y = newGameButton.y + UI_HEIGHT / 2 + verticalButtonPadding;
    gamesList.height =
      app.screen.height -
      2 * UI_PADDING -
      5 * UI_HEIGHT -
      5 * verticalButtonPadding;

    twoLettersButton.x = 2 * UI_PADDING + UI_WIDTH / 2;
    twoLettersButton.y =
      app.screen.height -
      (7 * UI_HEIGHT) / 2 -
      3 * verticalButtonPadding -
      UI_PADDING;
    twoLettersButton.hide(false);
    twoLettersButton.show(true, 50);

    threeLettersButton.x = 2 * UI_PADDING + UI_WIDTH / 2;
    threeLettersButton.y =
      app.screen.height -
      (5 * UI_HEIGHT) / 2 -
      2 * verticalButtonPadding -
      UI_PADDING;
    threeLettersButton.hide(false);
    threeLettersButton.show(true, 50);

    rareOneButton.x = 2 * UI_PADDING + UI_WIDTH / 2;
    rareOneButton.y =
      app.screen.height -
      (3 * UI_HEIGHT) / 2 -
      verticalButtonPadding -
      UI_PADDING;
    rareOneButton.hide(false);
    rareOneButton.show(true, 50);

    rareTwoButton.x = 2 * UI_PADDING + UI_WIDTH / 2;
    rareTwoButton.y = app.screen.height - UI_HEIGHT / 2 - UI_PADDING;
    rareTwoButton.hide(false);
    rareTwoButton.show(true, 50);
  };

  addEventListener("resize", onResize);
  onResize();
})();

async function createBunny(textureAlias) {
  const bunny = Sprite.from(textureAlias);
  bunny.anchor.set(0.5);
  bunny.x = TILE_SIZE / 2;
  bunny.y = (NUM_CELLS - 0.5) * TILE_SIZE;
  return bunny;
}

function createLabel() {
  const label = new Text({ text: "__NO__" });
  label.x = (NUM_CELLS - 0.5) * TILE_SIZE;
  label.y = (NUM_CELLS - 0.5) * TILE_SIZE;
  label.anchor.set(0.5);
  return label;
}
