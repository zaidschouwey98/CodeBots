import {Application} from "pixi.js";
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

    interfaceInstance.drawChestInventory([
        {spriteName: "pickaxe", quantity: 1},
        {spriteName: "shovel", quantity: 1},
        {spriteName: "axe", quantity: 1},
        null,
        {spriteName: "stone", quantity: 64},
        {spriteName: "coal", quantity: 128},
        {spriteName: "copper", quantity: 32},
        null,
        null,
        null,
        {spriteName: "iron", quantity: 9999},
        null,
        {spriteName: "iron_frame", quantity: 5},
        {spriteName: "iron_plate", quantity: 3},
    ]);
    interfaceInstance.drawItemBar([
        {spriteName: "pickaxe", quantity: 1},
        {spriteName: "shovel", quantity: 1},
        null,
        {spriteName: "stone", quantity: 64},
        null,
        null,
    ]);
}

run();
