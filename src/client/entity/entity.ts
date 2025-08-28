import { Interactable } from "../world/interactables/interactable";

export class Entity{
    public posX:number;
    public posY:number;
    public cX:number;
    public cY:number;
    public speed:number;

    constructor(){
        this.posX = 0;
        this.posY = 0;
    }

    interact(i:Interactable){

    }
}
