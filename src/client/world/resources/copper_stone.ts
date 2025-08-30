import { ResourceType } from "../../types/resource_type";
import Tile from "../tile";
import { Resource } from "./resource";

export class CopperStone extends Resource{
    constructor(tile:Tile){
        super(true,ResourceType.COPPER,100, tile);
    }
}
