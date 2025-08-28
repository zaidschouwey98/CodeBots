import { AnimationName, TextureName } from "../spritesheet_atlas";
import { EntityType } from "../types/entity_type";
import { Entity } from "./entity";

export class Player extends Entity{
    constructor(){
        super();
    }

    getTextureName(): TextureName {
        return "idle1";
    }

    getType(): EntityType {
        return EntityType.PLAYER;
    }

    getAnimationName(): AnimationName|null {
        return null;
    }

    update(keys: Set<string>, delta: number) {
        const speed = 10;

        if (keys.has("w")) this.posY -= speed * delta / 60;
        if (keys.has("s")) this.posY += speed * delta / 60;
        if (keys.has("a")) this.posX -= speed * delta / 60;
        if (keys.has("d")) this.posX += speed * delta / 60;
    }
}
