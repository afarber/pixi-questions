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
      // add section title
      const title = new Text({
        text: "Your games",
        style: TITLE_TEXT_STYLE
      });

      this.scrollBox.addChild(title);

      for (let i = 0; i < yourGames.length; i++) {
        // a parent container for the button,
        // needed because button anchor is set to 0.5
        // and thus the scroll box was misplacing it
        const parentContainer = new Container();
        parentContainer.width = UI_WIDTH;
        parentContainer.height = UI_HEIGHT;

        const button = new MyButton({
          text: `Game ${i + 1}`
        });
        button.x = UI_WIDTH / 2;
        button.y = UI_HEIGHT / 2;
        button.enabled = i % 4 !== 1;
        parentContainer.addChild(button);

        button.onPress.connect(() => console.log(`Game ${i + 1} pressed!`));
        this.scrollBox.addItem(parentContainer);
      }
    }

    if (Array.isArray(opponentGames) && opponentGames.length > 0) {
      // add section title
      const title = new Text({
        text: "Waiting",
        style: TITLE_TEXT_STYLE
      });

      this.scrollBox.addChild(title);

      for (let i = 0; i < opponentGames.length; i++) {
        // a parent container for the button,
        // needed because button anchor is set to 0.5
        // and thus the scroll box was misplacing it
        const parentContainer = new Container();
        parentContainer.width = UI_WIDTH;
        parentContainer.height = UI_HEIGHT;

        const button = new MyButton({
          text: `Game ${i + 1}`
        });
        button.x = UI_WIDTH / 2;
        button.y = UI_HEIGHT / 2;
        button.enabled = i % 4 !== 1;
        parentContainer.addChild(button);

        button.onPress.connect(() => console.log(`Game ${i + 1} pressed!`));
        this.scrollBox.addItem(parentContainer);
      }
    }

    if (Array.isArray(finishedGames) && finishedGames.length > 0) {
      // add section title
      const title = new Text({
        text: "Archive",
        style: TITLE_TEXT_STYLE
      });

      this.scrollBox.addChild(title);

      for (let i = 0; i < finishedGames.length; i++) {
        // a parent container for the button,
        // needed because button anchor is set to 0.5
        // and thus the scroll box was misplacing it
        const parentContainer = new Container();
        parentContainer.width = UI_WIDTH;
        parentContainer.height = UI_HEIGHT;

        const button = new MyButton({
          text: `Game ${i + 1}`
        });
        button.x = UI_WIDTH / 2;
        button.y = UI_HEIGHT / 2;
        button.enabled = i % 4 !== 1;
        parentContainer.addChild(button);

        button.onPress.connect(() => console.log(`Game ${i + 1} pressed!`));
        this.scrollBox.addItem(parentContainer);
      }
    }
  }
}
