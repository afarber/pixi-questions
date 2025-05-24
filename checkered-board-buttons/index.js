import { Application, Assets, Sprite, Text } from "pixi.js";
import { Board, NUM_CELLS } from "./Board";
import { Tile, TILE_SIZE } from "./Tile";
import { MyButton, buttonsTweenGroup } from "./MyButton";
import { MyList } from "./MyList";
import { UI_HEIGHT } from "./Theme";
import { Layout } from "./Layout";
import { games } from "./TestData";

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

  // Create our UI layout manager
  const layout = new Layout();

  await Assets.init({ manifest: manifest });
  await Assets.loadBundle("animals");
  await Assets.loadBundle("sounds");

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

  const newGameButton = new MyButton({ text: "___NEW_GAME___" });
  app.stage.addChild(newGameButton);

  const twoLettersButton = new MyButton({ text: "___TWO_LETTERS___" });
  app.stage.addChild(twoLettersButton);
  const threeLettersButton = new MyButton({ text: "___THREE_LETTERS___" });
  app.stage.addChild(threeLettersButton);
  const rareOneButton = new MyButton({ text: "___RARE_LETTER_1___" });
  app.stage.addChild(rareOneButton);
  const rareTwoButton = new MyButton({ text: "___RARE_LETTER_2___" });
  app.stage.addChild(rareTwoButton);

  const gamesList = new MyList();
  app.stage.addChild(gamesList);

  gamesList.setGames(games);

  for (let i = 0; i < RIGHT_BUTTONS_NUM; i++) {
    const button = new MyButton({
      text: `Button ${i + 1}`
    });

    button.onPress.connect(() => console.log(`Button ${i + 1} pressed!`));
    button.enabled = i % 4 !== 1;
    app.stage.addChild(button);
    layout.addRight(button);
  }

  app.ticker.add((time) => {
    buttonsTweenGroup.update();

    bunny.rotation += 0.05 * time.deltaTime;
    label.skew.x += 0.02 * time.deltaTime;
    label.skew.y += 0.01 * time.deltaTime;
  });

  // Configure the layout with all our UI elements
  layout.setCenter(boardContainer);

  // Add left side elements
  layout.addLeft(newGameButton);
  layout.addLeft(gamesList, { height: 5.5 * UI_HEIGHT });
  layout.addLeft(twoLettersButton);
  layout.addLeft(threeLettersButton);
  layout.addLeft(rareOneButton);
  layout.addLeft(rareTwoButton);

  const onResize = () => {
    // Let the layout manager handle everything else
    layout.resize(app.screen.width, app.screen.height);
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
