import { ResourceType } from "../../types/resource_type";
import Tile from "../tile";
import { Resource } from "./resource";

export class Tree extends Resource{
    constructor(tile:Tile){
        super(false, ResourceType.WOOD, 100,tile);
    }
}
