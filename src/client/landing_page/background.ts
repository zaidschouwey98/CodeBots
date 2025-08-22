import $ from "jquery";
import {Application, Sprite} from "pixi.js";
import WaveFunctionCollapse from "../wave_function_collapse";
import textures from "../wave_function_collapse/textures";
import {findTexture, getSpritesheets} from "../spritesheet_atlas";

(async () => {
    const cellSize = 16;
    const scale = 4;

    const container = document.querySelector(".background-image");
    if (!(container instanceof HTMLElement)) {
        throw new Error("invalid container");
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

    const spritesheets = await getSpritesheets();

    const wfc = new WaveFunctionCollapse(textures, gridSize);
    const result = wfc.run();

    result.forEach(({name, rotation, overlay}, i) => {
        const x = i % gridSize.width;
        const y = Math.floor(i / gridSize.width);

        const sprite = new Sprite(findTexture(spritesheets, name));

        sprite.x = x * cellSize + sprite.width / 2;
        sprite.y = y * cellSize + sprite.height / 2;
        sprite.pivot.set(cellSize / 2, cellSize / 2);
        sprite.rotation = (Math.PI / 2) * rotation;

        app.stage.addChild(sprite);

        if (overlay) {
            const sprite = new Sprite(findTexture(spritesheets, overlay));

            sprite.x = x * cellSize - sprite.width + cellSize;
            sprite.y = y * cellSize - sprite.height + cellSize;

            app.stage.addChild(sprite);
        }
    });
})();
