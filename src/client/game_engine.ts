import { Camera } from "./world/camera";
import { Player } from "./entity/player";
import { WorldRenderer } from "./renderer/world_renderer";
import { World } from "./world/world";
import * as PIXI from "pixi.js";
import { WorldGenerator } from "./world/world_generator";
import { CHUNK_SIZE } from "./constants";
import { Codebot } from "./entity/codebot";

export class GameEngine {
    public app: PIXI.Application;
    public world: World;
    public renderer: WorldRenderer;
    public camera: Camera;
    private player: Player;
    private keys: Set<string>;
    private codebots: Codebot[];

    constructor(app: PIXI.Application) {
        this.app = app;
        const generator = new WorldGenerator("seed");
        this.world = new World(generator);
        this.renderer = new WorldRenderer(this.world);
        this.camera = new Camera();
        this.camera.zoom = 2;
        this.player = new Player();
        this.codebots = [];

        // TODO test only
        this.codebots.push(new Codebot());

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
        this.renderer.container.scale.set(this.camera.zoom);
        this.app.stage.addChild(this.renderer.container);
    }

    update(delta: number) {
        this.player.update(this.keys, delta);

        const newCX = Math.floor(this.player.posX / CHUNK_SIZE);
        const newCY = Math.floor(this.player.posY / CHUNK_SIZE);

        if (newCX !== this.player.cX || newCY !== this.player.cY) {
            this.player.cX = newCX;
            this.player.cY = newCY;

            const entities = [this.player, ...this.codebots /* , ...robots plus tard */];
            this.world.updateLoadedChunks(entities);

            // 2. recalcul rendu
            const visibleChunks = this.world.getChunksInVisibleRange(this.player);
            this.renderer.render(visibleChunks);
        }

        this.camera.follow(this.player, this.app.screen.width, this.app.screen.height);
        this.renderer.container.x = this.camera.x;
        this.renderer.container.y = this.camera.y;
    }
}
