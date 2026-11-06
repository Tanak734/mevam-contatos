import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { env } from '../config/env.js';

const authPlugin: FastifyPluginAsync = async (server) => {
  await server.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({
        error: 'Não autorizado',
        message: 'Token JWT inválido, expirado ou ausente.',
      });
    }
  });
};

export default fp(authPlugin, { name: 'auth-plugin' });
