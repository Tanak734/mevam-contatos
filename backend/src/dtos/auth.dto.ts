import {z} from 'zod'
import { telefoneValidator } from '../plugins/phone.validator.js'
import { tipoUsuarioEnum, UserResponseSchema } from './usuario.dto.js'

export const LoginSquema = z.object({
  telefone: telefoneValidator,
  senha: z
    .string()
    .min(10, { message: 'A senha deve ter no mínimo 10 caracteres' })
    .max(100, { message: 'A senha deve ter no máximo 100 caracteres' })
});

export const LoginResponseSchema = z.object({
  token: z.string("O tokem deve ser uma string"),
  user: UserResponseSchema
});

export const JWTPayloadSchema  = z.object({
  sub: z.uuid("O uuid não é valido"),
  nome: z.string("O texto nao é valido"),
  tipoUser: tipoUsuarioEnum,
  isAdmin: z.boolean()
});

export type LoginDTO = z.infer<typeof LoginSquema>;
export type LoginResponseDTO = z.infer<typeof LoginResponseSchema>;
export type JWTPayloadDTO = z.infer<typeof JWTPayloadSchema>;
