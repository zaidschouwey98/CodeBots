import $ from "jquery";
import {Application, Assets, SCALE_MODES, Sprite, Spritesheet} from "pixi.js";
import WaveFunctionCollapse from "../wave_function_collapse";
import textures from "../wave_function_collapse/textures";
import atlas from "../spritesheet_atlas";

(async () => {
    const cellSize = 16;
    const scale = 4;

    const container = document.querySelector(".background-image");
    if (!(container instanceof HTMLElement)) {
        throw new Error("no container");
    }

    const gridSize = {
        width: Math.ceil($(container).width()! / (cellSize * scale)),
        height: Math.ceil($(container).height()! / (cellSize * scale)),
    };

    const app = new Application();

    await app.init({
        background: "transparent",
        resizeTo: container,
    });
    app.stage.scale.set(scale);

    app.canvas.id = "background";

    container.appendChild(app.canvas);

    const spritesheetAsset = await Assets.load({
        src: atlas.meta.image,
        data: {scaleMode: SCALE_MODES.NEAREST},
    });
    const spritesheet = new Spritesheet(spritesheetAsset, atlas);
    await spritesheet.parse();

    const wfc = new WaveFunctionCollapse(textures, gridSize);
    const result = wfc.run();

    result.forEach(({name, rotation}, i) => {
        const x = i % gridSize.width;
        const y = Math.floor(i / gridSize.width);

        const sprite = new Sprite(spritesheet.textures[name]);

        sprite.width = cellSize;
        sprite.height = cellSize;
        sprite.x = x * cellSize + cellSize / 2;
        sprite.y = y * cellSize + cellSize / 2;
        sprite.anchor.set(0.5);
        sprite.rotation = (Math.PI / 2) * rotation;

        app.stage.addChild(sprite);

        if (name === "grass") {
            if (Math.random() < 0.1) {
                const overlay = new Sprite(spritesheet.textures["flower"]);

                overlay.width = cellSize;
                overlay.height = cellSize;
                overlay.x = x * cellSize + cellSize / 2;
                overlay.y = y * cellSize + cellSize / 2;
                overlay.anchor.set(0.5);

                app.stage.addChild(overlay);
            }
        } else if (Math.random() < 0.4) {
            const overlay = new Sprite(spritesheet.textures["iron"]);

            overlay.width = cellSize;
            overlay.height = cellSize;
            overlay.x = x * cellSize + cellSize / 2;
            overlay.y = y * cellSize + cellSize / 2;
            overlay.anchor.set(0.5);

            app.stage.addChild(overlay);
        }
    });
})();
