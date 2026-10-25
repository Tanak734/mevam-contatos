import path from 'node:path'
import dotenv from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Carrega o .env local ou da raiz do projeto
dotenv.config()
dotenv.config({ path: path.resolve(process.cwd(), '../.env') })

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL não foi encontrada. Verifique as configurações no arquivo .env.')
}

const adapter = new PrismaPg({ connectionString })

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
})
