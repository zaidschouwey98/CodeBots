import {
    Application,
    Assets,
    Container,
    ContainerChild,
    NineSlicePlane,
    Sprite,
    Spritesheet,
    SpritesheetData
} from 'pixi.js';
import {findTexture} from "../spritesheet_atlas";

/**
 * Draws an item bar at the bottom center of the screen.
 * @param app The PIXI application instance
 * @param spritesheets Array of loaded spritesheets
 * @param scale Size of each item slot in pixels
 * @param items Array of items to display in the item bar
 */
const drawItemBar = (app: Application, spritesheets: Spritesheet[], scale: number, items: []) => {
    const itemBar = new Container();
    app.stage.addChild(itemBar);

    const slotCount = 6;
    const spaceBetweenSquares = 20;
    const barWidth = scale * slotCount + ((slotCount - 1) * spaceBetweenSquares);
    const barHeight = scale;

    itemBar.width = barWidth;
    itemBar.height = barHeight;

    itemBar.x = app.screen.width / 2 - (barWidth / 2);
    itemBar.y = app.screen.height - barHeight - 20;

    const texture = findTexture(spritesheets, "light_square");

    for (let i = 0; i < slotCount; ++i) {
        const lightSquare = new Sprite(texture);
        lightSquare.width = scale;
        lightSquare.height = scale;
        lightSquare.x = i * (lightSquare.width + spaceBetweenSquares);
        lightSquare.y = 0;

        //TODO display items in the bar
        //displayItem(items[i], lightSquare);

        itemBar.addChild(lightSquare);
    }

};

const drawChestInventory = (app: Application, spritesheets: Spritesheet[], scale: number, items: []) => {
    const chestInventory = new Container();
    app.stage.addChild(chestInventory);

    const chestWidth = app.screen.width * 3 / 4;
    const chestHeight = app.screen.height * 3 / 4;

    chestInventory.width = chestWidth;
    chestInventory.height = chestHeight;

    chestInventory.x = app.screen.width / 2 - (chestWidth / 2);
    chestInventory.y = app.screen.height / 2 - (chestHeight / 2);

    const texture = findTexture(spritesheets, "dark_frame");
    const frame = new NineSlicePlane(texture, 4, 4, 4, 4);
    frame.width = chestWidth;
    frame.height = chestHeight;
    frame.x = 0;
    frame.y = 0;

    chestInventory.addChild(frame);
}

export {drawItemBar, drawChestInventory};
