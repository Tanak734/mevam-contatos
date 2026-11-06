import { z } from 'zod';

export const IdParamSchema = z.object({
  id: z.string().uuid({ message: 'O identificador fornecido não é um UUID válido' }),
});

export const ErrorResponseSchema = z.object({
  message: z.string(),
});

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const PaginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPaginas: z.number(),
});

export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    dados: z.array(itemSchema),
    meta: PaginationMetaSchema,
  });
}

export type IdParamDTO = z.infer<typeof IdParamSchema>;
export type MessageResponseDTO = z.infer<typeof MessageResponseSchema>;
