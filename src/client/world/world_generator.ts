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
import { MAP_FREQUENCY, RESOURCE_FREQUENCY } from "../constants";
import { World } from "./world";

export class WorldGenerator implements IWorldGenerator {
    private noiseFunc: Simplex.NoiseFunction2D;
    private resourceNoiseFunc: Simplex.NoiseFunction2D;
    private rng:seedrandom.PRNG;
    private world: World;
    constructor(public seed: string) {
        this.rng = seedrandom(this.seed);
        const resourceRng = seedrandom(this.seed + "_resource");
        this.noiseFunc = Simplex.createNoise2D(this.rng);
        this.resourceNoiseFunc = Simplex.createNoise2D(resourceRng);
    }

    public setWorld(world: World){
        this.world = world;
    }

    getPseudoRandomGenerator() :seedrandom.PRNG{
        return this.rng;
    }

    generateChunk(cx: number, cy: number, size: number): Chunk {
        const chunk = new Chunk(cx, cy, size, this.world);
        const tileRng = seedrandom(`${this.seed}_${cx}_${cy}`);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const absX = cx * size + x;
                const absY = cy * size + y;
                let tile: Tile;
                const res = this.noiseFunc(absX * MAP_FREQUENCY, absY * MAP_FREQUENCY);

                tile = new Tile(TileType.GRASS, chunk);
                tile.noiseValue = res;
                tile.variation = tileRng();
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
                        tile = new Tile(TileType.FOREST, chunk);
                        tile.absX = absX;
                        tile.absY = absY;
                        tile.variation = this.rng();
                        if (res < -0.75) {
                            tile.content = new Tree(tile);
                        }
                    }
                }
                if (res >= 0.5) {
                    if (res > 0.75) {
                        const resourceVal = this.resourceNoiseFunc(absX * RESOURCE_FREQUENCY, absY * RESOURCE_FREQUENCY);

                        if (resourceVal < -0.33) tile.content = new Stone(tile);
                        else if (resourceVal < 0.33) tile.content = new IronStone(tile);
                        else tile.content = new CopperStone(tile);
                    }
                }
                chunk.tiles[y][x] = tile;
            }
        }

        return chunk;
    }
}
