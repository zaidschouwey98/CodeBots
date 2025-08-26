import {Application, Assets, Container, Sprite} from "pixi.js";
import Parser from "codebotsinterpreter";
import {getSpritesheets} from "./spritesheet_atlas";
import {Interface} from "./interface/interfaces";

const parser = new Parser();
console.log(parser.test());

const app = new Application();
const scale = 64;

const run = async () => {
    await app.init({background: "transparent", resizeTo: window});
    document.body.appendChild(app.canvas);

    const spritesheets = await getSpritesheets();

    const interfaceInstance = new Interface(app, spritesheets, scale);
    interfaceInstance.drawChestInventory([]);
    interfaceInstance.drawItemBar([]);
}

run();
