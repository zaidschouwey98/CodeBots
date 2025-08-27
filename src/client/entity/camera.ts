import * as PIXI from "pixi.js";
import { Player } from "./player";

export class Camera {
    public x = 0;
    public y = 0;
    public zoom = 2;

    follow(player: Player, screenWidth: number, screenHeight: number) {
        this.x =  screenWidth / 2 - player.posX * 16 * this.zoom - 16;
        this.y = screenHeight / 2 - player.posY * 16 * this.zoom - 16;
    }

}
