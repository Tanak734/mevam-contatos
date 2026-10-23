import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../config/database.config.js'

// Tipagem para estender a interface do FastifyInstance
declare module 'fastify' {
  interface FastifyInstance {
    orm: typeof prisma 
  }
}

const databasePlugin: FastifyPluginAsync = async (app) => {
  app.decorate('orm', prisma)

  app.addHook('onClose', async (server) => {
    await server.orm.$disconnect()
  })
}

export default fp(databasePlugin)