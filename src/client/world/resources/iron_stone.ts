import { ResourceType } from "../../types/resource_type";
import Tile from "../tile";
import { Resource } from "./resource";

export class IronStone extends Resource{
    constructor(tile:Tile){
        super(true,ResourceType.IRON,100, tile);
    }
}
