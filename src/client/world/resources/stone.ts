import { ResourceType } from "../../types/resource_type";

import { Resource } from "./resource";
export class Stone extends Resource{
    constructor(){
        super(false, ResourceType.STONE, 100);
    }
}
