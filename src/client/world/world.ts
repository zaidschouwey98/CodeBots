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
            const chunk = this.generator.generateChunk(cx, cy, this.chunkSize);
            this.chunks.set(key, chunk);
        }
        return this.chunks.get(key)!;
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
