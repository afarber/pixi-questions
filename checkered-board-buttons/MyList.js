import { Container, Text } from "pixi.js";
import { ScrollBox } from "@pixi/ui";
import { MyButton } from "./MyButton";
import {
  UI_HEIGHT,
  UI_WIDTH,
  UI_RADIUS,
  UI_PADDING,
  UI_BACKGROUND,
  TITLE_TEXT_STYLE
} from "./Theme";

// A list with 3 sections
export class MyList extends Container {
  constructor() {
    super();

    this.scrollBox = new ScrollBox({
      background: UI_BACKGROUND,
      width: UI_WIDTH + 2 * UI_PADDING,
      height: 5.5 * UI_HEIGHT,
      radius: UI_RADIUS,
      elementsMargin: UI_PADDING,
      padding: UI_PADDING
    });
    this.addChild(this.scrollBox);
  }

  setGames(games) {
    this.scrollBox.removeItems();

    if (!Array.isArray(games) || games.length == 0) {
      const zeroGames = new Text({
        text: "__ZERO_GAMES__",
        style: TITLE_TEXT_STYLE
      });

      this.scrollBox.addItem(zeroGames);
      return;
    }

    const yourGames = [];
    const opponentGames = [];
    const finishedGames = [];

    for (const game of games) {
      const isFinished = game.finished > 0;
      if (isFinished) {
        finishedGames.push(game.id);
      } else {
        const myTurn = game.played1 <= game.played2;
        if (myTurn) {
          yourGames.push(game.id);
        } else {
          opponentGames.push(game.id);
        }
      }
    }

    this.createSection("__YOUR_TURN__", yourGames);
    this.createSection("__HIS_TURN__", opponentGames);
    this.createSection("__ARCHIVE__", finishedGames);
  }

  // Create a parent container for a button.
  // It is needed, because button anchor is set to 0.5
  // and thus the scroll box would be misplacing it.
  createParentContainer(gameId) {
    const parentContainer = new Container();
    parentContainer.width = UI_WIDTH;
    parentContainer.height = UI_HEIGHT;

    const button = new MyButton({
      text: `__GAME__ ${gameId}`
    });
    button.x = UI_WIDTH / 2;
    button.y = UI_HEIGHT / 2;
    parentContainer.addChild(button);

    button.onPress.connect(() => console.log(`Game ${gameId} pressed!`));
    return parentContainer;
  }

  createSection(title, gameIds) {
    if (Array.isArray(gameIds) && gameIds.length > 0) {
      const sectionTitle = new Text({
        text: title,
        style: TITLE_TEXT_STYLE
      });

      this.scrollBox.addItem(sectionTitle);

      for (const gid of gameIds) {
        const parentContainer = this.createParentContainer(gid);
        this.scrollBox.addItem(parentContainer);
      }
    }
  }

  resize(w, h) {
    this.scrollBox.width = w;
    this.scrollBox.height = h;
  }
}
