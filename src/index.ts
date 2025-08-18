import {Hono} from 'hono';
import {serve} from '@hono/node-server';

const app = new Hono();
serve({
    fetch: app.fetch,
    port: Number(process.env.PORT) || 8080,
});

app.get('/', (c) => c.text('Hono!'));
