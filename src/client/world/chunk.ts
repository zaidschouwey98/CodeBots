import { TileType } from "../types/tile_type";
import Tile from "./tile";

export class Chunk {
    public tiles: Tile[][];
    public cx: number;
    public cy: number;
    public size: number;
    public key: string;
    constructor(
        cx: number,
        cy: number,
        size: number
    ) {
        this.cx = cx;
        this.cy = cy;
        this.size = size;
        this.key = `${cx}_${cy}`;
        this.tiles = Array.from({ length: size }, () =>
            Array.from({ length: size }, () => new Tile(TileType.GRASS))
        );
    }

    getTile(x: number, y: number): Tile {
        return this.tiles[y][x];
    }

    isWalkable(x: number, y: number): boolean | undefined {
        return this.tiles[y][x].content?.walkable;
    }
}
