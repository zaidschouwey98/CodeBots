import * as PIXI from "pixi.js";
import { Player } from "./player";

export class Camera {
    public x = 0;
    public y = 0;
    public zoom = 1;

    follow(player: Player, screenWidth: number, screenHeight: number) {

        this.x = player.posX;
        this.y = player.posY;
    }

}
import { Interactable } from "../world/interactables/interactable";

export class Entity{
    public posX:number;
    public posY:number;
    public cX:number;
    public cY:number;
    public speed:number;

    constructor(){
        this.posX = 10;
        this.posY = 10;
    }

    interact(i:Interactable){

    }
}
import { Entity } from "./entity";

export class Player extends Entity{
    constructor(){
        super();

    }

    update(keys: Set<string>, delta: number) {
        const speed = 10;

    if (keys.has("w")) this.posY -= speed * delta / 60;
    if (keys.has("s")) this.posY += speed * delta / 60;
    if (keys.has("a")) this.posX -= speed * delta / 60;
    if (keys.has("d")) this.posX += speed * delta / 60;
    }
}
import { Camera } from "./entity/camera";
import { Player } from "./entity/player";
import { WorldRenderer } from "./renderer/world_renderer";
import { World } from "./world/world";
import * as PIXI from "pixi.js";
import { WorldGenerator } from "./world/world_generator";

export class GameEngine {
    public app: PIXI.Application;
    public world: World;
    public renderer: WorldRenderer;
    public camera: Camera;
    private player: Player;
    private keys: Set<string>;

    constructor(app: PIXI.Application) {
        this.app = app;
        const generator = new WorldGenerator("seed");
        this.world = new World(16, generator);
        this.renderer = new WorldRenderer(this.world);
        this.camera = new Camera();
        this.player = new Player();

        this.keys = new Set<string>();

        window.addEventListener("keydown", (e) =>
            this.keys.add(e.key.toLowerCase())
        );
        window.addEventListener("keyup", (e) =>
            this.keys.delete(e.key.toLowerCase())
        );
    }

    async initialize() {
        await this.renderer.initialize();
        this.renderer.container.x = this.app.screen.width / 2;
        this.renderer.container.y = this.app.screen.height / 2;
        this.app.stage.addChild(this.renderer.container);
    }

    update(delta: number) {
        this.player.update(this.keys, delta);
        this.camera.follow(this.player, this.app.renderer.width, this.app.renderer.height);

        this.renderer.container.x = -this.camera.x + this.app.renderer.width/2;
        this.renderer.container.y = -this.camera.y + this.app.renderer.height/2;
        // this.renderer.container.scale.set(2);
        const chunkX = Math.floor(this.player.posX / this.world.chunkSize);
        const chunkY = Math.floor(this.player.posY / this.world.chunkSize);

        // Si le joueur est dans un nouveau chunk
        if (chunkX !== this.player.cX || chunkY !== this.player.cY) {
            console.debug("Rendering new Chunks");
            this.player.cX = chunkX;
            this.player.cY = chunkY;

            // Render uniquement les chunks autour du joueur
            this.renderer.render(chunkX, chunkY);
        }
    }
}
import $ from "jquery";
import {Application, Sprite} from "pixi.js";
import WaveFunctionCollapse from "../wave_function_collapse";
import textures from "../wave_function_collapse/textures";
import {findTexture, getSpritesheets} from "../spritesheet_atlas";

(async () => {
    const cellSize = 16;
    const scale = 4;

    const container = document.querySelector(".background-image");
    if (!(container instanceof HTMLElement)) {
        throw new Error("invalid container");
    }

    const gridSize = {
        width: Math.ceil($(container).width()! / (cellSize * scale)),
        height: Math.ceil($(container).height()! / (cellSize * scale)),
    };

    const app = new Application();

    await app.init({
        background: "transparent",
        resizeTo: container,
    });
    app.stage.scale.set(scale);

    app.canvas.id = "background";

    container.appendChild(app.canvas);

    const spritesheets = await getSpritesheets();

    const wfc = new WaveFunctionCollapse(textures, gridSize);
    const result = wfc.run();

    result.forEach(({name, rotation, overlay}, i) => {
        const x = i % gridSize.width;
        const y = Math.floor(i / gridSize.width);

        const sprite = new Sprite(findTexture(spritesheets, name));

        sprite.x = x * cellSize + sprite.width / 2;
        sprite.y = y * cellSize + sprite.height / 2;
        sprite.pivot.set(cellSize / 2, cellSize / 2);
        sprite.rotation = (Math.PI / 2) * rotation;

        app.stage.addChild(sprite);

        if (overlay) {
            const sprite = new Sprite(findTexture(spritesheets, overlay));

            sprite.x = x * cellSize - sprite.width + cellSize;
            sprite.y = y * cellSize - sprite.height + cellSize;

            app.stage.addChild(sprite);
        }
    });
})();
import { Application} from 'pixi.js';

import { GameEngine } from './game_engine';

(async () => {
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({
        background: '#1099bb',
        resizeTo: window,
    });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);
    const engine = new GameEngine(app);
    await engine.initialize();

    // const cameraX = 0;
    app.ticker.add((delta) => {
        // Suivre une position cible
        engine.update(delta.deltaTime);
    });



})();
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
        this.spriteSheet = await getSpritesheets();

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

    private async getTextureForContent(content: TileContentType): Promise<any> {
        switch (content) {
            case ResourceType.WOOD: return findTexture(this.spriteSheet, "tree_1");
            case ResourceType.STONE: return findTexture(this.spriteSheet, "stone");
            case ResourceType.COPPER: return findTexture(this.spriteSheet, "copper");
            case ResourceType.IRON: return findTexture(this.spriteSheet, "iron");
            default: return findTexture(this.spriteSheet, "axe")
        }
    }

    private async getTextureForDecoration(tile: Tile): Promise<PIXI.Sprite> {
        switch(tile.decoration){
            case DecorationType.BUSH:{
                const bushTypes: TextureName[] = ["bush_1", "bush_2", "bush_3"];
                const spriteIndex = Math.floor(tile.variation * bushTypes.length);
                const sprite = new PIXI.Sprite(findTexture(this.spriteSheet, bushTypes[spriteIndex]));
                sprite.anchor.set(0.5, 0.5);
                return sprite;
            }
            case DecorationType.FLOWER:{
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
import { Assets, Sprite, Spritesheet, Texture } from "pixi.js";

type Dimensions = {
    w: number;
    h: number;
};

export type TextureName =
    "grass_1" |
    "grass_2" |
    "grass_3" |
    "grass_4" |
    "forest_right_edge" |
    "forest_edge_1" |
    "forest_edge_2" |
    "forest_edge_3" |
    "forest_left_edge" |
    "forest_center_1" |
    "forest_center_2" |
    "forest_one_edge" |
    "forest_0_edge" |
    "path_i" |
    "path_u" |
    "path_l_1" |
    "path_l_2" |
    "path_t" |
    "path_x" |
    "furnace_off" |
    "furnace_on_1" |
    "furnace_on_2" |
    "furnace_on_3" |
    "workbench" |
    "crate" |
    "core" |
    "stone" |
    "coal" |
    "copper" |
    "iron" |
    "flower_1" |
    "flower_2" |
    "flower_3" |
    "bush_1" |
    "bush_2" |
    "bush_3" |
    "stone_ore" |
    "coal_ore" |
    "copper_ore" |
    "copper_ingot" |
    "iron_ore" |
    "iron_ingot" |
    "wood_log" |
    "wood_plank" |
    "seed" |
    "pickaxe" |
    "shovel" |
    "axe" |
    "iron_rod" |
    "nail" |
    "iron_frame" |
    "iron_plate" |
    "reinforced_iron_plate" |
    "cement" |
    "concrete" |
    "codebot_1" |
    "codebot_2" |
    "codebot_3" |
    "codebot_4" |
    "tree_1" |
    "tree_2" |
    "tree_3" |
    "tree_4" |
    "power" |
    "close" |
    "light_square" |
    "dark_square" |
    "light_frame" |
    "dark_frame" |
    "scroll" |
    "bar";

export const findTexture = (spriteSheets: Spritesheet[], texture: TextureName) => {
    return spriteSheets.find((spritesheet) => spritesheet.textures[texture])?.textures[texture];
};

const generateAtlas = (file: string, spriteAmount: Dimensions, assetDimensions: Dimensions, names: TextureName[]) => {
    return {
        meta: {
            image: file,
            format: "RGBA8888",
            size: {
                w: spriteAmount.w * assetDimensions.w,
                h: spriteAmount.h * assetDimensions.h,
            },
            scale: 1,
        },
        frames: names.reduce((acc, name, i) => {
            acc[name] = {
                frame: {
                    ...assetDimensions,
                    x: (i % spriteAmount.w) * assetDimensions.w,
                    y: Math.floor(i / spriteAmount.w) * assetDimensions.h,
                },
                sourceSize: assetDimensions,
                spriteSourceSize: {
                    ...assetDimensions,
                    x: 0,
                    y: 0,
                },
            };

            return acc;
        }, {}),
    };
};

const atlas = [
    generateAtlas("/assets/spritesheet.png", { w: 8, h: 8 }, { w: 16, h: 16 }, [
        "grass_1",
        "grass_2",
        "grass_3",
        "grass_4",
        "forest_right_edge",
        "forest_edge_1",
        "forest_edge_2",
        "forest_edge_3",
        "forest_left_edge",
        "forest_center_1",
        "forest_center_2",
        "forest_one_edge",
        "forest_0_edge",
        "path_i",
        "path_u",
        "path_l_1",
        "path_l_2",
        "path_t",
        "path_x",
        "furnace_off",
        "furnace_on_1",
        "furnace_on_2",
        "furnace_on_3",
        "workbench",
        "crate",
        "core",
        "stone",
        "coal",
        "copper",
        "iron",
        "flower_1",
        "flower_2",
        "flower_3",
        "bush_1",
        "bush_2",
        "bush_3",
        "stone_ore",
        "coal_ore",
        "copper_ore",
        "copper_ingot",
        "iron_ore",
        "iron_ingot",
        "wood_log",
        "wood_plank",
        "seed",
        "pickaxe",
        "shovel",
        "axe",
        "iron_rod",
        "nail",
        "iron_frame",
        "iron_plate",
        "reinforced_iron_plate",
        "cement",
        "concrete",
        "codebot_1",
        "codebot_2",
        "codebot_3",
        "codebot_4",
        "power",
        "close"
    ]),
    generateAtlas("/assets/trees.png", { w: 2, h: 2 }, { w: 16, h: 32 }, [
        "tree_1",
        "tree_2",
        "tree_3",
        "tree_4",
    ]),
    generateAtlas("/assets/gui_spritesheet.png", {w: 4, h: 2}, {w: 30, h: 30}, [
        "light_square",
        "dark_square",
        "light_frame",
        "dark_frame",
        "scroll",
        "bar",
    ])
];

export const getSpritesheets = async () => {
    const spritesheetAssets = await Promise.all(atlas.map((atlas) => Assets.load({
        src: atlas.meta.image,
        data: { scaleMode: "nearest" },
    })));

    const spritesheets = spritesheetAssets.map((spritesheetAsset, i) => new Spritesheet(spritesheetAsset, atlas[i]));

    await Promise.all(spritesheets.map((spritesheet) => spritesheet.parse()));

    return spritesheets;
}
export enum DecorationType{
    FLOWER,
    BUSH,
}
export enum Direction {
    TOP = "top",
    RIGHT = "right",
    BOTTOM = "bottom",
    LEFT = "left"
}
export enum InteractableType {
    CHEST,
    FURNACE,
    CRAFTING_TABLE,
}
export enum ResourceType {
    WOOD,
    STONE,
    IRON,
    COPPER,
    COAL,
}
import { DecorationType } from "./decoration_type";
import { InteractableType } from "./interactable_type";
import { ResourceType } from "./resource_type";

export type TileContentType = ResourceType | InteractableType;
export enum TileType {
    GRASS,
    FOREST,
}
import {defineConfig} from "vite";

export default defineConfig({
    root: "src/client",
    server: {
        proxy: {
            "/api": "http://localhost:8080", // proxy API Hono en dev
        },
    },
    build: {
        rollupOptions: {
            input: {
                landing: "src/client/index.html",
                game: "src/client/game.html",
            },
        },
        outDir: "../../dist/client",
    },
})
import type {TextureName} from "../spritesheet_atlas";
import {directions, rotate, type Texture, type EdgeName} from "./textures";

type Dimensions = {
    width: number;
    height: number;
};

type NeighborWithDirection = {
    index: number;
    direction: number;
};

type Wave = {
    possibilities: Texture[];
    isCollapsed: boolean;
};

type ResultTexture = {
    name: TextureName;
    rotation: number;
    overlay?: TextureName;
};

export default class WaveFunctionCollapse {
    private waves: Wave[];
    private dimensions: Dimensions;

    constructor(textures: Texture[], dimensions: Dimensions) {
        this.dimensions = dimensions;

        const possibilities: Texture[] = textures.flatMap((texture) => {
            return Array.from({length: texture.edges.length}, (_, i) => rotate(texture, i));
        });

        this.waves = Array.from({length: dimensions.width * dimensions.height}, () => ({
            possibilities: [...possibilities],
            isCollapsed: false,
        }));
    }

    run(): ResultTexture[] {
        while (!this.isCollapsed()) {
            this.iterate();
        }

        return this.waves.map(({possibilities: [{names, rotation, overlays}]}) => {
            const random = Math.random();
            let sum = 0;

            return {
                name: names[this.getRandomIndex(names.length)],
                rotation,
                overlay: overlays.reduce<ResultTexture["overlay"]>((acc, {probability, names}) => {
                    sum += probability;
                    if (!acc && random < sum) {
                        acc = names[this.getRandomIndex(names.length)];
                    }

                    return acc;
                }, undefined),
            };
        });
    }

    private iterate(): void {
        const minEntropyIndex = this.getMinEntropyIndex();
        this.collapse(minEntropyIndex);
        this.propagate(minEntropyIndex);
    }

    private getRandomIndex(length: number): number {
        return Math.floor(Math.random() * length);
    }

    private isCollapsed(): boolean {
        return this.waves.every(({isCollapsed}) => isCollapsed);
    }

    private getEntropy(wave: Wave): number {
        const weightSum = wave.possibilities.reduce((acc, possibility) => {
            return acc + possibility.weight;
        }, 0);
        const logSum = wave.possibilities.reduce((acc, possibility) => {
            return acc + possibility.weight * Math.log(possibility.weight);
        }, 0);

        return Math.log(weightSum) - (logSum / weightSum)
    }

    private getMinEntropyIndex(): number {
        const minEntropy = this.waves.reduce((acc, wave) => {
            if (wave.isCollapsed) {
                return acc;
            }

            return Math.min(acc, this.getEntropy(wave));
        }, Number.MAX_VALUE);

        const minEntropyWaves = this.waves
            .map((wave, index) => ({...wave, index}))
            .filter((wave) => !wave.isCollapsed && this.getEntropy(wave) === minEntropy);

        if (minEntropyWaves.length === 0) {
            throw new Error("all waves are collapsed");
        }

        return minEntropyWaves[this.getRandomIndex(minEntropyWaves.length)].index;
    }

    private collapse(index: number): void {
        const wave = this.waves[index];

        const totalWeight = wave.possibilities.reduce((acc, possibility) => {
            return  acc + possibility.weight;
        }, 0);
        const randomWeight = this.getRandomIndex(totalWeight);

        let acc = 0;
        const chosenPossibility = wave.possibilities.find((possibility) => {
            acc += possibility.weight;
            return randomWeight < acc;
        });

        if (!chosenPossibility) {
            throw new Error("no possibility");
        }

        wave.possibilities = [chosenPossibility];
        wave.isCollapsed = true;
    }

    private propagate(index: number): void {
        const stack = [index];
        while (stack.length) {
            const currentIndex = stack.pop()!;

            const validNeighbors = this.getValidNeighbors(currentIndex);
            validNeighbors.forEach(({index, direction}) => {
                const neighbor = this.waves[index];
                const validNeighborPossibilities = this.getValidNeighborPossibilities(currentIndex, direction, index);

                if (validNeighborPossibilities.length < neighbor.possibilities.length) {
                    neighbor.possibilities = validNeighborPossibilities;
                    if (!stack.some((i) => i === index)) {
                        stack.push(index);
                    }
                }
            });
        }
    }

    private getValidNeighborPossibilities(currentIndex: number, direction: number, neighborIndex: number): Texture[] {
        const currentWave = this.waves[currentIndex];
        const neighborWave = this.waves[neighborIndex];
        const oppositeDirection = this.getOppositeDirection(direction);

        return neighborWave.possibilities.filter((neighborPossibility) => {
            const neighborEdge = neighborPossibility.edges[oppositeDirection];

            return currentWave.possibilities.some((currentPossibility) => {
                const currentEdge = currentPossibility.edges[direction];

                return this.areEdgesMatching(currentEdge, neighborEdge);
            });
        });
    }

    private areEdgesMatching(first: EdgeName, second: EdgeName): boolean {
        return first === second;
        // for (let i = 0; i < first.length; i++) {
        //     if (first[i] !== second[second.length - 1 - i]) {
        //         return false;
        //     }
        // }

        // return true;
    }

    private getValidNeighborIndex(index: number, direction: number): number|null {
        switch (direction) {
        case directions.UP:
            if (index < this.dimensions.width) {
                break;
            }

            return index - this.dimensions.width;
        case directions.RIGHT:
            if ((index + 1) % this.dimensions.width === 0) {
                break;
            }

            return index + 1;
        case directions.DOWN:
            if (index >= this.dimensions.width * (this.dimensions.height - 1)) {
                break;
            }

            return index + this.dimensions.width;
        case directions.LEFT:
            if (index % this.dimensions.width === 0) {
                break;
            }

            return index - 1;
        }

        return null;
    }

    private getValidNeighbors(index: number): NeighborWithDirection[] {
        return Object.values(directions)
            .map((direction) => ({
                direction,
                index: this.getValidNeighborIndex(index, direction)
            }))
            .filter(({index}) => index !== null) as NeighborWithDirection[];
    }

    private getOppositeDirection(direction: number): number {
        const directionIndices = Object.values(directions);
        const half = Math.floor(directionIndices.length / 2);

        return directionIndices[(direction + half) % directionIndices.length];
    }
}
import type {TextureName} from "../spritesheet_atlas";

export type EdgeName = "grass" | "path";
export type Edge = EdgeName[];

export type Texture = {
    names: TextureName[];
    weight: number;
    edges: Edge;
    rotation: number;
    overlays: {
        probability: number,
        names: TextureName[],
    }[];
};

export const rotate = (texture: Texture, rotation: number) => {
    const newTexture = {...texture, edges: [...texture.edges]};

    for (let i = 0; i < rotation % texture.edges.length; ++i) {
        newTexture.edges.splice(0, 0, ...newTexture.edges.splice(newTexture.edges.length - 1, 1));
    }

    newTexture.rotation = newTexture.rotation + rotation % texture.edges.length;

    return newTexture;
};

export const directions = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
};

const textures: Texture[] = [
    {
        names: ["grass_1", "grass_2", "grass_3", "grass_4"],
        weight: 100,
        rotation: 0,
        edges: [
            "grass",
            "grass",
            "grass",
            "grass",
        ],
        overlays: [
            {
                probability: 0.1,
                names: ["flower_1", "flower_2", "flower_3"],
            },
            {
                probability: 0.04,
                names: ["tree_1", "tree_2", "tree_3", "tree_4"],
            },
        ],
    },
    {
        names: ["path_i"],
        weight: 4,
        rotation: 0,
        edges: [
            "grass",
            "path",
            "grass",
            "path",
        ],
        overlays: [
            {
                probability: 0.4,
                names: ["iron"],
            }
        ],
    },
    {
        names: ["path_u"],
        weight: 2,
        rotation: 0,
        edges: [
            "grass",
            "grass",
            "grass",
            "path",
        ],
        overlays: [
            {
                probability: 0.4,
                names: ["iron"],
            }
        ],
    },
    {
        names: ["path_l_1", "path_l_2"],
        weight: 3,
        rotation: 0,
        edges: [
            "path",
            "grass",
            "grass",
            "path",
        ],
        overlays: [
            {
                probability: 0.4,
                names: ["iron"],
            }
        ],
    },
    {
        names: ["path_t"],
        weight: 8,
        rotation: 0,
        edges: [
            "path",
            "path",
            "grass",
            "path",
        ],
        overlays: [
            {
                probability: 0.4,
                names: ["iron"],
            }
        ],
    },
    {
        names: ["path_x"],
        weight: 10,
        rotation: 0,
        edges: [
            "path",
            "path",
            "path",
            "path",
        ],
        overlays: [
            {
                probability: 0.4,
                names: ["iron"],
            }
        ],
    },
];

export default textures;
import { TileType } from "../types/tile_type";
import Tile from "./tile";

export class Chunk {
    public tiles: Tile[][];
    public cx: number;
    public cy: number;
    public size: number;
    constructor(
        cx: number,
        cy: number,
        size: number
    ) {
        this.cx = cx;
        this.cy = cy;
        this.size = size;
        this.tiles = Array.from({ length: size }, () =>
            Array.from({ length: size }, () => new Tile(TileType.GRASS))
        );
    }

    getTile(x: number, y: number): Tile {
        return this.tiles[y][x];
    }

    isWalkable(x: number, y: number): boolean | undefined {
        return this.tiles[y][x].content?.walkable;
    }
}
import { InteractableType } from "../../types/interactable_type";
import { TileContent } from "../tile_content";

export abstract class Interactable extends TileContent{
    constructor(
        public interactable: InteractableType,
    ){
        super(interactable,false)
    }
}
import seedrandom from "seedrandom";
import { Chunk } from "./chunk";

export interface IWorldGenerator{
    getPseudoRandomGenerator() : seedrandom.PRNG;
    generateChunk(cx: number, cy: number, size: number): Chunk;
}
import { ResourceType } from "../../types/resource_type";
import { Resource } from "./resource";

export class CopperStone extends Resource{
    constructor(){
        super(true,ResourceType.COPPER,100);
    }
}
import { ResourceType } from "../../types/resource_type";
import { Resource } from "./resource";

export class IronStone extends Resource{
    constructor(){
        super(true,ResourceType.IRON,100);
    }
}
import { ResourceType } from "../../types/resource_type";
import { TileContentType } from "../../types/tile_content_type";
import { TileContent } from "../tile_content";

export abstract class Resource extends TileContent {
    private resource:ResourceType;
    private hp: number;
    constructor(
        walkable:boolean,
        resource: ResourceType,
        hp: number,
    ) {
        super(resource,walkable);
        this.resource = resource;
        this.hp = hp;
    }

    mine(): ResourceType | null {
        this.hp--;
        if (this.hp <= 0) {
            return this.resource;
        }
        return null;
    }
}
import { ResourceType } from "../../types/resource_type";

import { Resource } from "./resource";
export class Stone extends Resource{
    constructor(){
        super(false, ResourceType.STONE, 100);
    }
}
import { ResourceType } from "../../types/resource_type";
import { Resource } from "./resource";

export class Tree extends Resource{
    constructor(){
        super(false, ResourceType.WOOD, 100);
    }
}
import { DecorationType } from "../types/decoration_type";
import { TileType } from "../types/tile_type";
import { TileContent } from "./tile_content";

export default class Tile {
    public noiseValue:number;
    public content: TileContent | null;
    public decoration: DecorationType | null;
    public type: TileType;
    public variation: number; // For random sprite selection : grass_1 or grass_2 for ex
    public absX:number;
    public absY:number;
    constructor(type: TileType) {
        this.content = null;
        this.decoration = null;
        this.type = type;
     }
}
import { TileContentType } from "../types/tile_content_type";

export abstract class TileContent{
    constructor(
        public tileContentType:TileContentType,
        public walkable:boolean
        ){
    }
}
import { Direction } from "../types/direction";
import { Chunk } from "./chunk";
import { IWorldGenerator } from "./i_world_generator";
import Tile from "./tile";

export class World {
    public chunks: Map<string, Chunk>;
    public chunkSize: number;
    public generator: IWorldGenerator;

    constructor(chunkSize: number, generator: IWorldGenerator) {
        this.chunks = new Map();
        this.chunkSize = chunkSize;
        this.generator = generator;
    }

    getChunk(cx: number, cy: number): Chunk {
        const key = `${cx},${cy}`;
        if (!this.chunks.has(key)) {
            return this.generator.generateChunk(cx, cy, this.chunkSize);

        } else return this.chunks.get(key)!;
    }


    getTileAt(absX: number, absY: number): Tile | null {
        const chunkX = Math.floor(absX / this.chunkSize);
        const chunkY = Math.floor(absY / this.chunkSize);
        const chunk = this.getChunk(chunkX, chunkY);
        if (!chunk) return null;

        const localX = ((absX % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localY = ((absY % this.chunkSize) + this.chunkSize) % this.chunkSize;

        return chunk.tiles[localY]?.[localX] ?? null;
    }


    getTileNeighborsByDirection(absX: number, absY: number): Partial<Record<Direction, Tile | null>> {
        return {
            [Direction.TOP]: this.getTileAt(absX, absY - 1),
            [Direction.RIGHT]: this.getTileAt(absX + 1, absY),
            [Direction.BOTTOM]: this.getTileAt(absX, absY + 1),
            [Direction.LEFT]: this.getTileAt(absX - 1, absY),
        };
    }
}
import { TileType } from "../types/tile_type";
import { Chunk } from "./chunk";
import { Stone } from "./resources/stone";
import { Tree } from "./resources/tree";
import seedrandom from "seedrandom";
import * as Simplex from "simplex-noise"
import Tile from "./tile";
import { IronStone } from "./resources/iron_stone";
import { CopperStone } from "./resources/copper_stone";
import { IWorldGenerator } from "./i_world_generator";
import { DecorationType } from "../types/decoration_type";

export class WorldGenerator implements IWorldGenerator {
    private noiseFunc: Simplex.NoiseFunction2D;
    private resourceNoiseFunc: Simplex.NoiseFunction2D;
    private rng:seedrandom.PRNG;
    constructor(public seed: string) {
        this.rng = seedrandom(this.seed);
        const resourceRng = seedrandom(this.seed + "_resource");
        this.noiseFunc = Simplex.createNoise2D(this.rng);
        this.resourceNoiseFunc = Simplex.createNoise2D(resourceRng);
    }


    getPseudoRandomGenerator() :seedrandom.PRNG{
        return this.rng;
    }

    generateChunk(cx: number, cy: number, size: number): Chunk {
        const chunk = new Chunk(cx, cy, size);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const absX = cx * size + x;
                const absY = cy * size + y;
                let tile: Tile;
                const frequency = 0.1;
                const resourceFrequency = 0.02;
                const res = this.noiseFunc(absX * frequency, absY * frequency);
                const tileRng = seedrandom(`tile_${this.seed}_${absX}_${absY}`);
                tile = new Tile(TileType.GRASS);
                tile.noiseValue = res;
                tile.variation = this.rng();
                tile.absX = absX;
                tile.absY = absY;

                if (res < 0.5 && res > -0.5) {
                    chunk.tiles[y][x] = tile;
                    if(tileRng() > 0.9){
                        const values = Object.values(DecorationType).filter(v => typeof v === "number") as DecorationType[];
                        const index = Math.floor(tileRng() * values.length);
                        tile.decoration = values[index];
                    }
                    continue;
                }

                if (res <= -0.5) {
                    if (res < -0.65) {
                        tile = new Tile(TileType.FOREST);
                        tile.absX = absX;
                        tile.absY = absY;
                        tile.variation = this.rng();
                        if (res < -0.75) {
                            tile.content = new Tree();
                        }
                    }
                }
                if (res >= 0.5) {
                    if (res > 0.75) {
                        const resourceVal = this.resourceNoiseFunc(absX * resourceFrequency, absY * resourceFrequency);

                        if (resourceVal < -0.33) tile.content = new Stone();
                        else if (resourceVal < 0.33) tile.content = new IronStone();
                        else tile.content = new CopperStone();
                    }
                }
                chunk.tiles[y][x] = tile;
            }
        }

        return chunk;
    }
}
import {Hono} from "hono";
import {serve} from "@hono/node-server";
import {serveStatic} from "@hono/node-server/serve-static";

const app = new Hono();

// Exemple API
app.get("/api/hello", (c) => c.json({message: "Hello from Hono 🚀"}));

// En production : servir le build de Vite
app.use("/*", serveStatic({root: "./dist/client"}));

app.get("/game", serveStatic({ path: "./dist/client/game.html"}));

serve({
    fetch: app.fetch,
    port: Number(process.env.PORT) || 8080,
});
import assert from "node:assert";
import test from "node:test";

test("test", (t) => assert.strictEqual(1, 1));
