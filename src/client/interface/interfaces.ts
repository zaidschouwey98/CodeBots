import {Application, Container, ContainerChild, NineSliceSprite, Sprite, Spritesheet, Text} from 'pixi.js';
import {findTexture, TextureName} from "../spritesheet_atlas";
import {Item, Recipe} from "../items/item";

export class Interface {
    constructor(public app: Application, public spritesheets: Spritesheet[], public scale: number) {
    }

    /**
     * Creates a close button and positions it at the top-right corner of the given container.
     * @param container
     */
    private createCloseButton = (container: Container): Sprite => {
        const closeButton = new Sprite(findTexture(this.spritesheets, "close"));
        const bounds = container.getLocalBounds();
        closeButton.width = bounds.width * 0.05;
        closeButton.height = bounds.width * 0.05;
        closeButton.x = bounds.width - closeButton.width - 5;
        closeButton.y = 5;
        closeButton.interactive = true;
        closeButton.on('pointerdown', () => {
            this.app.stage.removeChild(container);
        });
        return closeButton;
    }

    /**
     * Creates a centered container with a frame and a close button.
     * @param width
     * @param height
     * @param textureName
     * @param borderDimension
     */
    private createCenteredContainer = (width: number, height: number, textureName: TextureName, borderDimension: number): Container => {
        const container = new Container();
        container.width = width;
        container.height = height;
        container.x = this.app.screen.width / 2 - (width / 2);
        container.y = this.app.screen.height / 2 - (height / 2);
        container.addChild(this.createFrame(width, height, textureName, borderDimension));
        container.addChild(this.createCloseButton(container));
        this.app.stage.addChild(container);
        return container;
    }

    /**
     * Creates a resizable frame using a nine-slice sprite.
     * @param width
     * @param height
     * @param textureName
     * @param borderDimension
     */
    private createFrame = (width: number, height: number, textureName: TextureName, borderDimension: number): NineSliceSprite => {
        return new NineSliceSprite({
            texture: findTexture(this.spritesheets, textureName),
            leftWidth: borderDimension,
            topHeight: borderDimension,
            rightWidth: borderDimension,
            bottomHeight: borderDimension,
            width: width,
            height: height
        });
    }

    /**
     * Draws an item inside a given square container.
     * @param item
     * @param container
     */
    private drawItem = (item: Item, container: ContainerChild) => {
        if (!item) return;

        const itemTexture = findTexture(this.spritesheets, item.spriteName);
        const itemSprite = new Sprite(itemTexture);

        const bounds = container.getLocalBounds();

        const length = bounds.height * 0.8;
        itemSprite.width = length;
        itemSprite.height = length;

        itemSprite.x = (bounds.width - itemSprite.width) / 2;
        itemSprite.y = (bounds.height - itemSprite.height) / 2;

        container.addChild(itemSprite);

        const quantityText = new Text({
            text: item.quantity > 1 ? item.quantity.toString() : '',
            style: {
                //fill: '#000000',
                fontSize: 8,
                fontFamily: 'Jersey',
            },
            resolution: 4,
        });

        quantityText.x = itemSprite.x + itemSprite.width - (quantityText.width * 1.1);
        quantityText.y = itemSprite.y + itemSprite.height - (quantityText.height * 1.1);
        container.addChild(quantityText);
    }

    /**
     * Draws an item bar at the bottom center of the screen.
     * @param items Array of items to display in the item bar
     */
    public drawItemBar = (items: Item[]) => {
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
    public drawChestInventory = (items: Item[]) => {
        const chestWidth = this.app.screen.width * 0.5;
        const chestHeight = this.app.screen.height * 0.5;
        const chestInventory = this.createCenteredContainer(chestWidth, chestHeight, "dark_frame", 4);

        const slotsPerRow = 7, rows = 4;
        const heightPadding = chestHeight * 0.05;
        const widthPadding = chestWidth * 0.05;

        const availableWidth = chestWidth - 2 * widthPadding;
        const availableHeight = chestHeight - heightPadding;

        const squareLength = Math.min(
            availableWidth / slotsPerRow,
            availableHeight / rows
        ) * 0.8;

        const spaceBetweenSquares = (availableWidth - (slotsPerRow * squareLength)) / (slotsPerRow + 1);
        const spaceBetweenRows = (availableHeight - (rows * squareLength)) / (rows + 1);

        for (let i = 0; i < slotsPerRow * rows; ++i) {
            const darkSquare = new Sprite(findTexture(this.spritesheets, "dark_square"));
            darkSquare.width = darkSquare.height = squareLength;

            darkSquare.x = widthPadding + (i % slotsPerRow) * (squareLength + spaceBetweenSquares) + spaceBetweenSquares;
            darkSquare.y = heightPadding + Math.floor(i / slotsPerRow) * (squareLength + spaceBetweenRows) + spaceBetweenRows;

            this.drawItem(items[i], darkSquare);
            chestInventory.addChild(darkSquare);
        }
    }

    /**
     * Draws a crafting interface at the center of the screen.
     * @param recipes
     */
    public drawCraftingInterface = (recipes: Recipe[]) => {
        const craftingWidth = this.app.screen.width * 0.5;
        const craftingHeight = this.app.screen.height * 0.5;
        const craftingInterface = this.createCenteredContainer(craftingWidth, craftingHeight, "dark_frame", 4);
    }
}
