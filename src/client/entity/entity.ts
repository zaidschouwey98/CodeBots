import { AnimationName } from "../spritesheet_atlas";
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

    abstract getAnimationName(): AnimationName;

    interact(i: Interactable){

    }
}
