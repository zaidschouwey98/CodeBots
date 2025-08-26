import * as PIXI from "pixi.js";
import Tile from "../world/tile";
import { World } from "../world/world";
import { TileType } from "../types/tile_type";
import { TileContentType } from "../types/tile_content_type";
import { ResourceType } from "../types/resource_type";
import { TextureName, findTexture, getSpritesheets } from "../spritesheet_atlas";


export class WorldRenderer {
    public container: PIXI.Container;
    private tileContainer: PIXI.Container;
    private contentContainer: PIXI.Container;
    private world: World;
    private tileSize: number;
    spriteMap: Map<Tile, PIXI.Sprite> = new Map();

    constructor(world: World, tileSize = 16) {
        this.world = world
        this.container = new PIXI.Container();
        this.tileContainer = new PIXI.Container();
        this.contentContainer = new PIXI.Container();
        this.tileContainer.sortableChildren = false;
        this.contentContainer.sortableChildren = true;
        this.container.addChild(this.tileContainer);
        this.container.addChild(this.contentContainer);
        this.tileSize = tileSize;
    }

    async initialize() {
        this.renderChunk(0, 0);
        this.renderChunk(0, 1);
        this.renderChunk(0, 2);
        this.renderChunk(0, 3);

        this.renderChunk(0, 0);
        this.renderChunk(1, 0);
        this.renderChunk(2, 0);
        this.renderChunk(3, 0);

        this.renderChunk(0, 0);
        this.renderChunk(1, 1);
        this.renderChunk(2, 2);
        this.renderChunk(3, 3);
        ///

        this.renderChunk(1, 2);
        this.renderChunk(1, 3);
        this.renderChunk(2, 3);

        this.renderChunk(2, 1);
        this.renderChunk(3, 1);
        this.renderChunk(3, 2);

    }

    async renderChunk(cx: number, cy: number) {
        const chunk = this.world.getChunk(cx, cy);

        for (let y = 0; y < chunk.size; y++) {
            for (let x = 0; x < chunk.size; x++) {
                const tile = chunk.tiles[y][x];


                if (!this.spriteMap.has(tile)) {
                    const sprite = await this.getTextureForTile(tile);
                    sprite.x = (cx * chunk.size + x) * this.tileSize + this.tileSize / 2;
                    sprite.y = (cy * chunk.size + y) * this.tileSize + this.tileSize / 2;
                    this.tileContainer.addChild(sprite);
                    this.spriteMap.set(tile, sprite);
                    sprite.zIndex = sprite.y;

                    // const debugText = new PIXI.Text(tile.noiseValue?.toFixed(1) ?? "?", {
                    //     fontSize: 6,
                    //     fill: 0xffffff,
                    //     stroke: 0x000000,

                    //     fontFamily: "monospace",

                    // });
                    // debugText.anchor.set(0.5);
                    // debugText.x = sprite.x + this.tileSize / 2;
                    // debugText.y = sprite.y + this.tileSize / 2;
                    // debugText.roundPixels = true;

                    // this.container.addChild(debugText);
                }

                if (tile.content) {
                    const occSprite = new PIXI.Sprite(await this.getTextureForContent(tile.content.tileContentType));
                    occSprite.anchor.set(0.5, 1);
                    occSprite.x = (cx * chunk.size + x) * this.tileSize + this.tileSize / 2;
                    occSprite.y = (cy * chunk.size + y) * this.tileSize + this.tileSize;
                    occSprite.zIndex = occSprite.y;
                    this.contentContainer.addChild(occSprite);;
                } else {
                    if(this.world.generator.getPseudoRandomGenerator()() < 0.93){
                        continue;
                    }
                    const occSprite = new PIXI.Sprite(await this.getTextureForDecoration(tile));

                    occSprite.anchor.set(0.5, 1);
                    occSprite.x = (cx * chunk.size + x) * this.tileSize + this.tileSize / 2;
                    occSprite.y = (cy * chunk.size + y) * this.tileSize + this.tileSize;
                    occSprite.zIndex = occSprite.y;
                    this.contentContainer.addChild(occSprite);;
                }
            }
        }
    }

    async getTextureForTile(tile: Tile): Promise<PIXI.Sprite> {
        const spriteSheets = await getSpritesheets();
        findTexture(spriteSheets, "grass_1")
        switch (tile.type) {
            case TileType.GRASS: {
                const grassTypes: TextureName[] = ["grass_1", "grass_2", "grass_3", "grass_4"];
                const spriteIndex = Math.floor(tile.variation * grassTypes.length);
                const sprite = new PIXI.Sprite(findTexture(spriteSheets, grassTypes[spriteIndex]));
                sprite.anchor.set(0.5, 0.5);
                return sprite;
            }
            case TileType.FOREST: {
                const neighbors = this.world.getTileNeighborsByDirection(tile.absX, tile.absY);
                const forestEdgeTypes: TextureName[] = ["forest_edge_1", "forest_edge_2", "forest_edge_3"];
                let textureName: TextureName;
                let rotation = 0;

                if(neighbors.left?.type !== TileType.FOREST && neighbors.top?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST){
                    textureName = "forest_one_edge"; rotation = 0;
                }
                if(neighbors.left?.type !== TileType.FOREST && neighbors.top?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST){
                    textureName = "forest_one_edge"; rotation = 90;
                }
                if(neighbors.top?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST){
                    textureName = "forest_one_edge"; rotation = 180;
                }
                if(neighbors.left?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST){
                    textureName = "forest_one_edge"; rotation = 270;
                }else




                if (neighbors.left?.type !== TileType.FOREST && neighbors.top?.type !== TileType.FOREST) {
                    textureName = "forest_right_edge"; rotation = 0;
                }
                else if (neighbors.top?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST) {
                    textureName = "forest_right_edge"; rotation = 90;
                }
                else if (neighbors.right?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST) {
                    textureName = "forest_left_edge"; rotation = 270;
                }
                else if (neighbors.bottom?.type !== TileType.FOREST && neighbors.left?.type !== TileType.FOREST) {
                    textureName = "forest_left_edge"; rotation = 0;
                }

                else if (neighbors.left?.type !== TileType.FOREST) {
                    textureName = forestEdgeTypes[Math.floor(tile.variation * forestEdgeTypes.length)];
                    rotation = 0;
                }
                else if (neighbors.top?.type !== TileType.FOREST) {
                    textureName = forestEdgeTypes[Math.floor(tile.variation * forestEdgeTypes.length)];
                    rotation = 90;
                }
                else if (neighbors.right?.type !== TileType.FOREST) {
                    textureName = forestEdgeTypes[Math.floor(tile.variation * forestEdgeTypes.length)];
                    rotation = 180;
                }
                else if (neighbors.bottom?.type !== TileType.FOREST) {
                    textureName = forestEdgeTypes[Math.floor(tile.variation * forestEdgeTypes.length)];
                    rotation = 270;
                }

                else {
                    const forestTypes: TextureName[] = ["forest_center_1", "forest_center_2"];
                    textureName = forestTypes[Math.floor(tile.variation * forestTypes.length)];
                    rotation = 0;
                }

                const texture = findTexture(spriteSheets, textureName);
                const sprite = new PIXI.Sprite(texture);

                // rotation autour du centre
                sprite.anchor.set(0.5, 0.5);
                sprite.rotation = rotation * (Math.PI / 180);

                return sprite;
            }

            default: return new PIXI.Sprite(findTexture(spriteSheets, "axe"))
        }
    }

    async getTextureForContent(content: TileContentType): Promise<any> {
        const spriteSheets = await getSpritesheets();
        switch (content) {
            case ResourceType.WOOD: return findTexture(spriteSheets, "tree_1");
            case ResourceType.STONE: return findTexture(spriteSheets, "stone");
            case ResourceType.COPPER: return findTexture(spriteSheets, "copper");
            case ResourceType.IRON: return findTexture(spriteSheets, "iron");
            default: return findTexture(spriteSheets, "axe")
        }
    }

    async getTextureForDecoration(tile: Tile): Promise<any> {
        const spriteSheets = await getSpritesheets();
        const variation = tile.variation;
        const flowerVariants: TextureName[] = ["flower_1", "flower_2", "flower_3", "bush_1","bush_2","bush_3"];
        const spriteIndex = Math.floor(variation * flowerVariants.length);
        return findTexture(spriteSheets, flowerVariants[spriteIndex]);
    }


}
