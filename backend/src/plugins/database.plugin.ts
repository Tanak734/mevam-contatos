import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../config/database.config.js';

const databasePlugin: FastifyPluginAsync = async (app) => {
  app.decorate('orm', prisma);

  app.addHook('onClose', async (server) => {
    await server.orm.$disconnect();
  });
};

export default fp(databasePlugin, { name: 'database-plugin' });
