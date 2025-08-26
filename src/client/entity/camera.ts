import * as PIXI from "pixi.js";
import { Player } from "./player";

export class Camera {
    public x = 0;
    public y = 0;
    public zoom = 1;

    follow(player: Player, screenWidth: number, screenHeight: number) {
        this.x = screenWidth / 2 - player.posX;
        this.y = screenHeight / 2 - player.posY;
    }

}
