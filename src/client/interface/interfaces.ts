import {Application, Assets, Container, ContainerChild, Sprite, Spritesheet, SpritesheetData} from 'pixi.js';
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
    const slotCount = 6;
    const spaceBetweenSquares = 20;
    const barWidth = scale * slotCount + ((slotCount - 1) * spaceBetweenSquares);
    const barHeight = scale;

    itemBar.width = barWidth;
    itemBar.height = barHeight;

    itemBar.x = app.screen.width / 2 - (barWidth / 2);
    itemBar.y = app.screen.height - barHeight - 10;
    app.stage.addChild(itemBar);

    const texture = findTexture(spritesheets, "light_square");

    for (let i = 0; i < slotCount; ++i) {
        const lightSquare = new Sprite(texture);
        lightSquare.width = scale;
        lightSquare.height = scale;
        lightSquare.x = i * (lightSquare.width + spaceBetweenSquares);
        lightSquare.y = 0;
        itemBar.addChild(lightSquare);
    }

};


export default drawItemBar;
