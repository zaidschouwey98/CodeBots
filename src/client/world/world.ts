import { CHUNK_LOAD_RADIUS, CHUNK_SIZE, RENDER_DISTANCE } from "../constants";
import { Entity } from "../entity/entity";
import { Player } from "../entity/player";
import { Direction } from "../types/direction";
import {ResourceType} from "../types/resource_type";
import { Chunk } from "./chunk";
import { IWorldGenerator } from "./i_world_generator";
import type {Position} from "../types/position";
import Tile from "./tile";

export class World {
    public savedChunks: Map<string, Chunk>; // Chunks that have been modified and need to be saved
    public activeChunks: Map<string, Chunk>; // Chunks currently loaded in memory
    public generator: IWorldGenerator;
    public entities: Entity[];

    constructor(generator: IWorldGenerator) {
        this.savedChunks = new Map();
        this.activeChunks = new Map();
        this.generator = generator;
    }

    updateLoadedChunks(entities: Entity[]) {
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

    getChunksInVisibleRange(player: Player): Chunk[] {
        const chunks: Chunk[] = [];
        for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
            for (let dy = -RENDER_DISTANCE; dy <= RENDER_DISTANCE; dy++) {
                const key = `${player.cX + dx}_${player.cY + dy}`;
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
        const chunkX = Math.floor(absX / CHUNK_SIZE);
        const chunkY = Math.floor(absY / CHUNK_SIZE);
        const chunk = this.getChunk(chunkX, chunkY);

        const localX = ((absX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localY = ((absY % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const result: Partial<Record<Direction, Tile | null>> = {};

        // haut
        if (localY > 0) {
            result[Direction.TOP] = chunk.tiles[localY - 1][localX];
        } else {
            result[Direction.TOP] = this.getChunk(chunkX, chunkY - 1).tiles[CHUNK_SIZE - 1][localX];
        }

        // bas
        if (localY < CHUNK_SIZE - 1) {
            result[Direction.BOTTOM] = chunk.tiles[localY + 1][localX];
        } else {
            result[Direction.BOTTOM] = this.getChunk(chunkX, chunkY + 1).tiles[0][localX];
        }

        // gauche
        if (localX > 0) {
            result[Direction.LEFT] = chunk.tiles[localY][localX - 1];
        } else {
            result[Direction.LEFT] = this.getChunk(chunkX - 1, chunkY).tiles[localY][CHUNK_SIZE - 1];
        }

        // droite
        if (localX < CHUNK_SIZE - 1) {
            result[Direction.RIGHT] = chunk.tiles[localY][localX + 1];
        } else {
            result[Direction.RIGHT] = this.getChunk(chunkX + 1, chunkY).tiles[localY][0];
        }

        return result;
    }

    getNearestResourceFromPosition(from: Position, ressourceType: ResourceType): Position|null {
        const visited = new Set<string>();
        const queue: Position[] = [from];

        const directions = [
            {x: 1, y: 0},
            {x: -1, y: 0},
            {x: 0, y: 1},
            {x: 0, y: -1},
        ];

        const getKey = ({x, y}: Position) => `${x}_${y}`
        const mod = (n: number, m: number) => ((n % m) + m) % m;

        while (queue.length > 0) {
            const current = queue.shift()!;

            const cX = Math.floor(current.x / CHUNK_SIZE);
            const cY = Math.floor(current.y / CHUNK_SIZE);

            const chunk = this.activeChunks.get(getKey({x: cX, y: cY}));
            if (!chunk) {
                continue;
            }

            const x = mod(current.x, CHUNK_SIZE);
            const y = mod(current.y, CHUNK_SIZE);

            const tile = chunk.getTile(x, y);

            if (tile.content?.tileContentType === ressourceType) {
                return current;
            }

            for (const direction of directions) {
                const newPosition = {
                    x: current.x + direction.x,
                    y: current.y + direction.y,
                };

                const newCX = Math.floor(newPosition.x / CHUNK_SIZE);
                const newCY = Math.floor(newPosition.y / CHUNK_SIZE);

                if (!visited.has(getKey(newPosition)) && this.activeChunks.has(getKey({x: newCX, y: newCY}))) {
                    visited.add(getKey(newPosition));
                    queue.push(newPosition);
                }
            }
        }

        return null;
    }
}
