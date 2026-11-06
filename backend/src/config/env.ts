import 'dotenv/config';
import { z } from 'zod';

const dotEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3337),
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL inválida ou ausente no .env' }),
  JWT_SECRET: z
    .string()
    .min(32, { message: 'JWT_SECRET deve ter no mínimo 32 caracteres' })
    .default('fallback-secreto-desenvolvimento-32chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Seed Admin
  ADMIN_SEED_NOME: z.string(),
  ADMIN_SEED_TELEFONE: z.string(),
  ADMIN_SEED_SENHA: z.string().min(10, { message: 'ADMIN_SEED_SENHA deve ter no mínimo 10 caracteres' }).default('admin123456*'),
});

const _env = dotEnvSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Variáveis de ambiente inválidas:', _env.error);
  throw new Error('Falha na validação das variáveis de ambiente.');
}

export const env = _env.data;
