import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import { JWTPayloadDTO } from '../dtos/auth.dto.js'

// 1. Ensinamos o TypeScript que o request.user existe e tem o formato do nosso DTO
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayloadDTO
    user: JWTPayloadDTO
  }
}

const authPlugin: FastifyPluginAsync = fp(async (server) => {
  // 2. Registramos o plugin oficial passando a chave secreta do .env
  server.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'fallback-secreto',
    sign: {
      expiresIn: '7d', // O token expira em 7 dias
    },
  })

  // 3. Criamos o decorador `authenticate` que funciona como um "porteiro"
  server.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // O fastify-jwt lê automaticamente o header: "Authorization: Bearer <token>"
        await request.jwtVerify()
      } catch (err) {
        return reply.status(401).send({
          error: 'Não autorizado',
          message: 'Token JWT inválido, expirado ou ausente.',
        })
      }
    }
  )
})

export default authPlugin