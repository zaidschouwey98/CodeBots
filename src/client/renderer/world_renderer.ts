import * as PIXI from "pixi.js";
import Tile from "../world/tile";
import { World } from "../world/world";
import { TileType } from "../types/tile_type";
import { TileContentType } from "../types/tile_content_type";
import { ResourceType } from "../types/resource_type";
import { TextureName, findTexture, getSpritesheets } from "../spritesheet_atlas";
import { DecorationType } from "../types/decoration_type";


export class WorldRenderer {
    public container: PIXI.Container;

    private tileContainer: PIXI.Container;
    private contentContainer: PIXI.Container;
    private foregroundContainer: PIXI.Container;
    private chunkContent: Map<string, PIXI.Sprite[]> = new Map();

    private world: World;
    private tileSize: number;
    private renderDistance:number;
    spriteMap: Map<Tile, PIXI.Sprite> = new Map();

    constructor(world: World, tileSize = 16, renderDistance = 2) {
        this.world = world;
        this.renderDistance = renderDistance;
        this.container = new PIXI.Container();
        this.tileContainer = new PIXI.Container();
        this.contentContainer = new PIXI.Container();
        this.foregroundContainer = new PIXI.Container();



        this.tileContainer.sortableChildren = false;
        this.contentContainer.sortableChildren = true;
        this.foregroundContainer.sortableChildren = true;

        this.container.addChild(this.tileContainer);
        this.container.addChild(this.contentContainer);
        this.container.addChild(this.foregroundContainer);

        this.tileSize = tileSize;
    }

    async initialize() {


    }

    public async render(cx:number,cy:number, radius = 1){
        const newVisibleChunks = new Set<string>();
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const chunkX = cx + dx;
                const chunkY = cy + dy;
                const key = `${chunkX}_${chunkY}`;
                newVisibleChunks.add(key);

                // Si le chunk n'est pas déjà rendu, le rendre
                if (!this.chunkContent.has(key)) {
                    await this.renderChunk(chunkX, chunkY);
                }
            }
        }

        // 2️⃣ Décharger les chunks qui ne sont plus visibles
        for (const key of Array.from(this.chunkContent.keys())) {
            if (!newVisibleChunks.has(key)) {
                const [chunkX, chunkY] = key.split("_").map(Number);
                this.unloadChunk(chunkX, chunkY);
            }
        }
    }

    public async unloadChunk(cx:number, cy:Number){
        let sprites = this.chunkContent.get(`${cx}_${cy}`);
        sprites?.map((s)=>{s.destroy()});
        this.chunkContent.delete(`${cx}_${cy}`)
    }

    private async renderChunk(cx: number, cy: number, batchSize = 16): Promise<void> {
        const chunk = this.world.getChunk(cx, cy);
        const chunkKey = `${cx}_${cy}`;

        const spriteArr: PIXI.Sprite[] = [];

        let y = 0;
        let x = 0;

        // Fonction pour créer un sprite d’une tile
        const createTileSprite = async (tile: Tile, tileContainer: PIXI.Container, contentContainer: PIXI.Container, cx: number, cy: number) => {
            const sprite = await this.getTextureForTile(tile);
            sprite.anchor.set(0.5, 0.5);
            sprite.x = (cx * chunk.size + x) * this.tileSize + this.tileSize / 2;
            sprite.y = (cy * chunk.size + y) * this.tileSize + this.tileSize / 2;
            sprite.zIndex = sprite.y;
            sprite.roundPixels = true;
            tileContainer.addChild(sprite);
            spriteArr.push(sprite);
            // Contenu / décoration
            if (tile.content) {
                const occSprite = new PIXI.Sprite(await this.getTextureForContent(tile.content.tileContentType));
                occSprite.anchor.set(0.5, 1);
                occSprite.x = sprite.x;
                occSprite.y = (cy * chunk.size + y) * this.tileSize + this.tileSize;
                occSprite.zIndex = occSprite.y;
                contentContainer.addChild(occSprite);
                spriteArr.push(occSprite);
            } else if (tile.decoration != null) {
                const occSprite = await this.getTextureForDecoration(tile);
                occSprite.anchor.set(0.5, 0.5);
                occSprite.x = sprite.x;
                occSprite.y = sprite.y;
                occSprite.zIndex = occSprite.y;
                contentContainer.addChild(occSprite);
                spriteArr.push(occSprite);
            }
        };

        // Fonction pour étaler le rendu sur plusieurs frames
        return new Promise<void>((resolve) => {
            const step = async () => {
                let count = 0;
                while (y < chunk.size) {
                    while (x < chunk.size) {
                        await createTileSprite(chunk.tiles[y][x], this.tileContainer, this.contentContainer, cx, cy);
                        count++;
                        x++;
                        if (count >= batchSize) {
                            requestAnimationFrame(step);
                            return;
                        }
                    }
                    x = 0;
                    y++;
                }
                this.chunkContent.set(chunkKey, spriteArr);
                resolve(); // tout le chunk est rendu
            };
            step();
        });
    }

    private async getTextureForTile(tile: Tile): Promise<PIXI.Sprite> {
        const spriteSheets = await getSpritesheets();
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
                if(neighbors.left?.type !== TileType.FOREST && neighbors.top?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST){
                    textureName = "forest_0_edge"; rotation = 0;
                }
                else if(neighbors.left?.type !== TileType.FOREST && neighbors.top?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST){
                    textureName = "forest_one_edge"; rotation = 0;
                }
                else if(neighbors.left?.type !== TileType.FOREST && neighbors.top?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST){
                    textureName = "forest_one_edge"; rotation = 90;
                }
                else if(neighbors.top?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST){
                    textureName = "forest_one_edge"; rotation = 180;
                }
                else if(neighbors.left?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST){
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

    private async getTextureForContent(content: TileContentType): Promise<any> {
        const spriteSheets = await getSpritesheets();
        switch (content) {
            case ResourceType.WOOD: return findTexture(spriteSheets, "tree_1");
            case ResourceType.STONE: return findTexture(spriteSheets, "stone");
            case ResourceType.COPPER: return findTexture(spriteSheets, "copper");
            case ResourceType.IRON: return findTexture(spriteSheets, "iron");
            default: return findTexture(spriteSheets, "axe")
        }
    }

    private async getTextureForDecoration(tile: Tile): Promise<PIXI.Sprite> {
        const spriteSheets = await getSpritesheets();
        switch(tile.decoration){
            case DecorationType.BUSH:{
                const bushTypes: TextureName[] = ["bush_1", "bush_2", "bush_3"];
                const spriteIndex = Math.floor(tile.variation * bushTypes.length);
                const sprite = new PIXI.Sprite(findTexture(spriteSheets, bushTypes[spriteIndex]));
                sprite.anchor.set(0.5, 0.5);
                return sprite;
            }
            case DecorationType.FLOWER:{
                const flowerTypes: TextureName[] = ["flower_1", "flower_2", "flower_3"];
                const spriteIndex = Math.floor(tile.variation * flowerTypes.length);
                const sprite = new PIXI.Sprite(findTexture(spriteSheets, flowerTypes[spriteIndex]));
                sprite.anchor.set(0.5, 0.5);
                return sprite;
            }
            default: return new PIXI.Sprite(findTexture(spriteSheets, "axe"));
        }
    }


}
