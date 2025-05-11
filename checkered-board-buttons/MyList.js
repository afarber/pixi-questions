import { Container, Graphics, Text } from "pixi.js";
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
      height: 300,
      radius: UI_RADIUS,
      vertPadding: UI_PADDING,
      elementsMargin: UI_PADDING,
      padding: UI_PADDING
    });
    this.addChild(this.scrollBox);
  }

  setGames(yourGames, opponentGames, finishedGames) {
    this.scrollBox.removeItems();

    if (Array.isArray(yourGames) && yourGames.length > 0) {
      const sectionTitle = new Text({
        text: "__YOUR_TURN__",
        style: TITLE_TEXT_STYLE
      });

      this.scrollBox.addItem(sectionTitle);

      for (let i = 0; i < yourGames.length; i++) {
        const parentContainer = this.createParentContainer(yourGames[i]);
        this.scrollBox.addItem(parentContainer);
      }
    }

    if (Array.isArray(opponentGames) && opponentGames.length > 0) {
      const sectionTitle = new Text({
        text: "__HIS_TURN__",
        style: TITLE_TEXT_STYLE
      });

      this.scrollBox.addItem(sectionTitle);

      for (let i = 0; i < opponentGames.length; i++) {
        const parentContainer = this.createParentContainer(opponentGames[i]);
        this.scrollBox.addItem(parentContainer);
      }
    }

    if (Array.isArray(finishedGames) && finishedGames.length > 0) {
      const sectionTitle = new Text({
        text: "__ARCHIVE__",
        style: TITLE_TEXT_STYLE
      });

      this.scrollBox.addItem(sectionTitle);

      for (let i = 0; i < finishedGames.length; i++) {
        const parentContainer = this.createParentContainer(finishedGames[i]);
        this.scrollBox.addItem(parentContainer);
      }
    }
  }

  // Create a parent container for a button.
  // It is needed, because button anchor is set to 0.5
  // and thus the scroll box would be misplacing it.
  createParentContainer(gameId) {
    const parentContainer = new Container();
    parentContainer.width = UI_WIDTH;
    parentContainer.height = UI_HEIGHT;

    const button = new MyButton({
      text: `Game ${gameId}`
    });
    button.x = UI_WIDTH / 2;
    button.y = UI_HEIGHT / 2;
    parentContainer.addChild(button);

    button.onPress.connect(() => console.log(`Game ${gameId} pressed!`));
    return parentContainer;
  }
}
