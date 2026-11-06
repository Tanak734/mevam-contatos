import { z } from 'zod';
import { telefoneValidator } from '../../shared/validators/phone.validator.js';
import { tipoUsuarioEnum, UserResponseSchema } from '../users/user.dto.js';

export const LoginSchema = z.object({
  telefone: telefoneValidator,
  senha: z
    .string()
    .min(10, { message: 'A senha deve ter no mínimo 10 caracteres' })
    .max(100, { message: 'A senha deve ter no máximo 100 caracteres' }),
});

export const LoginSquema = LoginSchema;

export const LoginResponseSchema = z.object({
  token: z.string({ message: 'O token deve ser uma string' }),
  user: UserResponseSchema,
});

export const JWTPayloadSchema = z.object({
  sub: z.string().uuid({ message: 'O UUID não é válido' }),
  nome: z.string({ message: 'O texto não é válido' }),
  tipoUser: tipoUsuarioEnum,
  isAdmin: z.boolean(),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
export type LoginResponseDTO = z.infer<typeof LoginResponseSchema>;
export type JWTPayloadDTO = z.infer<typeof JWTPayloadSchema>;
