import {Application, Assets, RenderLayer, SCALE_MODES, Sprite, Spritesheet, spritesheetAsset, Texture} from "pixi.js";
import Parser from "codebotsinterpreter";
import WaveFunctionCollapse from "./wave_function_collapse";
import textures from "./wave_function_collapse/textures";
import atlas from "./spritesheet_atlas";

const parser = new Parser();
console.log(parser.test());

(async () => {
    const app = new Application();

    await app.init({
        background: "white",
        resizeTo: window,
    });
    document.body.appendChild(app.canvas);

    const spritesheetAsset = await Assets.load({
        src: atlas.meta.image,
        data: {scaleMode: SCALE_MODES.NEAREST},
    });
    const spritesheet = new Spritesheet(spritesheetAsset, atlas);
    await spritesheet.parse();

    const gridSize = {
        width: 8,
        height: 8,
    };
    const wfc = new WaveFunctionCollapse(textures, gridSize);
    const result = wfc.run();

    const cellSize = 64;

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
