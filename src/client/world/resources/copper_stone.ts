import { ResourceType } from "../../types/resource_type";
import { Resource } from "./resource";

export class CopperStone extends Resource{
    constructor(){
        super(true,ResourceType.COPPER,100);
    }
}
