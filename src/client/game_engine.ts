import { Camera } from "./entity/camera";
import { Player } from "./entity/player";
import { WorldRenderer } from "./renderer/world_renderer";
import { World } from "./world/world";
import * as PIXI from "pixi.js";
import { WorldGenerator } from "./world/world_generator";

export class GameEngine {
    public app: PIXI.Application;
    public world: World;
    public renderer: WorldRenderer;
    public camera: Camera;
    private player: Player;
    private keys: Set<string>;

    constructor(app: PIXI.Application) {
        this.app = app;
        const generator = new WorldGenerator("seed");
        this.world = new World(16,generator);
        this.renderer = new WorldRenderer(this.world);
        this.camera = new Camera();
        this.player = new Player();

        this.keys = new Set<string>();

        window.addEventListener("keydown", (e) =>
            this.keys.add(e.key.toLowerCase())
        );
        window.addEventListener("keyup", (e) =>
            this.keys.delete(e.key.toLowerCase())
        );


    }

    async initialize() {
        await this.renderer.initialize();
        this.renderer.container.scale.x *= 4;
        this.renderer.container.scale.y *= 4;

        this.app.stage.addChild(this.renderer.container);
    }

    update(delta: number) {
        this.player.update(this.keys, delta);

        this.camera.follow(this.player, this.app.renderer.width, this.app.renderer.height);

        this.renderer.container.x = this.camera.x;
        this.renderer.container.y = this.camera.y;
    }
}
