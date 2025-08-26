import { ResourceType } from "../../types/resource_type";
import { Resource } from "./resource";

export class IronStone extends Resource{
    constructor(){
        super(true,ResourceType.IRON,100);
    }
}
