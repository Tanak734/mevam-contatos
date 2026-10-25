import { z } from 'zod';
import { telefoneValidator } from '../plugins/phone.validator.js';

export const generoEnum = z.enum(['M', 'F']);

export const tipoUsuarioEnum = z.enum([
  'usuario_externo',
  'lider',
  'minis_acolhimento',
  'super_user',
]);

export const CreateUserSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(5, { message: 'O nome deve ter no mínimo 5 caracteres' })
    .max(100, { message: 'O nome deve ter no máximo 100 caracteres' }),
  telefone: telefoneValidator,
  senha: z
    .string()
    .min(10, { message: 'A senha deve ter no mínimo 10 caracteres' })
    .max(100, { message: 'A senha deve ter no máximo 100 caracteres' }),
  genero: generoEnum.optional().nullable(),
  tipoUsuario: tipoUsuarioEnum.default('usuario_externo'),
  isAdmin: z.boolean().default(false),
  isAtivo: z.boolean().default(true),
});

export const UpdateUserSchema = CreateUserSchema.partial();

export const UserResponseSchema = z.object({
  id: z.uuid(),
  nome: z.string(),
  telefone: z.string(),
  genero: generoEnum.nullable(),
  tipoUsuario: tipoUsuarioEnum,
  isAdmin: z.boolean(),
  isAtivo: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
export type UserResponseDTO = z.infer<typeof UserResponseSchema>;