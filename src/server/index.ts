import {Hono} from "hono";
import {serve} from "@hono/node-server";
import {serveStatic} from "@hono/node-server/serve-static";

const app = new Hono();

// Exemple API
app.get("/api/hello", (c) => c.json({message: "Hello from Hono 🚀"}));

// En production : servir le build de Vite
app.use("/*", serveStatic({root: "./dist/client"}));

serve({
    fetch: app.fetch,
    port: Number(process.env.PORT) || 8080,
});
