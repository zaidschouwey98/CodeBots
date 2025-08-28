import { EntityType } from "../types/entity_types";
import { Interactable } from "../world/interactables/interactable";

export abstract class Entity{
    static idCounter = 1;
    public id?:string;
    public posX:number;
    public posY:number;
    public cX:number;
    public cY:number;
    public speed:number;

    constructor(){
        this.id = `entity_${Entity.idCounter++}`;
        this.posX = 0;
        this.posY = 0;
    }

    interact(i:Interactable){

    }

    abstract getEntityType(): EntityType;
}
