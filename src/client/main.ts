import {Application} from 'pixi.js';

import {GameEngine} from './game_engine';
import {CoreStep, Recipe} from "./items/item";
import {getSpritesheets} from "./spritesheet_atlas";
import {Interface} from "./interface/interfaces";

const exampleRecipes: Recipe[] = [
    {inputs: [{spriteName: "wood_log", quantity: 1}], output: {spriteName: "wood_plank", quantity: 4}},
    {inputs: [{spriteName: "iron_ingot", quantity: 1}], output: {spriteName: "nail", quantity: 16}},
    {
        inputs: [{spriteName: "wood_plank", quantity: 12}, {spriteName: "nail", quantity: 64}],
        output: {spriteName: "crate", quantity: 1}
    },
    {
        inputs: [{spriteName: "stone", quantity: 8}, {spriteName: "coal", quantity: 2}, {
            spriteName: "iron_ore",
            quantity: 1
        }], output: {spriteName: "furnace_off", quantity: 1}
    },
    {
        inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {
            spriteName: "nail",
            quantity: 16
        }], output: {spriteName: "pickaxe", quantity: 1}
    },
    {
        inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {
            spriteName: "nail",
            quantity: 8
        }], output: {spriteName: "shovel", quantity: 1}
    },
    {
        inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {
            spriteName: "nail",
            quantity: 16
        }], output: {spriteName: "axe", quantity: 1}
    },
];

const exampleCoreStep: CoreStep = {
    stepNumber: 1,
    items: [
        {spriteName: "wood_plank", currentGathered: 2500, goal: 2500},
        {spriteName: "stone", currentGathered: 0, goal: 800},
        {spriteName: "coal", currentGathered: 1843, goal: 3000},
        {spriteName: "iron_ore", currentGathered: 0, goal: 5},
        {spriteName: "iron_ingot", currentGathered: 515, goal: 3000},
        {spriteName: "nail", currentGathered: 0, goal: 9000},
        {spriteName: "crate", currentGathered: 0, goal: 50},
        {spriteName: "furnace_off", currentGathered: 1, goal: 3},
        {spriteName: "pickaxe", currentGathered: 1, goal: 1},
        {spriteName: "shovel", currentGathered: 0, goal: 1},
        {spriteName: "axe", currentGathered: 1, goal: 1},

    ]
};

(async () => {
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({
        background: '#1099bb',
        resizeTo: window,
    });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);
    const engine = new GameEngine(app);
    await engine.initialize();

    // const cameraX = 0;
    app.ticker.add((delta) => {
        // Suivre une position cible
        engine.update(delta.deltaTime);
    });

    //TODO : adjust guiScale based on screen size (64 is good for 1920x1080)
    const guiScale = 64;
    const spritesheets = await getSpritesheets();
    const gui = new Interface(app, spritesheets, guiScale);

    //gui.drawCraftingInterface(exampleRecipes);
    gui.drawCoreInterface(exampleCoreStep);

    gui.drawItemBar([
        {spriteName: "pickaxe", quantity: 1},
        {spriteName: "shovel", quantity: 1},
        null,
        {spriteName: "stone", quantity: 64},
        null,
        null,
    ]);

})();
