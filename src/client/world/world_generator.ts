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
                tile = new Tile(TileType.GRASS);
                tile.noiseValue = res;
                tile.variation = this.rng();
                tile.absX = absX;
                tile.absY = absY;

                if (res < 0.5 && res > -0.5) {
                    chunk.tiles[y][x] = tile;
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
