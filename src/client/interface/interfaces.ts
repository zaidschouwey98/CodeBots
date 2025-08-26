import {Application, Container, ContainerChild, NineSliceSprite, Sprite, Spritesheet, Text} from 'pixi.js';
import {findTexture} from "../spritesheet_atlas";
import {Item} from "../items/item";

export class Interface {
    app: Application;
    spritesheets: Spritesheet[];
    scale: number;

    constructor(app: Application, spritesheets: Spritesheet[], scale: number) {
        this.app = app;
        this.spritesheets = spritesheets;
        this.scale = scale;
    }

    /**
     * Draws an item bar at the bottom center of the screen.
     * @param items Array of items to display in the item bar
     */
    public drawItemBar = (items: []) => {
        const itemBar = new Container();
        this.app.stage.addChild(itemBar);

        const slotCount = 6;
        const spaceBetweenSquares = 20;
        const barWidth = this.scale * slotCount + ((slotCount - 1) * spaceBetweenSquares);
        const barHeight = this.scale;

        itemBar.width = barWidth;
        itemBar.height = barHeight;

        itemBar.x = this.app.screen.width / 2 - (barWidth / 2);
        itemBar.y = this.app.screen.height - barHeight - 20;

        const texture = findTexture(this.spritesheets, "light_square");

        for (let i = 0; i < slotCount; ++i) {
            const lightSquare = new Sprite(texture);
            lightSquare.width = this.scale;
            lightSquare.height = this.scale;
            lightSquare.x = i * (lightSquare.width + spaceBetweenSquares);
            lightSquare.y = 0;

            this.drawItem(items[i], lightSquare);

            itemBar.addChild(lightSquare);
        }

    };

    /**
     * Draws a chest inventory interface at the center of the screen.
     * @param items
     */
    public drawChestInventory = (items: []) => {
        const chestInventory = new Container();
        this.app.stage.addChild(chestInventory);

        const chestWidth = this.app.screen.width * 0.5;
        const chestHeight = this.app.screen.height * 0.5;

        chestInventory.width = chestWidth;
        chestInventory.height = chestHeight;

        chestInventory.x = this.app.screen.width / 2 - (chestWidth / 2);
        chestInventory.y = this.app.screen.height / 2 - (chestHeight / 2);

        const innerContainer = new Container();
        chestInventory.addChild(innerContainer);

        const texture = findTexture(this.spritesheets, "dark_frame");
        const frame = new NineSliceSprite({
            texture: texture,
            leftWidth: 4,
            topHeight: 4,
            rightWidth: 4,
            bottomHeight: 4,
            width: chestWidth,
            height: chestHeight
        });

        chestInventory.addChild(frame);

        //add item slots in the chest frame
        const maxLength = chestInventory.height - (this.scale * 0.5);

        const slotsPerRow = 7;
        const rows = 4;

        const length = Math.min(this.scale, maxLength / (rows * 1.2));
        const spaceBetweenSquares = (chestWidth - (slotsPerRow * this.scale)) / (slotsPerRow + 1);


        for (let i = 0; i < slotsPerRow * rows; ++i) {
            const texture = findTexture(this.spritesheets, "dark_square");

            const darkSquare = new Sprite(texture);
            darkSquare.width = length;
            darkSquare.height = length;

            darkSquare.x = (i % slotsPerRow) * (length + spaceBetweenSquares) + spaceBetweenSquares;
            darkSquare.y = Math.floor(i / slotsPerRow) * (length + spaceBetweenSquares) + spaceBetweenSquares;

            this.drawItem(items[i], darkSquare);

            chestInventory.addChild(darkSquare);
        }
    }

    /**
     * Draws an item inside a given square container.
     * @param item
     * @param container
     */
    private drawItem = (item: Item, container: ContainerChild) => {
        //if(!item) return;

        const itemTexture = findTexture(this.spritesheets, "pickaxe"/*item.spriteName*/);
        const itemSprite = new Sprite(itemTexture);

        const length = this.scale * 0.8;
        itemSprite.width = length;
        itemSprite.height = length;

        container.addChild(itemSprite);

        //display quantity if more than 1
        const quantityText = new Text({
            text: '2500'/*item.quantity > 1 ? item.quantity.toString() : ''*/,
            style: {
                fill: '#000000',
                fontSize: 8,
                fontFamily: 'Arial',
            },
            resolution: 4,
        });

        quantityText.x = itemSprite.x + itemSprite.width - (quantityText.width * 1.2);
        quantityText.y = itemSprite.y + itemSprite.height - (quantityText.height * 1.2);
        container.addChild(quantityText);
    }

}
