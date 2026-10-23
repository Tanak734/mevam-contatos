// src/plugins/auth.plugin.ts
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import { JWTPayloadDTO } from '../dtos/auth.dto.js'

// Extensão das tipagens nativas do Fastify
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayloadDTO // Aqui injetamos o nosso DTO do Zod!
    user: JWTPayloadDTO    // Faz com que request.user seja exatamente do tipo JwtPayloadDTO
  }
}