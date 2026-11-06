import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../config/database.config.js';
import { JWTPayloadDTO } from '../modules/auth/auth.dto.js';

declare module 'fastify' {
  interface FastifyInstance {
    orm: typeof prisma;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayloadDTO;
    user: JWTPayloadDTO;
  }
}
