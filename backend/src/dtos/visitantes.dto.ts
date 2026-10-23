import { z } from 'zod';
import { telefoneValidator } from '../plugins/phone.validator.js';

export const generoEnum = z.enum(['M', 'F']);

export const statusMembroEnum = z.enum([
  'nao_membro',
  'membro',
]);

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
  userId: z
    .uuid({ message: 'ID do usuário responsável inválido' }),
  connectId: z
    .uuid({ message: 'ID do Connect inválido' })
    .optional()
    .nullable(),
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
  observacao: z
    .string()
    .trim()
    .max(2000, { message: 'A observação deve ter no máximo 2000 caracteres' })
    .optional()
    .nullable(),
});

export const CreateVisitanteSchema = BaseVisitanteSchema.refine(
  (data) => {
    if (data.comoConheceu === 'outro') {
      return !!data.outroMeioConhecer && data.outroMeioConhecer.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Especifique como conheceu quando selecionar a opção "outro"',
    path: ['outroMeioConhecer'],
  }
);

export const UpdateVisitanteSchema = BaseVisitanteSchema.partial();

export const RegistrarDataContatoSchema = z.object({
  ultimoContato: z.coerce.date().default(() => new Date()),
  observacao: z.string().trim().max(2000).optional(),
});

export const ListVisitantesQuerySchema = z.object({
  busca: z.string().trim().optional(), // Busca simultânea por nome ou apelidoReferencia
  bairro: z.string().trim().optional(),
  cidadeMora: z.string().trim().optional(),
  statusMembro: statusMembroEnum.optional(),
  statusPessoa: statusPessoaEnum.optional(),
  connectId: z.uuid().optional(),
  userId: z.uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const VisitanteResponseSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  connectId: z.uuid().nullable(),
  nome: z.string(),
  apelidoReferencia: z.string().nullable(),
  telefone: z.string(),
  dataNascimento: z.date().nullable(),
  genero: generoEnum.nullable(),
  cidadeMora: z.string(),
  bairro: z.string().nullable(),
  statusMembro: statusMembroEnum,
  statusPessoa: statusPessoaEnum.nullable(),
  tempoMembro: z.date().nullable(),
  comoConheceu: comoConheceuEnum,
  outroMeioConhecer: z.string().nullable(),
  ultimoContato: z.date().nullable(),
  observacao: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  diasSemContato: z.number().nullable().optional(),
  statusAlerta: z.enum(['regular', 'atencao', 'critico']).optional(),
});

export type CreateVisitanteDTO = z.infer<typeof CreateVisitanteSchema>;
export type UpdateVisitanteDTO = z.infer<typeof UpdateVisitanteSchema>;
export type VisitanteResponseDTO = z.infer<typeof VisitanteResponseSchema>;
export type RegistrarDataContatoDTO = z.infer<typeof RegistrarDataContatoSchema>;
export type ListVisitantesQueryDTO = z.infer<typeof ListVisitantesQuerySchema>;