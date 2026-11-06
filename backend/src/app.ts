import fastify from 'fastify';
import cors from '@fastify/cors';
import {
  serializerCompiler,
  validatorCompiler,
} from '@fastify/type-provider-zod';
import { env } from './config/env.js';
import authPlugin from './plugins/auth.plugin.js';
import databasePlugin from './plugins/database.plugin.js';
import { registerErrorHandler } from './plugins/error-handler.plugin.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { connectRoutes } from './modules/connects/connect.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { visitanteRoutes } from './modules/visitantes/visitante.routes.js';

export async function buildApp() {
  const app = fastify({
    logger: env.NODE_ENV !== 'test',
  });

  // Habilitar CORS para permitir conexões do Frontend
  const origins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  await app.register(cors, {
    origin: origins.length === 1 ? origins[0] : origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  registerErrorHandler(app);

  await app.register(databasePlugin);
  await app.register(authPlugin);

  app.get('/health', async (_req, res) => {
    try {
      await app.orm.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        timeStamp: new Date().toISOString(),
      };
    } catch (error) {
      app.log.error({ err: error }, 'Database health check failed');
      return res.status(500).send({
        status: 'error',
        database: 'disconnected',
      });
    }
  });

  await app.register(connectRoutes, { prefix: '/connects' });
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(userRoutes, { prefix: '/users' });
  await app.register(visitanteRoutes, { prefix: '/visitantes' });

  return app;
}
