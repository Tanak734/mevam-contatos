import fastify from 'fastify'
import orm from './plugins/database.plugin.js'
import 'dotenv/config'

const app = fastify({
  logger: true
})

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

const start = async () => {
  try {
    await app.register(orm)

    await app.listen({
      port: Number(process.env.PORT) || 3333
    })

    console.log(`[Server] Servidor rodando em http://localhost:${process.env.PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()