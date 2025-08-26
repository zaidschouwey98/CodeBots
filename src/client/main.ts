import {Application} from 'pixi.js';
import {WorldRenderer} from './renderer/world_renderer';
import {World} from './world/world';
import {WorldGenerator} from './world/world_generator';
import {getSpritesheets} from './spritesheet_atlas';
import {Interface} from './interface/interfaces';
import {Recipe} from './items/item';

const exampleRecipes: Recipe[] = [
    {inputs: [{spriteName: "wood_log", quantity: 1}], output: {spriteName: "wood_plank", quantity: 4}},
    {inputs: [{spriteName: "iron_ingot", quantity: 1}], output: {spriteName: "nail", quantity: 16}},
    {inputs: [{spriteName: "wood_plank", quantity: 12}, {spriteName: "nail", quantity: 64}], output: {spriteName: "crate", quantity: 1}},
    {inputs: [{spriteName: "stone", quantity: 8}, {spriteName: "coal", quantity: 2}, {spriteName: "iron_ore", quantity: 1}], output: {spriteName: "furnace_off", quantity: 1}},
    {inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {spriteName: "nail", quantity: 16}], output: {spriteName: "pickaxe", quantity: 1}},
    {inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {spriteName: "nail", quantity: 8}], output: {spriteName: "shovel", quantity: 1}},
    {inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {spriteName: "nail", quantity: 16}], output: {spriteName: "axe", quantity: 1}},
];

(async () => {
    // Create a new application
    const app = new Application();
    const scale = 64;

    // Initialize the application
    await app.init({background: '#1099bb', resizeTo: window});

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    const generator = new WorldGenerator("dwadsfe");

    // Création du monde
    const world = new World(16, generator); // chunkSize = 16

    // Création du renderer
    const worldRenderer = new WorldRenderer(world, 16);
    app.stage.addChild(worldRenderer.container);
    await worldRenderer.initialize();

    // Ajouter le container du renderer à la scène
    const spritesheets = await getSpritesheets();
    const gui = new Interface(app, spritesheets, scale);

    gui.drawCraftingInterface(exampleRecipes);

    gui.drawItemBar([
        {spriteName: "pickaxe", quantity: 1},
        {spriteName: "shovel", quantity: 1},
        null,
        {spriteName: "stone", quantity: 64},
        null,
        null,
    ]);
})();
