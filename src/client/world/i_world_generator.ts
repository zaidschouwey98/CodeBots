import { Chunk } from "./chunk";

export interface IWorldGenerator{
    generateChunk(cx: number, cy: number, size: number): Chunk;
}
