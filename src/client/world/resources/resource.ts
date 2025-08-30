import { ResourceType } from "../../types/resource_type";
import { TileContentType } from "../../types/tile_content_type";
import Tile from "../tile";
import { TileContent } from "../tile_content";

export abstract class Resource extends TileContent {
    private resource:ResourceType;
    private hp: number;
    constructor(
        walkable:boolean,
        resource: ResourceType,
        hp: number,
        tile:Tile
    ) {
        super(resource,walkable,tile);
        this.resource = resource;
        this.hp = hp;
    }

    mine(): ResourceType | null {
        this.hp -= 50;
        this.tile.chunk.chunkUpdated(this.tile);
        if (this.hp <= 0) {
            this.tile.content = null;

            return this.resource;
        }
        return null;
    }
}
