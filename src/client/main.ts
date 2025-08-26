import {Application, Assets, Container, Sprite} from "pixi.js";
import Parser from "codebotsinterpreter";
import {getSpritesheets} from "./spritesheet_atlas";
import {drawItemBar, drawChestInventory} from "./interface/interfaces";

const parser = new Parser();
console.log(parser.test());

const app = new Application();
const scale = 64;

const run = async () => {
    await app.init({background: "transparent", resizeTo: window});
    document.body.appendChild(app.canvas);

    const spritesheets = await getSpritesheets();

    drawChestInventory(app, spritesheets, scale, []);
    drawItemBar(app, spritesheets, scale, []);
}

run();
