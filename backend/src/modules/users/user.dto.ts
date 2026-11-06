import { z } from 'zod';
import {
  createPaginatedResponseSchema,
  PaginationQuerySchema,
} from '../../shared/schemas/common.schema.js';
import { telefoneValidator } from '../../shared/validators/phone.validator.js';

export const generoEnum = z.enum(['M', 'F']);

export const tipoUsuarioEnum = z.enum([
  'usuario_externo',
  'voluntario_acolhimento',
  'lider_connect',
  'supervisor',
  'presbitero',
  'pastor',
  'admin',
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

export const PaginatedUserQuerySchema = PaginationQuerySchema.extend({
  nome: z.string().trim().optional(),
  telefone: z.string().trim().optional(),
  genero: generoEnum.optional(),
  tipoUsuario: tipoUsuarioEnum.optional(),
  isAdmin: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  isAtivo: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  telefone: z.string(),
  genero: generoEnum.nullable(),
  tipoUsuario: tipoUsuarioEnum,
  isAdmin: z.boolean(),
  isAtivo: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});


export const PaginatedUserResponseSchema = createPaginatedResponseSchema(UserResponseSchema);

export const ChangeAdminSchema = z.object({
  isAdmin: z.boolean({ message: 'O campo isAdmin deve ser booleano' }),
});

export type ChangeAdminDTO = z.infer<typeof ChangeAdminSchema>;
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
export type PaginatedUserQueryDTO = z.infer<typeof PaginatedUserQuerySchema>;
export type UserResponseDTO = z.infer<typeof UserResponseSchema>;
export type PaginatedUserResponseDTO = z.infer<typeof PaginatedUserResponseSchema>;
