import { ResourceType } from "../../types/resource_type";
import Tile from "../tile";

import { Resource } from "./resource";
export class Stone extends Resource{
    constructor(tile:Tile){
        super(false, ResourceType.STONE, 100, tile);
    }
}
