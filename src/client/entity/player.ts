import { AnimationName } from "../spritesheet_atlas";
import { EntityType } from "../types/entity_type";
import { Entity } from "./entity";

export class Player extends Entity {
    private currentlyDisplayedAnimation: AnimationName;
    private speed: number = 10;
    constructor() {
        super();
        this.currentlyDisplayedAnimation = "player_idle";
    }

    update(keys: Set<string>, delta: number) {
        let dx = 0;
        let dy = 0;

        if (keys.has("w")) dy -= 1;
        if (keys.has("s")) dy += 1;
        if (keys.has("a")) dx -= 1;
        if (keys.has("d")) dx += 1;

        // si déplacement
        if (dx !== 0 || dy !== 0) {
            // normalisation (évite vitesse diagonale trop rapide)
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;

            this.posX += dx * this.speed * delta / 60;
            this.posY += dy * this.speed * delta / 60;

            // choisir l’animation en fonction de la direction
            if (dx > 0) this.currentlyDisplayedAnimation = "player_walk_right";
            else if (dx < 0) this.currentlyDisplayedAnimation = "player_walk_left";
            else if (dy > 0) this.currentlyDisplayedAnimation = "player_walk_down";
            else if (dy < 0) this.currentlyDisplayedAnimation = "player_walk_up";
        } else {
            this.currentlyDisplayedAnimation = "player_idle";
            this.notify();
        }
    }

    getSpeed(): number {
        return this.speed;
    }
    getAnimationName(): AnimationName {
        return this.currentlyDisplayedAnimation;
    }
    isAnimated(): boolean {
        return true;
    }
    getType(): EntityType {
        return EntityType.PLAYER;
    }
    getInventorySize(): number {
        return 10;
    }
}
