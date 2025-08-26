import seedrandom from "seedrandom";
import { Chunk } from "./chunk";

export interface IWorldGenerator{
    getPseudoRandomGenerator() : seedrandom.PRNG;
    generateChunk(cx: number, cy: number, size: number): Chunk;
}
