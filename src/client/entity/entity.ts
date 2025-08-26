import { Interactable } from "../world/interactables/interactable";

export class Entity{
    public posX:number;
    public posY:number;
    public cX:number;
    public cY:number;
    public speed:number;

    constructor(){
        this.posX = 10;
        this.posY = 10;
    }

    interact(i:Interactable){

    }
}
