import { z } from 'zod';

export const residenciaEnum = z.enum(['casa', 'apartamento', 'condominio']);

export const CreateConnectSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, { message: 'O nome do Connect deve ter no mínimo 3 caracteres' })
    .max(100, { message: 'O nome do Connect deve ter no máximo 100 caracteres' }),
  lideres: z
    .string()
    .trim()
    .max(100, { message: 'O campo líderes deve ter no máximo 100 caracteres' })
    .optional()
    .nullable(),
  tipoResidencia: residenciaEnum.default('casa'),
  rua: z
    .string()
    .trim()
    .min(3, { message: 'Informe a rua ou avenida' })
    .max(100),
  numero: z
    .string()
    .trim()
    .min(1, { message: 'O número do endereço é obrigatório' })
    .max(10, { message: 'O número deve ter no máximo 10 caracteres' }),
  bairro: z
    .string()
    .trim()
    .min(2, { message: 'Informe o bairro' })
    .max(100),
  cidade: z
    .string()
    .trim()
    .min(2, { message: 'Informe a cidade' })
    .max(100)
    .default('Campinas'),
  complemento: z
    .string()
    .trim()
    .optional()
    .nullable(),
  cep: z
    .string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, {
      message: 'CEP inválido (use o formato 00000-000 ou 8 números)',
    })
    .transform((val) => {
      const digitos = val.replace(/\D/g, '');
      return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
    })
    .optional()
    .nullable(),
});

export const UpdateConnectSchema = CreateConnectSchema.partial();

export const ListConnectsQuerySchema = z.object({
  nome: z.string().trim().optional(),
  bairro: z.string().trim().optional(),
  cidade: z.string().trim().optional(),
  isAtivo: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const ConnectResponseSchema = z.object({
  id: z.uuid(),
  nome: z.string(),
  lideres: z.string().nullable(),
  tipoResidencia: residenciaEnum,
  rua: z.string(),
  numero: z.string(),
  bairro: z.string(),
  cidade: z.string(),
  complemento: z.string().nullable(),
  cep: z.string().nullable(),
  isAtivo: z.boolean(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ActionResponseSchema = z.object({
  message: z.string(),
});

export const PaginatedConnectResponseSchema = z.object({
  dados: z.array(ConnectResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPaginas: z.number(),
  }),
});

export type CreateConnectDTO = z.infer<typeof CreateConnectSchema>;
export type UpdateConnectDTO = z.infer<typeof UpdateConnectSchema>;
export type ListConnectsQueryDTO = z.infer<typeof ListConnectsQuerySchema>;
export type ConnectResponseDTO = z.infer<typeof ConnectResponseSchema>;
export type PaginatedConnectResponseDTO = z.infer<typeof PaginatedConnectResponseSchema>;
export type ActionResponseDTO = z.infer<typeof ActionResponseSchema>;