import { ResourceType } from "../../types/resource_type";
import { TileContentType } from "../../types/tile_content_type";
import { TileContent } from "../tile_content";

export abstract class Resource extends TileContent {
    private resource:ResourceType;
    private hp: number;
    constructor(
        walkable:boolean,
        resource: ResourceType,
        hp: number,
    ) {
        super(resource,walkable);
        this.resource = resource;
        this.hp = hp;
    }

    mine(): ResourceType | null {
        this.hp--;
        if (this.hp <= 0) {
            return this.resource;
        }
        return null;
    }
}
