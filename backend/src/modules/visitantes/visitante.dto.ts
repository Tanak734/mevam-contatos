import { z } from 'zod';
import {
  createPaginatedResponseSchema,
  PaginationQuerySchema,
} from '../../shared/schemas/common.schema.js';
import { telefoneValidator } from '../../shared/validators/phone.validator.js';
import { generoEnum } from '../users/user.dto.js';

export { generoEnum };

export const estadoCivilEnum = z.enum([
  'solteiro',
  'casado',
  'divorciado',
  'viuvo',
  'outro',
]);

export const statusMembroEnum = z.enum(['nao_membro', 'membro']);

export const statusPessoaEnum = z.enum([
  'novo_convertido',
  'afastado',
  'em_transicao',
  'outra_igreja',
  'lideranca_outra_igreja',
  'uber',
]);

export const comoConheceuEnum = z.enum([
  'amigo',
  'familia',
  'convite_pessoa',
  'redes_sociais',
  'youtube',
  'oracao_12h',
  'google_maps',
  'passando_proximo',
  'connect',
  'acao_social',
  'evento',
  'outro',
]);

const BaseVisitanteSchema = z.object({
  userId: z.string().uuid({ message: 'ID do usuário responsável inválido' }).optional(),
  connectId: z.string().uuid({ message: 'ID do Connect inválido' }).optional().nullable(),
  nome: z
    .string()
    .trim()
    .min(3, { message: 'O nome deve ter no mínimo 3 caracteres' })
    .max(100, { message: 'O nome deve ter no máximo 100 caracteres' })
    .regex(/^[\p{L}\s'-]+$/u, {
      message: 'O nome deve conter apenas letras e espaços',
    }),
  apelidoReferencia: z
    .string()
    .trim()
    .max(120, { message: 'A referência/apelido deve ter no máximo 120 caracteres' })
    .optional()
    .nullable(),
  telefone: telefoneValidator,
  dataNascimento: z.coerce
    .date({ message: 'Data de nascimento inválida' })
    .min(new Date('1900-01-01'), { message: 'A data deve ser posterior a 1900' })
    .max(new Date(), { message: 'A data de nascimento não pode estar no futuro' })
    .optional()
    .nullable(),
  genero: generoEnum.optional().nullable(),
  estadoCivil: estadoCivilEnum.default('solteiro'),
  cidadeMora: z
    .string()
    .trim()
    .min(2, { message: 'Informe a cidade' })
    .max(100)
    .default('Campinas'),
  bairro: z
    .string()
    .trim()
    .min(2, { message: 'O bairro deve ter no mínimo 2 caracteres' })
    .max(255)
    .optional()
    .nullable(),
  statusMembro: statusMembroEnum.default('nao_membro'),
  statusPessoa: statusPessoaEnum.optional().nullable(),
  tempoMembro: z.coerce
    .date({ message: 'Data de membresia inválida' })
    .max(new Date(), { message: 'A data de membresia não pode estar no futuro' })
    .optional()
    .nullable(),
  comoConheceu: comoConheceuEnum,
  outroMeioConhecer: z
    .string()
    .trim()
    .max(150, { message: 'A descrição deve ter no máximo 150 caracteres' })
    .optional()
    .nullable(),
  ultimoContato: z.coerce.date().optional().nullable(),
  observacaoPessoa: z
    .string()
    .trim()
    .max(2000, { message: 'A observação deve ter no máximo 2000 caracteres' })
    .optional()
    .nullable(),
});

export const CreateVisitanteSchema = BaseVisitanteSchema;

export const UpdateVisitanteSchema = BaseVisitanteSchema.partial();

export const RegistrarDataContatoSchema = z.object({
  dataContato: z.coerce.date().default(() => new Date()),
  observacaoContato: z.string().trim().max(2000).optional(),
  apelidoReferencia: z.string().trim().max(120).optional(),
  observacaoPessoa: z.string().trim().max(2000).optional(),
});

export const ListVisitantesQuerySchema = PaginationQuerySchema.extend({
  busca: z.string().trim().optional(),
  bairro: z.string().trim().optional(),
  cidadeMora: z.string().trim().optional(),
  statusMembro: statusMembroEnum.optional(),
  statusPessoa: statusPessoaEnum.optional(),
  connectId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  ordenarPor: z
    .enum([
      'dias_sem_contato_desc',
      'dias_sem_contato_asc',
      'nome_asc',
      'nome_desc',
      'data_cadastro_desc',
      'data_cadastro_asc',
      'ultimo_contato_desc',
      'ultimo_contato_asc',
      'bairro_asc',
    ])
    .optional(),
});

export const VisitanteResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  connectId: z.string().uuid().nullable(),
  nome: z.string(),
  apelidoReferencia: z.string().nullable(),
  telefone: z.string(),
  dataNascimento: z.date().nullable(),
  genero: generoEnum.nullable(),
  estadoCivil: estadoCivilEnum,
  cidadeMora: z.string(),
  bairro: z.string().nullable(),
  statusMembro: statusMembroEnum,
  statusPessoa: statusPessoaEnum.nullable(),
  tempoMembro: z.date().nullable(),
  comoConheceu: comoConheceuEnum,
  outroMeioConhecer: z.string().nullable(),
  ultimoContato: z.date().nullable(),
  observacaoPessoa: z.string().nullable(),
  isAtivo: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  diasSemContato: z.number().nullable().optional(),
  statusAlerta: z.enum(['em_dia', 'atencao', 'urgente', 'critico']).optional(),
  outrasPessoasAcompanhando: z.number().default(0),
  estouAcompanhando: z.boolean().default(false),
});

export const PaginatedVisitanteResponseSchema =
  createPaginatedResponseSchema(VisitanteResponseSchema);

export type CreateVisitanteDTO = z.infer<typeof CreateVisitanteSchema>;
export type UpdateVisitanteDTO = z.infer<typeof UpdateVisitanteSchema>;
export type VisitanteResponseDTO = z.infer<typeof VisitanteResponseSchema>;
export type PaginatedVisitanteResponseDTO = z.infer<typeof PaginatedVisitanteResponseSchema>;
export type RegistrarDataContatoDTO = z.infer<typeof RegistrarDataContatoSchema>;
export type ListVisitantesQueryDTO = z.infer<typeof ListVisitantesQuerySchema>;
