import { CHUNK_SIZE } from "../constants";
import { Direction } from "../types/direction";
import { Chunk } from "./chunk";
import { IWorldGenerator } from "./i_world_generator";
import Tile from "./tile";

export class World {
    public chunks: Map<string, Chunk>;
    public generator: IWorldGenerator;

    constructor(generator: IWorldGenerator) {
        this.chunks = new Map();
        this.generator = generator;
    }

    getChunk(cx: number, cy: number): Chunk {
        const key = `${cx},${cy}`;
        if (!this.chunks.has(key)) {
            return this.generator.generateChunk(cx, cy, CHUNK_SIZE);

        } else return this.chunks.get(key)!;
    }


    getTileAt(absX: number, absY: number): Tile | null {
        const chunkX = Math.floor(absX / CHUNK_SIZE);
        const chunkY = Math.floor(absY / CHUNK_SIZE);
        const chunk = this.getChunk(chunkX, chunkY);
        if (!chunk) return null;

        const localX = ((absX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localY = ((absY % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

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
