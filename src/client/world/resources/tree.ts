import { ResourceType } from "../../types/resource_type";
import { Resource } from "./resource";

export class Tree extends Resource{
    constructor(){
        super(false, ResourceType.WOOD, 100);
    }
}
