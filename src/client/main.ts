import { Application, Assets, Container, Sprite } from 'pixi.js';
import { WorldRenderer } from './renderer/world_renderer';
import { World } from './world/world';
import { WorldGenerator } from './world/world_generator';

(async () => {
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({ background: '#1099bb', resizeTo: window });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);


    const generator = new WorldGenerator("maSeed");

    // Création du monde
    const world = new World(16, generator); // chunkSize = 16

    // Création du renderer
    const worldRenderer = new WorldRenderer(world, 16);
    app.stage.addChild(worldRenderer.container);
    await worldRenderer.initialize();

    // Ajouter le container du renderer à la scène




})();
