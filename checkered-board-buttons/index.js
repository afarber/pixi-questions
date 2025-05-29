import { Application, Assets, Graphics, Sprite, Text } from "pixi.js";
import { Board, NUM_CELLS } from "./Board";
import { Tile, TILE_SIZE } from "./Tile";
import { MyButton, buttonsTweenGroup } from "./MyButton";
import { MyList } from "./MyList";
import { UI_PADDING, UI_WIDTH } from "./Theme";
import { games } from "./TestData";
import { MyVerticalPanel } from "./MyVerticalPanel";

const RIGHT_BUTTONS_NUM = 10;
const manifest = {
  "bundles": [
    {
      "name": "animals",
      "assets": [
        {
          "alias": "bunny",
          "src": "https://pixijs.com/assets/bunny.png"
        }
      ]
    },
    {
      "name": "sounds",
      "assets": [
        {
          "alias": "click_001",
          "src": "assets/click_001.ogg"
        },
        {
          "alias": "click_002",
          "src": "assets/click_002.ogg"
        },
        {
          "alias": "click_003",
          "src": "assets/click_003.ogg"
        },
        {
          "alias": "click_004",
          "src": "assets/click_004.ogg"
        },
        {
          "alias": "click_005",
          "src": "assets/click_005.ogg"
        }
      ]
    }
  ]
};

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

  const redRect = new Graphics().rect(0, 0, 100, 100).fill({ color: "red", alpha: 0.5 });
  const greenRect = new Graphics().rect(0, 0, 100, 100).fill({ color: "green", alpha: 0.5 });
  const blueRect = new Graphics().rect(0, 0, 100, 100).fill({ color: "blue", alpha: 0.5 });

  app.stage.addChild(redRect);
  app.stage.addChild(greenRect);
  app.stage.addChild(blueRect);

  const leftPanel = new MyVerticalPanel(redRect);
  const midPanel = new MyVerticalPanel(greenRect);
  const rightPanel = new MyVerticalPanel(blueRect);

  await Assets.init({ manifest: manifest });
  await Assets.loadBundle("animals");
  await Assets.loadBundle("sounds");

  const boardContainer = new Board();
  app.stage.addChild(boardContainer);
  midPanel.addChild(boardContainer);

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

  const newGameButton = new MyButton({ text: "___NEW_GAME___" });
  app.stage.addChild(newGameButton);
  leftPanel.addChild(newGameButton);

  const gamesList = new MyList();
  gamesList.setGames(games);
  //gamesList.grow = true;
  app.stage.addChild(gamesList);
  leftPanel.addChild(gamesList);

  const twoLettersButton = new MyButton({ text: "___TWO_LETTERS___" });
  app.stage.addChild(twoLettersButton);
  leftPanel.addChild(twoLettersButton);
  const threeLettersButton = new MyButton({ text: "___THREE_LETTERS___" });
  app.stage.addChild(threeLettersButton);
  leftPanel.addChild(threeLettersButton);
  const rareOneButton = new MyButton({ text: "___RARE_LETTER_1___" });
  app.stage.addChild(rareOneButton);
  leftPanel.addChild(rareOneButton);
  const rareTwoButton = new MyButton({ text: "___RARE_LETTER_2___" });
  app.stage.addChild(rareTwoButton);
  leftPanel.addChild(rareTwoButton);

  for (let i = 0; i < RIGHT_BUTTONS_NUM; i++) {
    const button = new MyButton({
      text: `Button ${i + 1}`
    });

    button.onPress.connect(() => console.log(`Button ${i + 1} pressed!`));
    button.enabled = i % 4 !== 1;
    app.stage.addChild(button);
    rightPanel.addChild(button);
  }

  app.ticker.add((time) => {
    buttonsTweenGroup.update();

    bunny.rotation += 0.05 * time.deltaTime;
    label.skew.x += 0.02 * time.deltaTime;
    label.skew.y += 0.01 * time.deltaTime;
  });

  const onResize = () => {
    console.log("onResize left panel");
    leftPanel.resize(UI_PADDING, UI_PADDING, UI_WIDTH, app.screen.height - 2 * UI_PADDING);

    console.log("onResize mid panel");
    midPanel.resize(
      UI_WIDTH + 2 * UI_PADDING,
      UI_PADDING,
      app.screen.width - 2 * UI_WIDTH - 2 * UI_PADDING,
      app.screen.height - 2 * UI_PADDING
    );

    console.log("onResize right panel");
    rightPanel.resize(
      app.screen.width - UI_WIDTH - UI_PADDING,
      UI_PADDING,
      UI_WIDTH,
      app.screen.height - 2 * UI_PADDING
    );
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
  const label = new Text({ text: "___NO___" });
  label.x = (NUM_CELLS - 0.5) * TILE_SIZE;
  label.y = (NUM_CELLS - 0.5) * TILE_SIZE;
  label.anchor.set(0.5);
  return label;
}
