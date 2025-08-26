import { TileType } from "../types/tile_type";
import { TileContent } from "./tile_content";

export default class Tile {
    public noiseValue:number;
    public content: TileContent | null;
    public type: TileType;
    public variation: number; // For random sprite selection : grass_1 or grass_2 for ex
    constructor(type: TileType) {
        this.content = null;
        this.type = type;
     }
}
