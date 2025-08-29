import { AnimationName, TextureName } from "../spritesheet_atlas";
import { EntityType } from "../types/entity_type";
import { Entity } from "./entity";
import {PLAYER_INVENTORY_SIZE, PLAYER_SPEED} from "../constants";

export class Player extends Entity{
    constructor(){
        super();
    }

    getType(): EntityType {
        return EntityType.PLAYER;
    }

    getSpeed(): number {
        return PLAYER_SPEED;
    }

    getAnimationName(): AnimationName {
        return "player_idle";
    }

    isAnimated(): boolean {
        return true;
    }

    getInventorySize(): number {
        return PLAYER_INVENTORY_SIZE;
    }

    update(keys: Set<string>, delta: number) {
        const speed = this.getSpeed();

        if (keys.has("w")) this.posY -= speed * delta / 60;
        if (keys.has("s")) this.posY += speed * delta / 60;
        if (keys.has("a")) this.posX -= speed * delta / 60;
        if (keys.has("d")) this.posX += speed * delta / 60;
    }
}
