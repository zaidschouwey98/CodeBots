import * as PIXI from "pixi.js";
import Tile from "../world/tile";
import { World } from "../world/world";
import { TileType } from "../types/tile_type";
import { ResourceType } from "../types/resource_type";
import { TextureName, findAnimation, findTexture, getSpritesheets } from "../spritesheet_atlas";
import { DecorationType } from "../types/decoration_type";
import { ANIMATION_SPEED, RENDER_DISTANCE, TILE_SIZE } from "../constants";
import { Chunk } from "../world/chunk";
import { Entity } from "../entity/entity";


export class WorldRenderer {
    public container: PIXI.Container;
    private spriteSheet: PIXI.Spritesheet<{
        meta: {
            image: string;
            format: string;
            size: {
                w: number;
                h: number;
            };
            scale: number;
        };
        frames: {};
    }>[];
    private tileContainer: PIXI.Container;
    private contentContainer: PIXI.Container;
    private foregroundContainer: PIXI.Container;
    private entityContainer: PIXI.Container;
    private chunkContent: Map<string, PIXI.Sprite[]> = new Map();
    private currentlyRenderingChunks: Set<string> = new Set();
    private world: World;
    spriteMap: Map<Tile, PIXI.Sprite> = new Map();

    constructor(world: World) {
        this.world = world;
        this.container = new PIXI.Container();
        this.tileContainer = new PIXI.Container();
        this.contentContainer = new PIXI.Container();
        this.foregroundContainer = new PIXI.Container();
        this.entityContainer = new PIXI.Container();

        this.tileContainer.sortableChildren = false;
        this.contentContainer.sortableChildren = true;
        this.foregroundContainer.sortableChildren = true;

        this.container.addChild(this.tileContainer);
        this.container.addChild(this.contentContainer);
        this.container.addChild(this.entityContainer);
        this.container.addChild(this.foregroundContainer);

    }

    async initialize() {
        this.spriteSheet = await getSpritesheets();
    }

    public async render(chunks: Chunk[]) {
        const newChunkKeys = new Set(chunks.map(c => c.key));

        // 1. Unload ceux qui ne sont plus dans newChunkKeys
        for (const key of this.currentlyRenderingChunks) {
            if (!newChunkKeys.has(key)) {
                const [cx, cy] = key.split("_").map(Number);
                this.unloadChunk(cx, cy);
                this.currentlyRenderingChunks.delete(key);
            }
        }

        // 2. Render ceux qui sont nouveaux
        for (const chunk of chunks) {
            if (!this.currentlyRenderingChunks.has(chunk.key)) {
                this.currentlyRenderingChunks.add(chunk.key);
                this.renderChunk(chunk);
            }
        }
    }

    private async unloadChunk(cx: number, cy: Number) {
        let sprites = this.chunkContent.get(`${cx}_${cy}`);
        sprites?.map((s) => { s.destroy() });
        this.chunkContent.delete(`${cx}_${cy}`)
    }

    private async renderChunk(chunk: Chunk, batchSize = 8): Promise<void> {
        const spriteArr: PIXI.Sprite[] = [];
        let y = 0;
        let x = 0;

        // Fonction pour créer un sprite d’une tile
        const createTileSprite = async (tile: Tile, tileContainer: PIXI.Container, contentContainer: PIXI.Container, cx: number, cy: number) => {
            const sprite = await this.getTextureForTile(tile);
            sprite.anchor.set(0.5, 0.5);
            sprite.x = (cx * chunk.size + x) * TILE_SIZE + TILE_SIZE / 2;
            sprite.y = (cy * chunk.size + y) * TILE_SIZE + TILE_SIZE / 2;
            sprite.zIndex = sprite.y;
            sprite.roundPixels = true;
            tileContainer.addChild(sprite);
            spriteArr.push(sprite);
            // Contenu / décoration
            if (tile.content) {
                const occSprite = await this.getTextureForContent(tile);
                occSprite.anchor.set(0.5, 1);
                occSprite.x = sprite.x;
                occSprite.y = (cy * chunk.size + y) * TILE_SIZE + TILE_SIZE;
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
                        await createTileSprite(chunk.tiles[y][x], this.tileContainer, this.contentContainer, chunk.cx, chunk.cy);
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
                this.chunkContent.set(chunk.key, spriteArr);
                resolve(); // tout le chunk est rendu
            };
            step();
        });
    }

    public renderEntity(entity: Entity) {
        const animation = findAnimation(this.spriteSheet, entity.getAnimationName());
        if (!animation) {
            throw new Error("animation not found");
        }

        const sprite = new PIXI.AnimatedSprite(animation);
        sprite.animationSpeed = ANIMATION_SPEED;
        sprite.play();

        // sprite.anchor.set(0.5, 1); // les pieds posés sur le sol
        // bas du sprite = bas du tile
        sprite.zIndex = sprite.y; // pour le tri avec les autres objets
        sprite.updateTransform({x: entity.posX, y: entity.posY});
        sprite.x = entity.posX;
        sprite.y = entity.posY;
        this.entityContainer.addChild(sprite);

        entity.observe((state) => {
            sprite.x = state.posX;
            sprite.y = state.posY;

            if (entity.isAnimated()) {
                sprite.play();
            } else {
                sprite.stop();
            }
        });
    }

    private async getTextureForTile(tile: Tile): Promise<PIXI.Sprite> {

        switch (tile.type) {
            case TileType.GRASS: {
                const grassTypes: TextureName[] = ["grass_1", "grass_2", "grass_3", "grass_4"];
                const spriteIndex = Math.floor(tile.variation * grassTypes.length);
                const sprite = new PIXI.Sprite(findTexture(this.spriteSheet, grassTypes[spriteIndex]));
                sprite.anchor.set(0.5, 0.5);
                return sprite;
            }
            case TileType.FOREST: {
                const neighbors = this.world.getTileNeighborsByDirection(tile.absX, tile.absY);
                const forestEdgeTypes: TextureName[] = ["forest_edge_1", "forest_edge_2", "forest_edge_3"];
                let textureName: TextureName;
                let rotation = 0;
                if (neighbors.left?.type !== TileType.FOREST && neighbors.top?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST) {
                    textureName = "forest_0_edge"; rotation = 0;
                }
                else if (neighbors.left?.type !== TileType.FOREST && neighbors.top?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST) {
                    textureName = "forest_one_edge"; rotation = 0;
                }
                else if (neighbors.left?.type !== TileType.FOREST && neighbors.top?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST) {
                    textureName = "forest_one_edge"; rotation = 90;
                }
                else if (neighbors.top?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST) {
                    textureName = "forest_one_edge"; rotation = 180;
                }
                else if (neighbors.left?.type !== TileType.FOREST && neighbors.bottom?.type !== TileType.FOREST && neighbors.right?.type !== TileType.FOREST) {
                    textureName = "forest_one_edge"; rotation = 270;
                } else




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

                const texture = findTexture(this.spriteSheet, textureName);
                const sprite = new PIXI.Sprite(texture);

                // rotation autour du centre
                sprite.anchor.set(0.5, 0.5);
                sprite.rotation = rotation * (Math.PI / 180);

                return sprite;
            }

            default: return new PIXI.Sprite(findTexture(this.spriteSheet, "axe"))
        }
    }

    private async getTextureForContent(tile: Tile): Promise<PIXI.Sprite> {
        switch (tile.content?.tileContentType) {
            case ResourceType.WOOD: {
                const treeTypes: TextureName[] = ["tree_1", "tree_2", "tree_3", "tree_4"];
                const spriteIndex = Math.floor(tile.variation * treeTypes.length);
                const sprite = new PIXI.Sprite(findTexture(this.spriteSheet, treeTypes[spriteIndex]));
                return sprite;
            };
            case ResourceType.STONE: return new PIXI.Sprite(findTexture(this.spriteSheet, "stone"));
            case ResourceType.COPPER: return new PIXI.Sprite(findTexture(this.spriteSheet, "copper"));
            case ResourceType.IRON: return new PIXI.Sprite(findTexture(this.spriteSheet, "iron"));
            default: return new PIXI.Sprite(findTexture(this.spriteSheet, "axe"));
        }
    }

    private async getTextureForDecoration(tile: Tile): Promise<PIXI.Sprite> {
        switch (tile.decoration) {
            case DecorationType.BUSH: {
                const bushTypes: TextureName[] = ["bush_1", "bush_2", "bush_3"];
                const spriteIndex = Math.floor(tile.variation * bushTypes.length);
                const sprite = new PIXI.Sprite(findTexture(this.spriteSheet, bushTypes[spriteIndex]));
                sprite.anchor.set(0.5, 0.5);
                return sprite;
            }
            case DecorationType.FLOWER: {
                const flowerTypes: TextureName[] = ["flower_1", "flower_2", "flower_3"];
                const spriteIndex = Math.floor(tile.variation * flowerTypes.length);
                const sprite = new PIXI.Sprite(findTexture(this.spriteSheet, flowerTypes[spriteIndex]));
                sprite.anchor.set(0.5, 0.5);
                return sprite;
            }
            default: return new PIXI.Sprite(findTexture(this.spriteSheet, "axe"));
        }
    }


}
