import { Application} from 'pixi.js';

import { GameEngine } from './game_engine';

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
})();
