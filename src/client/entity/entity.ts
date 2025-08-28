import { AnimationName, TextureName } from "../spritesheet_atlas";
import { EntityType } from "../types/entity_type";
import { Interactable } from "../world/interactables/interactable";

export abstract class Entity{
    private static idCounter = 1;
    public id:string;
    public posX:number;
    public posY:number;
    public cX:number;
    public cY:number;
    public speed:number;

    constructor() {
        this.id = `entity_${Entity.idCounter++}`;
        this.posX = 0;
        this.posY = 0;
    }

    abstract getTextureName(): TextureName;

    abstract getAnimationName(): AnimationName|null;

    abstract getType(): EntityType;

    interact(i: Interactable){

    }
}
