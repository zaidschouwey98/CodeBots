import Observable from "../observer/observable";
import { AnimationName, TextureName } from "../spritesheet_atlas";
import { EntityType } from "../types/entity_type";
import { Interactable } from "../world/interactables/interactable";

type EntityState = {
    posX: number;
    posY: number;
    cX: number;
    cY: number;
};

export abstract class Entity extends Observable<EntityState> {
    private static idCounter = 1;
    public id: string;

    constructor() {
        super({
            posX: 0,
            posY: 0,
            cX: -1,
            cY: -1,
        });

        this.id = `entity_${Entity.idCounter++}`;
    }

    abstract getSpeed(): number;

    abstract getAnimationName(): AnimationName;

    abstract isAnimated(): boolean;

    abstract getType(): EntityType;

    interact(i: Interactable){

    }

    get posX(): number {
        return this.state.posX;
    }

    get posY(): number {
        return this.state.posY;
    }

    get cX(): number {
        return this.state.cX;
    }

    get cY(): number {
        return this.state.cY;
    }

    set posX(newPosX: number) {
        this.state.posX = newPosX;
    }

    set posY(newPosY: number) {
        this.state.posY = newPosY;
    }

    set cX(newCX: number) {
        this.state.cX = newCX;
    }

    set cY(newCY: number) {
        this.state.cY = newCY;
    }
}
