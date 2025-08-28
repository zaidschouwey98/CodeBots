import { CHUNK_LOAD_RADIUS, CHUNK_SIZE, RENDER_DISTANCE } from "../constants";
import { Entity } from "../entity/entity";
import { Player } from "../entity/player";
import { Direction } from "../types/direction";
import { Chunk } from "./chunk";
import { IWorldGenerator } from "./i_world_generator";
import Tile from "./tile";

export class World {
    public savedChunks: Map<string, Chunk>; // Chunks that have been modified and need to be saved
    public activeChunks: Map<string,Chunk>; // Chunks currently loaded in memory
    public generator: IWorldGenerator;

    constructor(generator: IWorldGenerator) {
        this.savedChunks = new Map();
        this.activeChunks = new Map();
        this.generator = generator;
    }

    updateLoadedChunks(entities: Entity[]) {
        console.log("saved chunks:", this.savedChunks);
        console.log("active chunks:", this.activeChunks);
        const newLoaded = new Map<string, Chunk>();
        for (const entity of entities) {
            const cx = entity.cX;
            const cy = entity.cY;
            for (let dx = -CHUNK_LOAD_RADIUS; dx <= CHUNK_LOAD_RADIUS; dx++) {
                for (let dy = -CHUNK_LOAD_RADIUS; dy <= CHUNK_LOAD_RADIUS; dy++) {
                    const chunk = this.getChunk(cx + dx, cy + dy);
                    newLoaded.set(chunk.key, chunk);
                }
            }
        }
        this.activeChunks = newLoaded;
    }

    getChunksInVisibleRange(player:Player): Chunk[] {
        const chunks: Chunk[] = [];
        for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
            for (let dy = -RENDER_DISTANCE; dy <= RENDER_DISTANCE; dy++) {
                const key = `${player.cX+dx}_${player.cY+dy}`;
                const chunk = this.activeChunks.get(key);
                if (chunk) chunks.push(chunk);
                else throw new Error(`Chunk ${key} not found in activeChunks`);
            }
        }
        return chunks;
    }

    getChunk(cx: number, cy: number): Chunk {
        const key = `${cx},${cy}`;
        if (!this.savedChunks.has(key)) {
            return this.generator.generateChunk(cx, cy, CHUNK_SIZE);

        } else return this.savedChunks.get(key)!;
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
