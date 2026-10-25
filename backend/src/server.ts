import path from 'node:path'
import dotenv from 'dotenv'

// Carrega .env do diretório atual e da raiz do projeto
dotenv.config()
dotenv.config({ path: path.resolve(process.cwd(), '../.env') })

import fastify from 'fastify'
import orm from './plugins/database.plugin.js'
import { serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod'
import { ConnectController } from './routes/connect.controller.js'

const app = fastify({
  logger: true
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// 1. Registra os plugins base (banco de dados primeiro para disponibilizar app.orm)
await app.register(orm)

// 2. Rota de Health Check
app.get('/health', async (req, res) => {
  try {
    await app.orm.$queryRaw`SELECT 1`

    return {
      database: 'connected',
      status: 'ok',
      timeStamp: new Date().toISOString()
    }
  } catch (error) {
    app.log.error({ err: error })

    return res.status(500).send({
      status: 'error',
      database: 'disconnected'
    })
  }
})

// 3. Registra os controllers de rotas
await app.register(ConnectController, { prefix: '/connects' })
//await app.register(, { prefix: '/users' })
//await app.register(, { prefix: '/visitantes' })
//await app.register(, { prefix: '/auth' })

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3337
    const host = process.env.HOST || '0.0.0.0'

    await app.listen({ port, host })

    console.log(`[Server] Servidor rodando em http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
