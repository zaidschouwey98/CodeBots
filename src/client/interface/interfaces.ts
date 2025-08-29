import {Application, Container, ContainerChild, Graphics, NineSliceSprite, Sprite, Spritesheet, Text} from 'pixi.js';
import {findTexture, TextureName} from "../spritesheet_atlas";
import {CoreStep, Item, Recipe} from "../items/item";
import {ScrollBar} from "./ScrollBar";

export abstract class BaseInterface {
    protected app: Application;
    protected container: Container;
    protected spritesheets: Spritesheet[];
    protected scale: number;

    protected constructor(app: Application, spritesheets: Spritesheet[], scale: number) {
        this.app = app;
        this.container = new Container();
        this.spritesheets = spritesheets;
        this.scale = scale;
        this.app.stage.addChild(this.container);
    }

    public abstract draw(): void;

    public destroy(): void {
        this.app.stage.removeChild(this.container);
        this.container.destroy();
    }

    /**
     * Creates a close button and positions it at the top-right corner of the given container.
     * @param container
     */
    protected createCloseButton = (container: Container): Sprite => {
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
    protected createCenteredContainer = (width: number, height: number, textureName: TextureName, borderDimension: number): Container => {
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
    protected createFrame = (width: number, height: number, textureName: TextureName, borderDimension: number): NineSliceSprite => {
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
     * @param item the item to draw
     * @param container the square container to draw the item in
     * @param drawQty whether to show the item quantity at the bottom-right of the slot
     * @param drawNameOnHover whether to show the item name below the slot when hovering over the item
     * (note : this requires the container to leave enough space below the slotto show the text)
     */
    protected drawItem = (item: Item, container: ContainerChild, drawQty: boolean = true, drawNameOnHover: boolean = true) => {
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

        if (drawQty) {
            const quantityText = new Text({
                text: item.quantity > 1 ? item.quantity.toString() : '',
                style: {
                    fill: '#000000',
                    fontSize: 8,
                    fontFamily: 'Jersey',
                },
                resolution: 4,
            });

            quantityText.x = itemSprite.x + itemSprite.width - (quantityText.width * 1.1);
            quantityText.y = itemSprite.y + itemSprite.height - (quantityText.height * 1.1);
            container.addChild(quantityText);
        }

        if (drawNameOnHover) {
            const nameText = new Text({
                text: item.spriteName.replace(/_/g, ' ').toUpperCase(),
                style: {
                    fill: '#ffffff',
                    fontSize: 8,
                    fontFamily: 'Jersey',
                    stroke: '#000000',
                },
                resolution: 4,
            });

            nameText.x = 0
            nameText.y = bounds.height;
            nameText.visible = false;
            container.addChild(nameText);

            container.interactive = true;
            container.on('mouseover', () => {
                nameText.visible = true;
            });

            container.on('mouseout', () => {
                nameText.visible = false;
            });
        }
    }
}

export class InventoryInterface extends BaseInterface {
    private items: Item[];

    constructor(app: Application, spritesheets: Spritesheet[], scale: number, items: Item[]) {
        super(app, spritesheets, scale);
        this.items = items;
    }

    public draw() {
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

            darkSquare.interactive = true;
            darkSquare.on('pointerdown', () => {
                //TODO manage chest item click
                console.log(`Clicked on chest item slot ${i + 1}`);
            });

            this.drawItem(this.items[i], darkSquare);
            chestInventory.addChild(darkSquare);
        }
    }

}

export class CraftingInterface extends BaseInterface {
    private recipes: Recipe[];

    constructor(app: Application, spritesheets: Spritesheet[], scale: number, recipes: Recipe[]) {
        super(app, spritesheets, scale);
        this.recipes = recipes;
    }

    public draw(): void {
        const craftingWidth = this.app.screen.width * 0.5;
        const craftingHeight = this.app.screen.height * 0.5;
        const craftingInterface = this.createCenteredContainer(craftingWidth, craftingHeight, "dark_frame", 4);

        // paddings & layout
        const padding = 18;
        const rowHeight = Math.max(56, Math.round(this.scale * 1.05)) + 10; // vertical space per recipe (+ 10 to allow displaying item name)
        const vGap = 12;
        const leftOutputSize = Math.round(this.scale * 1.05); // big left output slot
        const smallSlotSize = Math.round(this.scale * 0.85);  // small input slots
        const hGap = 12;

        // compute viewport (the visible area that will be clipped)
        const viewportX = padding;
        const viewportY = padding;
        const viewportW = craftingWidth - padding * 3 - 40; // leave space for scrollbar on right
        const viewportH = craftingHeight - padding * 2;

        // container that will be the area where rows are shown
        const viewport = new Container();
        viewport.x = viewportX;
        viewport.y = viewportY;
        viewport.width = viewportW;
        viewport.height = viewportH;
        craftingInterface.addChild(viewport);

        // content container (holds the list of rows). We'll move content.y for scrolling.
        const content = new Container();
        viewport.addChild(content);

        const stripe = new Graphics();
        stripe.x = 0;
        stripe.y = 0;
        viewport.addChildAt(stripe, 0);

        const totalRows = this.recipes.length;
        const contentHeight = totalRows * (rowHeight + vGap);

        //where the small slots begin relative to content (after the output slot)
        const leftStartX = 6 + leftOutputSize + 6;

        for (let i = 0; i < this.recipes.length; ++i) {
            const recipe = this.recipes[i];
            const row = new Container();
            row.y = i * (rowHeight + vGap);
            content.addChild(row);

            const rowBg = new Graphics(); // invisible but catches events
            rowBg.fill(0xffffff, 0);
            rowBg.rect(0, 0, viewportW, rowHeight);
            rowBg.endFill();
            row.addChildAt(rowBg, 0);

            // add darker bg color on hovering recipe
            row.interactive = true;
            row.on('mouseover', () => {
                stripe.clear();
                stripe.beginFill(0x000000, 0.1);
                stripe.drawRect(0, row.y + content.y, viewportW, rowHeight);
                stripe.endFill();
            })

            row.on('mouseout', () => {
                stripe.clear();
            })

            // big output slot on left
            const outSprite = new Sprite(findTexture(this.spritesheets, "light_square"));
            outSprite.width = outSprite.height = leftOutputSize;
            outSprite.x = 6; // small left margin within the content
            outSprite.y = (rowHeight - leftOutputSize) / 2;
            outSprite.interactive = true;
            outSprite.on('pointerdown', () => {
                //TODO craft item on click
                console.log(`Craft item ${recipe.output.spriteName} x${recipe.output.quantity}`);
            })
            row.addChild(outSprite);
            this.drawItem(recipe.output, outSprite);

            // small input slots
            for (let s = 0; s < recipe.inputs.length; s++) {
                const slotSprite = new Sprite(findTexture(this.spritesheets, "light_square"));
                slotSprite.width = smallSlotSize;
                slotSprite.height = smallSlotSize;
                slotSprite.x = leftStartX + s * (smallSlotSize + hGap);
                //align vertically with bottom of output slot
                slotSprite.y = outSprite.y + outSprite.height - slotSprite.height;
                slotSprite.interactive = true;

                const item = recipe.inputs[s] ?? null;
                this.drawItem(item, slotSprite);

                row.addChild(slotSprite);
            }
        }

        const scrollbarX = viewport.x + viewportW + 8;
        const scrollbarY = viewport.y;
        const scrollbarW = 18;
        const scrollbarH = viewportH;

        new ScrollBar(content, contentHeight, viewportH, craftingInterface, scrollbarX, scrollbarY, scrollbarW, scrollbarH, this.app);
    }
}

export class CoreInterface extends BaseInterface {
    private steps: CoreStep[];
    private currentStepIndex: number;

    constructor(app: Application, spritesheets: Spritesheet[], scale: number, steps: CoreStep[], currentStepIndex: number = 0) {
        super(app, spritesheets, scale);
        this.steps = steps;
        this.currentStepIndex = currentStepIndex;
    }

    public draw(): void {
        const step = this.steps[this.currentStepIndex];
        if (!step) {
            throw new Error("Invalid step index");
        }

        const width = this.app.screen.width * 0.5;
        const height = this.app.screen.height * 0.5;
        const padding = 18;
        const coreInterface = this.createCenteredContainer(width, height, "dark_frame", 4);

        const viewport = new Container();
        const viewportX = padding;
        const viewportY = padding;
        const viewportW = width - padding * 2 - 40;
        const viewportH = height - padding * 2;

        viewport.x = viewportX;
        viewport.y = viewportY;
        viewport.width = viewportW;
        viewport.height = viewportH;
        coreInterface.addChild(viewport);

        const maskG = new Graphics();
        maskG.beginFill(0xff0000);
        maskG.drawRect(0, 0, viewportW, viewportH);
        maskG.endFill();
        maskG.x = viewport.x;
        maskG.y = viewport.y;
        coreInterface.addChild(maskG);
        viewport.mask = maskG;

        // holds the list of rows and title
        const content = new Container();
        viewport.addChild(content);

        const titleText = new Text({
            text: `Etape ${step.stepNumber}`,
            style: {
                fill: '#ffffff',
                fontSize: 32,
                fontFamily: 'Jersey',
                stroke: '#000000',
            },
        });
        titleText.x = (viewportW - titleText.width) / 2;
        content.addChild(titleText);

        for (let i = 0; i < step.items.length; ++i) {
            const row = new Container();

            const item = step.items[i];
            const itemSprite = new Sprite(findTexture(this.spritesheets, "light_square"));
            itemSprite.width = itemSprite.height = Math.round(this.scale * 1.05);
            row.addChild(itemSprite);
            this.drawItem({spriteName: item.spriteName, quantity: item.goal}, itemSprite, false, false);
            const progressText = new Text({
                text: `${item.spriteName.replace(/_/g, ' ').toUpperCase()}\n${item.currentGathered} / ${item.goal}`,
                style: {
                    fill: '#ffffff',
                    fontSize: 12,
                    fontFamily: 'Jersey',
                    stroke: '#000000',
                },
            });
            progressText.x = itemSprite.x + itemSprite.width + 12;
            progressText.y = itemSprite.y + (itemSprite.height - progressText.height) / 2;
            row.addChild(progressText);

            const barWidth = this.scale * 2;
            const barHeight = this.scale / 4;
            const barX = progressText.x;
            const barY = itemSprite.y + itemSprite.height - barHeight;
            const progressBarBg = new Graphics();
            progressBarBg.beginFill(0x555555);
            progressBarBg.drawRect(barX, barY, barWidth, barHeight);
            progressBarBg.endFill();
            row.addChild(progressBarBg);

            const progress = Math.min(1, item.currentGathered / item.goal);
            const progressBar = new Graphics();
            progressBar.beginFill(0xe42d38);
            progressBar.drawRect(barX, barY, barWidth * progress, barHeight);
            progressBar.endFill();
            row.addChild(progressBar);

            row.y = i * (itemSprite.height + 12) + titleText.height + padding;
            row.x = (viewportW - row.width) / 2;

            content.addChild(row);
        }

        const contentHeight = content.getLocalBounds().height + padding;
        const scrollbarX = coreInterface.width - padding - 40;
        const scrollbarY = padding;
        const scrollbarW = 18;
        const scrollbarH = height - padding * 2;

        new ScrollBar(content, contentHeight, viewportH, coreInterface, scrollbarX, scrollbarY, scrollbarW, scrollbarH, this.app);
    }
}

export class ItemBar extends BaseInterface {
    private items: Item[];

    constructor(app: Application, spritesheets: Spritesheet[], scale: number, items: Item[]) {
        super(app, spritesheets, scale);
        this.items = items;
    }

    public draw(): void {
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

            this.drawItem(this.items[i], lightSquare, true, false);

            lightSquare.interactive = true;
            lightSquare.on('pointerdown', () => {
                //TODO manage item bar click
                console.log(`Clicked on bar item slot ${i + 1}`);
            });
            itemBar.addChild(lightSquare);
        }
    }
}

