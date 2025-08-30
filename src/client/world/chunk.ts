import { TileType } from "../types/tile_type";
import Tile from "./tile";
import { World } from "./world";

export class Chunk {
    public tiles: Tile[][];
    public world: World;
    public cx: number;
    public cy: number;
    public size: number;
    public key: string;
    constructor(
        cx: number,
        cy: number,
        size: number,
        world: World
    ) {
        this.world = world;
        this.cx = cx;
        this.cy = cy;
        this.size = size;
        this.key = `${cx}_${cy}`;
        this.tiles = Array.from({ length: size }, () =>
            Array.from({ length: size }, () => new Tile(TileType.GRASS, this))
        );
    }

    chunkUpdated(tile: Tile) {
        if(!this.world) throw new Error("Chunk has no world assigned");
        this.world.saveChunk(this);
    }

    getTile(x: number, y: number): Tile {
        return this.tiles[y][x];
    }

    isWalkable(x: number, y: number): boolean | undefined {
        return this.tiles[y][x].content?.walkable;
    }
}
