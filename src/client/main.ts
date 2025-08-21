import {Application, Assets, Sprite, Texture} from "pixi.js";
import Parser from "codebotsinterpreter";
import WaveFunctionCollapse from "./wave_function_collapse";
import textures, {getTextureAssetName} from "./wave_function_collapse/textures";


const parser = new Parser();
console.log(parser.test());

(async () => {
    const app = new Application();

    await app.init({
        background: "white",
        resizeTo: window,
    });
    document.body.appendChild(app.canvas);

    await Assets.load(textures.map(({name}) => getTextureAssetName(name)));

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

        const sprite = new Sprite(Texture.from(getTextureAssetName(name)));
        sprite.width = cellSize;
        sprite.height = cellSize;
        sprite.x = x * cellSize;
        sprite.y = y * cellSize;
        sprite.anchor.set(0.5);
        sprite.rotation = (Math.PI / 2) * rotation;

        app.stage.addChild(sprite);
    });
})();
