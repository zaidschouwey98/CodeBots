import { Entity } from "./entity";

export class Player extends Entity{
    constructor(){
        super();

    }

    update(keys: Set<string>, delta: number) {
        const step = 1;
        if (keys.has("w")) this.posY -= step;
        if (keys.has("s")) this.posY += step;
        if (keys.has("a")) this.posX -= step;
        if (keys.has("d")) this.posX += step;
    }
}
