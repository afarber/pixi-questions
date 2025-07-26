import { Application, Assets, Sprite, Text } from "pixi.js";
import { Board, NUM_CELLS } from "./Board";
import { Tile, TILE_SIZE } from "./Tile";
import { MyButton, buttonsTweenGroup } from "./MyButton";
import { MyList } from "./MyList";
import { games } from "./TestData";
import { MyVerticalPanel } from "./layout/MyVerticalPanel";
import { MyLayoutManager } from "./layout/MyLayoutManager";
import { MyConfirmDialog, dialogTweenGroup } from "./dialogs/MyConfirmDialog.js";
import { MySwapDialog } from "./dialogs/MySwapDialog.js";

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

(async () => {
  const app = new Application();
  await app.init({
    canvas: document.getElementById("pixiCanvas"),
    background: "LightSalmon",
    resizeTo: window,
    hello: true
  });

  // the app stage will handle the move events
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  const leftPanel = new MyVerticalPanel(app.stage);
  const midPanel = new MyVerticalPanel(app.stage);
  const rightPanel = new MyVerticalPanel(app.stage);

  await Assets.init({ manifest: manifest });
  await Assets.loadBundle("animals");
  await Assets.loadBundle("sounds");

  const text1 = new Text({
    text: "Game score 420:360"
  });
  midPanel.addChild(text1);

  const boardContainer = new Board();
  midPanel.addChild(boardContainer);

  const text2 = new Text({
    text: "A longer game hint about tiles placement..."
  });
  midPanel.addChild(text2);

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
  leftPanel.addChild(newGameButton);

  const gamesList = new MyList();
  gamesList.setGames(games);
  leftPanel.addChild(gamesList);

  const twoLettersButton = new MyButton({ text: "___TWO_LETTERS___" });
  leftPanel.addChild(twoLettersButton);
  const threeLettersButton = new MyButton({ text: "___THREE_LETTERS___" });
  leftPanel.addChild(threeLettersButton);
  const rareOneButton = new MyButton({ text: "___RARE_LETTER_1___" });
  leftPanel.addChild(rareOneButton);
  const rareTwoButton = new MyButton({ text: "___RARE_LETTER_2___" });
  leftPanel.addChild(rareTwoButton);

  const rightButtons = [
    {
      "label": "___FULL_SCREEN___",
      "text": null,
      "onpress": () => {
        const fullDiv = document.getElementById("fullDiv");
        toggleFullscreen(fullDiv);
      }
    },
    {
      "label": "___SWAP___",
      "text": null,
      "text": "___QUESTION_SWAP___",
      "onpress": () => {
        console.log("___SWAP___ confirmed and executed!");
      }
    },
    {
      "label": "___SKIP___",
      "text": "___QUESTION_SKIP___",
      "onpress": () => {
        console.log("___SKIP___ confirmed and executed!");
      }
    },
    {
      "label": "___RESIGN___",
      "text": "___QUESTION_RESIGN___",
      "onpress": () => {
        console.log("___RESIGN___ confirmed and executed!");
      }
    },
    {
      "label": "___PILE___",
      "text": null,
      "onpress": () => {
        console.log("___PILE___ pressed!");
      }
    },
    {
      "label": "___MOVES_HISTORY___",
      "text": null,
      "onpress": () => {
        console.log("___MOVES_HISTORY___ pressed!");
      }
    },
    {
      "label": "___SETTINGS___",
      "text": null,
      "onpress": () => {
        console.log("___SETTINGS___ pressed!");
      }
    },
    {
      "label": "___SHARE___",
      "text": "___QUESTION_SHARE___",
      "onpress": () => {
        console.log("___SHARE___ confirmed and executed!");
      }
    },
    {
      "label": "___PLAY___",
      "text": "___QUESTION_PLAY___",
      "onpress": () => {
        console.log("___PLAY___ confirmed and executed!");
      }
    },
    {
      "label": "___SHUFFLE___",
      "text": null,
      "onpress": () => {
        console.log("___SHUFFLE___ pressed!");
      }
    }
  ];

  for (let i = 0; i < rightButtons.length; i++) {
    const buttonConfig = rightButtons[i];
    const button = new MyButton({
      text: buttonConfig.label
    });

    button.onPress.connect(() => {
      if (buttonConfig.text) {
        confirmDialog.show(buttonConfig.text, buttonConfig.onpress, () => {
          console.log(`${buttonConfig.label} cancelled!`);
        });
      } else {
        buttonConfig.onpress();
      }
    });

    button.enabled = i !== 7;
    rightPanel.addChild(button);
  }

  leftPanel.addChildrenToStage(app.stage);
  midPanel.addChildrenToStage(app.stage);
  rightPanel.addChildrenToStage(app.stage);

  // Create dialog instances
  const confirmDialog = new MyConfirmDialog(app);
  const swapDialog = new MySwapDialog(app);
  app.stage.addChild(confirmDialog);
  app.stage.addChild(swapDialog);

  // Initialize layout manager with dialog and setup event listeners
  const layoutManager = new MyLayoutManager(app, leftPanel, midPanel, rightPanel, [confirmDialog, swapDialog]);
  layoutManager.setupEventListeners();

  app.ticker.add((time) => {
    buttonsTweenGroup.update();
    dialogTweenGroup.update();

    bunny.rotation += 0.05 * time.deltaTime;
    label.skew.x += 0.02 * time.deltaTime;
    label.skew.y += 0.01 * time.deltaTime;
  });
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

function toggleFullscreen(fullDiv) {
  console.log("document.fullscreenEnabled", document.fullscreenEnabled);

  if (!document.fullscreenEnabled) {
    return;
  }

  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    fullDiv.requestFullscreen().catch((err) => {
      console.log(`Error attempting to enable fullscreen: ${err.message}`);
    });
  }
}
