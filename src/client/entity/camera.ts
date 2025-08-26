import * as PIXI from "pixi.js";
import { Player } from "./player";

export class Camera {
    public x = 0;
    public y = 0;
    public zoom = 1;

    follow(player: Player, screenWidth: number, screenHeight: number) {
        const pixelX = player.posX * 16; // Tile size otherwise camera falls off behind player
        const pixelY = player.posY * 16;
        this.x = -pixelX + screenWidth / 2;
        this.y = -pixelY + screenHeight / 2;
    }

}
