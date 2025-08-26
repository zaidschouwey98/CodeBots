import { Chunk } from "./chunk";
import { IWorldGenerator } from "./i_world_generator";
import Tile from "./tile";

export class World {
    chunks: Map<string, Chunk>;
    chunkSize: number;
    generator: IWorldGenerator;

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


    getNeighbors(absX: number, absY: number): (Tile | null)[] {
        const dirs = [
            [0, -1],
            [1, -1],
            [1, 0],
            [1, 1],
            [0, 1],
            [-1, 1],
            [-1, 0],
            [-1, -1],
        ];

        return dirs.map(([dx, dy]) => this.getTileAt(absX + dx, absY + dy));
    }
}
