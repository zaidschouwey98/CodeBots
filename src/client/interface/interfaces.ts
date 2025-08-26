// interfaces.ts
import {
    Application,
    Container,
    ContainerChild,
    Graphics,
    NineSliceSprite,
    Sprite,
    Spritesheet,
    Text
} from 'pixi.js';
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

            lightSquare.interactive = true;
            lightSquare.on('pointerdown', () => {
                //TODO manage item bar click
                console.log(`Clicked on bar item slot ${i + 1}`);
            });
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

            darkSquare.interactive = true;
            darkSquare.on('pointerdown', () => {
                //TODO manage chest item click
                console.log(`Clicked on chest item slot ${i + 1}`);
            });

            this.drawItem(items[i], darkSquare);
            chestInventory.addChild(darkSquare);
        }
    }

    /**
     * Draws a crafting interface at the center of the screen.
     * @param recipes
     */
    public drawCraftingInterface = (recipes: Recipe[]) => {
        // window size
        const craftingWidth = this.app.screen.width * 0.5;
        const craftingHeight = this.app.screen.height * 0.5;
        const craftingInterface = this.createCenteredContainer(craftingWidth, craftingHeight, "dark_frame", 4);

        // paddings & layout
        const padding = 18;
        const rowHeight = Math.max(56, Math.round(this.scale * 1.05)); // vertical space per recipe
        const vGap = 12;
        const leftOutputSize = Math.round(this.scale * 1.05); // big left output slot
        const smallSlotSize = Math.round(this.scale * 0.85);  // small input slots
        const smallSlotsPerRow = 4;
        const hGap = 12;

        // compute viewport (the visible area that will be clipped)
        const viewportX = padding;
        const viewportY = padding;
        const viewportW = craftingWidth - padding * 3 - 22; // leave space for scrollbar on right
        const viewportH = craftingHeight - padding * 2;

        // container that will be the area where rows are shown
        const viewport = new Container();
        viewport.x = viewportX;
        viewport.y = viewportY;
        viewport.width = viewportW;
        viewport.height = viewportH;
        craftingInterface.addChild(viewport);

        // mask to clip content to viewport rectangle
        const maskG = new Graphics();
        maskG.beginFill(0xff0000);
        maskG.drawRect(0, 0, viewportW, viewportH);
        maskG.endFill();
        maskG.x = viewport.x;
        maskG.y = viewport.y;
        craftingInterface.addChild(maskG);
        viewport.mask = maskG;

        // content container (holds the list of rows). We'll move content.y for scrolling.
        const content = new Container();
        viewport.addChild(content);

        // create a subtle background stripe like your screenshot
        const stripe = new Graphics();
        stripe.beginFill(0x000000, 0.05);
        stripe.drawRect(0, 0, viewportW, viewportH);
        stripe.endFill();
        stripe.x = 0;
        stripe.y = 0;
        viewport.addChildAt(stripe, 0);

        // compute content height
        const totalRows = recipes.length;
        const contentHeight = totalRows * (rowHeight + vGap);

        // leftStartX: where the small slots begin relative to content (after the output slot)
        const leftStartX = 6 + leftOutputSize + 6;

        // Build rows
        for (let i = 0; i < recipes.length; i++) {
            const recipe = recipes[i];
            const row = new Container();
            row.y = i * (rowHeight + vGap);
            content.addChild(row);

            // optional alternating row background
            if ((i % 2) === 1) {
                const bg = new Graphics();
                bg.beginFill(0x000000, 0.03);
                bg.drawRect(0, 0, viewportW, rowHeight);
                bg.endFill();
                row.addChild(bg);
            }

            // big output slot on left
            const outSprite = new Sprite(findTexture(this.spritesheets, "light_square"));
            outSprite.width = leftOutputSize;
            outSprite.height = leftOutputSize;
            outSprite.x = 6; // small left margin within the content
            outSprite.y = (rowHeight - leftOutputSize) / 2;
            outSprite.interactive = true;
            row.addChild(outSprite);
            this.drawItem(recipe.output, outSprite);

            // output selection border
            const outBorder = new Graphics();
            outBorder.lineStyle(4, 0xd82a2a);
            outBorder.drawRect(2, 2, outSprite.width - 4, outSprite.height - 4);
            outBorder.x = outSprite.x;
            outBorder.y = outSprite.y;
            outBorder.visible = false;
            row.addChild(outBorder);

            outSprite.on('pointerdown', () => {
                // hide all borders
                content.children.forEach((r: any) => {
                    r.children.forEach((c: any) => {
                        if (c instanceof Graphics && (c as any).__isBorder) c.visible = false;
                    });
                });
                outBorder.visible = true;
            });

            // small input slots
            for (let s = 0; s < smallSlotsPerRow; s++) {
                const sx = leftStartX + s * (smallSlotSize + hGap);
                const slotSprite = new Sprite(findTexture(this.spritesheets, "light_square"));
                slotSprite.width = smallSlotSize;
                slotSprite.height = smallSlotSize;
                slotSprite.x = sx;
                slotSprite.y = (rowHeight - smallSlotSize) / 2;
                slotSprite.interactive = true;

                const item = recipe.inputs[s] ?? null;
                this.drawItem(item, slotSprite);

                row.addChild(slotSprite);

                // selection border for this slot
                const border = new Graphics();
                border.lineStyle(4, 0xd82a2a);
                border.drawRect(2, 2, slotSprite.width - 4, slotSprite.height - 4);
                border.x = slotSprite.x;
                border.y = slotSprite.y;
                border.visible = false;
                (border as any).__isBorder = true;
                row.addChild(border);

                slotSprite.on('pointerdown', () => {
                    // hide all borders
                    content.children.forEach((r: any) => {
                        r.children.forEach((c: any) => {
                            if (c instanceof Graphics && (c as any).__isBorder) c.visible = false;
                        });
                    });
                    border.visible = true;
                });
            }

            // recipe name text (to the right of small slots)
            const nameText = new Text(recipe.output ? recipe.output.spriteName : `Item ${i + 1}`, {
                fontFamily: 'Jersey',
                fontSize: 14,
                fill: 0x1e1514
            });
            nameText.x = leftStartX + smallSlotsPerRow * (smallSlotSize + hGap) + 8;
            nameText.y = (rowHeight / 2) - (nameText.height / 2);
            row.addChild(nameText);
        }

        // SCROLLBAR
        const scrollbarX = viewport.x + viewportW + 8;
        const scrollbarY = viewport.y;
        const scrollbarW = 18;
        const scrollbarH = viewportH;

        // track
        const track = new Graphics();
        track.beginFill(0x2b2b34);
        track.drawRoundedRect(scrollbarX, scrollbarY, scrollbarW, scrollbarH, 6);
        track.endFill();
        craftingInterface.addChild(track);

        // thumb graphics
        const thumb = new Graphics();
        craftingInterface.addChild(thumb);
        const thumbStroke = new Graphics();
        craftingInterface.addChild(thumbStroke);

        const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(v, b));
        let scrollY = 0;

        function updateThumb() {
            const ratio = Math.min(1, viewportH / Math.max(1, contentHeight));
            const thumbH = Math.max(28, scrollbarH * ratio);
            const maxThumbTop = scrollbarY + scrollbarH - thumbH;
            const scrollRatio = scrollY / Math.max(1, contentHeight - viewportH);
            const top = scrollbarY + scrollRatio * (scrollbarH - thumbH);

            thumb.clear();
            thumb.beginFill(0x222533);
            thumb.drawRoundedRect(scrollbarX + 4, top + 4, scrollbarW - 8, thumbH - 8, 4);
            thumb.endFill();

            thumbStroke.clear();
            thumbStroke.lineStyle(2, 0x3f4650);
            thumbStroke.drawRect(scrollbarX + 5, top + 6, scrollbarW - 10, thumbH - 12);

            // store thumb geometry for hit-testing
            (thumb as any).__top = top;
            (thumb as any).__height = thumbH;
        }

        function setScrollY(v: number) {
            scrollY = clamp(v, 0, Math.max(0, contentHeight - viewportH));
            content.y = -scrollY;
            updateThumb();
        }

        updateThumb();

        // dragging logic
        let dragging = false;
        let dragOffset = 0;

        thumb.interactive = true;
        thumb.on('pointerdown', (e) => {
            dragging = true;
            const point = e.data.getLocalPosition(craftingInterface);
            // use thumb's stored top (in global coords)
            const thumbTop = (thumb as any).__top ?? scrollbarY;
            dragOffset = point.y - thumbTop;
        });

        this.app.stage.on('pointermove', (e) => {
            if (!dragging) return;
            const point = e.data.getLocalPosition(craftingInterface);
            const ratio = Math.min(1, viewportH / Math.max(1, contentHeight));
            const thumbH = Math.max(28, scrollbarH * ratio);
            const thumbTopCandidate = point.y - dragOffset;
            const thumbMin = scrollbarY + 4;
            const thumbMax = scrollbarY + scrollbarH - thumbH - 4;
            const clamped = clamp(thumbTopCandidate, thumbMin, thumbMax);
            const scrollRatio = (clamped - scrollbarY) / Math.max(1, (scrollbarH - thumbH));
            setScrollY(scrollRatio * Math.max(0, contentHeight - viewportH));
        });

        const stopDrag = () => {
            dragging = false;
        };
        this.app.stage.on('pointerup', stopDrag);
        this.app.stage.on('pointerupoutside', stopDrag);

        // Mouse wheel when pointer is over the crafting interface
        let pointerIsOver = false;
        craftingInterface.interactive = true;
        craftingInterface.on('pointerover', () => pointerIsOver = true);
        craftingInterface.on('pointerout', () => pointerIsOver = false);

        const wheelHandler = (ev: WheelEvent) => {
            if (!pointerIsOver) return;
            ev.preventDefault();
            const delta = ev.deltaY;
            setScrollY(scrollY + delta);
        };
        this.app.view.addEventListener('wheel', wheelHandler, { passive: false });

        // start at top
        setScrollY(0);

        // cleanup wheel listener when the container is removed
        craftingInterface.on('removed', () => {
            try {
                this.app.view.removeEventListener('wheel', wheelHandler);
            } catch (e) { /* ignore */ }
        });
    }
}
