import { buildApp } from './app.js';
import { env } from './config/env.js';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    const displayHost = env.HOST === '0.0.0.0' ? 'localhost' : env.HOST;
    console.log(`[Server] Servidor rodando em http://${displayHost}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
