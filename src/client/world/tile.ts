import { DecorationType } from "../types/decoration_type";
import { TileType } from "../types/tile_type";
import { Chunk } from "./chunk";
import { TileContent } from "./tile_content";

export default class Tile {
    public chunk:Chunk;
    public noiseValue:number;
    public content: TileContent | null;
    public decoration: DecorationType | null;
    public type: TileType;
    public variation: number; // For random sprite selection : grass_1 or grass_2 for ex
    public absX:number;
    public absY:number;
    constructor(type: TileType, chunk:Chunk) {
        this.content = null;
        this.decoration = null;
        this.type = type;
        this.chunk = chunk;
     }
}
