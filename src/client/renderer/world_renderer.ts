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
import { Player } from "../entity/player";


export class WorldRenderer {
    public container: PIXI.Container;
    public gameContainer: PIXI.Container;
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
    private tileLayer: PIXI.Container;
    private overTileLayer: PIXI.Container;
    private middleLayer: PIXI.Container;
    private foregroundLayer: PIXI.Container;
    private hudContainer: PIXI.Container;
    private chunkContent: Map<string, PIXI.Sprite[]> = new Map();
    private currentlyRenderingChunks: Set<string> = new Set();
    private world: World;
    spriteMap: Map<Tile, PIXI.Sprite> = new Map();

    constructor(world: World) {
        this.world = world;
        this.container = new PIXI.Container();
        this.gameContainer = new PIXI.Container();
        this.tileLayer = new PIXI.Container();
        this.overTileLayer = new PIXI.Container();
        this.middleLayer = new PIXI.Container();
        this.foregroundLayer = new PIXI.Container();
        this.hudContainer = new PIXI.Container();
        this.tileLayer.sortableChildren = false;
        this.middleLayer.sortableChildren = true;
        this.foregroundLayer.sortableChildren = true;
        this.container.addChild(this.gameContainer);
        this.gameContainer.addChild(this.tileLayer);
        this.gameContainer.addChild(this.overTileLayer);
        this.gameContainer.addChild(this.middleLayer);
        this.gameContainer.addChild(this.foregroundLayer);
        this.container.addChild(this.hudContainer);
    }

    async initialize() {
        this.spriteSheet = await getSpritesheets();
    }

    public printDebugGrid() {
        const grid = new PIXI.Graphics();

        const cols = 100;
        const rows = 100;

        for (let i = -cols; i <= cols; i++) {
            grid.moveTo(i * TILE_SIZE, -rows * TILE_SIZE);
            grid.lineTo(i * TILE_SIZE, rows * TILE_SIZE);
        }

        for (let j = -rows; j <= rows; j++) {
            grid.moveTo(-rows * TILE_SIZE, j * TILE_SIZE);
            grid.lineTo(cols * TILE_SIZE, j * TILE_SIZE);
        }

        grid.stroke({
            width: 1,
            color: 0xffffff,
            alpha: 0.5,
        });

        this.foregroundLayer.addChild(grid);
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

    public renderPlayerCoordinate(player: Player) {
        const getTextFromCoordinate = (player: Player) => `x: ${Math.round(player.posX)}, y: ${Math.round(player.posY)}`

        document.fonts.ready.then(() => {
            const coordinateText = new PIXI.Text({
                text: getTextFromCoordinate(player),
                style: {
                    fontFamily: `"Jersey 10", sans-serif`,
                    fontWeight: "400",
                    fontStyle: "normal",
                    fontSize: 40,
                    fill: "#73946b",
                    stroke: {
                        color: "white",
                        width: 2,
                    },
                },
            });

            coordinateText.x = 10;
            coordinateText.y = 10;

            player.observe(() => {
                coordinateText.text = getTextFromCoordinate(player);
            });

            this.hudContainer.addChild(coordinateText);
        });
    }

    public renderEntity(entity: Entity) {
        const animation = findAnimation(this.spriteSheet, entity.getAnimationName());
        if (!animation) {
            throw new Error("animation not found");
        }

        const sprite = new PIXI.AnimatedSprite(animation);
        sprite.animationSpeed = ANIMATION_SPEED;
        sprite.anchor.set(0, 1);
        sprite.play();
        sprite.x = entity.posX * TILE_SIZE;
        sprite.y = entity.posY * TILE_SIZE + TILE_SIZE;
        sprite.zIndex = sprite.y;

        this.middleLayer.addChild(sprite);
        let animationName = entity.getAnimationName();
        entity.observe((state) => {
            sprite.zIndex = sprite.y;
            if (animationName !== entity.getAnimationName()) {
                sprite.textures = findAnimation(this.spriteSheet, entity.getAnimationName())!;
                animationName = entity.getAnimationName();
            }

            sprite.x = state.posX * TILE_SIZE;
            sprite.y = state.posY * TILE_SIZE + TILE_SIZE;

            if (entity.isAnimated()) {
                sprite.play();
            } else {
                sprite.stop();
            }
        });
    }

    private async unloadChunk(cx: number, cy: Number) {
        let sprites = this.chunkContent.get(`${cx}_${cy}`);
        sprites?.map((s) => { s.destroy() });
        this.chunkContent.delete(`${cx}_${cy}`)
    }

    private async renderChunk(chunk: Chunk) {

        if (!this.chunkContent.has(chunk.key)) {
            this.chunkContent.set(chunk.key, []);
        }

        for (let y = 0; y < chunk.size; y++) {
            for (let x = 0; x < chunk.size; x++) {
                const tile = chunk.tiles[y][x];
                this.getTextureForTile(tile, chunk, x, y);

                if (tile.content) {
                    this.getTextureForMiddleLayer(tile, chunk, x, y);

                } else if (tile.decoration != null) {
                    this.getTextureForDecoration(tile, chunk, x, y);
                }
            }
        }
    }

    private getTextureForTile(tile: Tile, chunk: Chunk, x: number, y: number) {
        let sprite: PIXI.Sprite;
        switch (tile.type) {
            case TileType.GRASS: {
                const grassTypes: TextureName[] = ["grass_1", "grass_2", "grass_3", "grass_4"];
                const spriteIndex = Math.floor(tile.variation * grassTypes.length);
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, grassTypes[spriteIndex]));
                sprite.anchor.set(0.5, 0.5);
                break;
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
                sprite = new PIXI.Sprite(texture);

                // rotation autour du centre
                sprite.anchor.set(0.5, 0.5);
                sprite.rotation = rotation * (Math.PI / 180);
                break;
            }
        }
        sprite.roundPixels = true;
        sprite.x = (chunk.cx * chunk.size + x) * TILE_SIZE + TILE_SIZE / 2;
        sprite.y = (chunk.cy * chunk.size + y) * TILE_SIZE + TILE_SIZE / 2;
        this.tileLayer.addChild(sprite);
        this.chunkContent.get(chunk.key)?.push(sprite);
        sprite.zIndex = sprite.y;
    }

    private getTextureForMiddleLayer(tile: Tile, chunk: Chunk, x: number, y: number) {
        let sprite: PIXI.Sprite;
        let offsetY = 0;
        switch (tile.content?.tileContentType) {
            case ResourceType.WOOD: {
                const treeTypes: TextureName[] = ["tree_1", "tree_2", "tree_3", "tree_4"];
                const spriteIndex = Math.floor(tile.variation * treeTypes.length);
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, treeTypes[spriteIndex]));
                this.middleLayer.addChild(sprite);
                offsetY = -2;
                break;

            };
            case ResourceType.STONE:  {
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, "stone"))
                this.overTileLayer.addChild(sprite);
                break;
            };
            case ResourceType.COPPER:  {
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, "copper"))
                this.overTileLayer.addChild(sprite);
                break;
            };
            case ResourceType.IRON:  {
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, "iron"))
                this.overTileLayer.addChild(sprite);
                break;
            };
            default: {
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, "axe"));
                this.middleLayer.addChild(sprite);
                break;
            }
        }

        sprite.anchor.set(0.5, 1);
        sprite.roundPixels = true;
        sprite.x = (chunk.cx * chunk.size + x) * TILE_SIZE + TILE_SIZE / 2;
        sprite.y = (chunk.cy * chunk.size + y) * TILE_SIZE + TILE_SIZE + offsetY;

        this.chunkContent.get(chunk.key)?.push(sprite);
        sprite.zIndex = sprite.y;
    }



    private getTextureForDecoration(tile: Tile, chunk:Chunk, x:number, y:number){
        let sprite: PIXI.Sprite;
        switch (tile.decoration) {
            case DecorationType.BUSH: {
                const bushTypes: TextureName[] = ["bush_1", "bush_2", "bush_3"];
                const spriteIndex = Math.floor(tile.variation * bushTypes.length);
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, bushTypes[spriteIndex]));
                sprite.anchor.set(0.5, 0.7);
                this.middleLayer.addChild(sprite);
                break;
            }
            case DecorationType.FLOWER: {
                const flowerTypes: TextureName[] = ["flower_1", "flower_2", "flower_3"];
                const spriteIndex = Math.floor(tile.variation * flowerTypes.length);
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, flowerTypes[spriteIndex]));
                sprite.anchor.set(0.5, 0.5);
                this.overTileLayer.addChild(sprite);
                break;
            }
            default: {
                sprite = new PIXI.Sprite(findTexture(this.spriteSheet, "flower_1"));
                sprite.anchor.set(0.5, 0.5);
            }
        }

        sprite.roundPixels = true;
        sprite.x = (chunk.cx * chunk.size + x) * TILE_SIZE + TILE_SIZE / 2;
        sprite.y = (chunk.cy * chunk.size + y) * TILE_SIZE + TILE_SIZE / 2;
        this.chunkContent.get(chunk.key)?.push(sprite);
        sprite.zIndex = sprite.y;
    }


}
