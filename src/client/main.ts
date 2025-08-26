import { Application, Assets, Container, Sprite } from 'pixi.js';
import { WorldRenderer } from './renderer/world_renderer';
import { World } from './world/world';
import { WorldGenerator } from './world/world_generator';
import { getSpritesheets } from './spritesheet_atlas';
import { Interface } from './interface/interfaces';
import{ Item } from './items/item';

(async () => {
    // Create a new application
    const app = new Application();
    const scale = 64;

    // Initialize the application
    await app.init({ background: '#1099bb', resizeTo: window });

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
    const interfaceInstance = new Interface(app, spritesheets, scale);

    const exampleChestInventory: Item[] = [
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
    ];
    interfaceInstance.drawChestInventory(exampleChestInventory);
    interfaceInstance.drawItemBar([
        {spriteName: "pickaxe", quantity: 1},
        {spriteName: "shovel", quantity: 1},
        null,
        {spriteName: "stone", quantity: 64},
        null,
        null,
    ]);
})();
