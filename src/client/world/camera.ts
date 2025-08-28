import { Player } from "../entity/player";
import { TILE_SIZE } from "../constants";

export class Camera {
    public x = 0;
    public y = 0;
    public zoom = 2;

    follow(player: Player, screenWidth: number, screenHeight: number) {
        this.x =  screenWidth / 2 - player.posX * TILE_SIZE * this.zoom - TILE_SIZE;
        this.y = screenHeight / 2 - player.posY * TILE_SIZE * this.zoom - TILE_SIZE;
    }

}
