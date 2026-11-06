import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from '@fastify/type-provider-zod';
import { z } from 'zod';
import {
  ErrorResponseSchema,
  IdParamSchema,
  MessageResponseSchema,
} from '../../shared/schemas/common.schema.js';
import {
  CreateVisitanteSchema,
  ListVisitantesQuerySchema,
  PaginatedVisitanteResponseSchema,
  RegistrarDataContatoSchema,
  UpdateVisitanteSchema,
  VisitanteResponseSchema,
} from './visitante.dto.js';
import { VisitanteController } from './visitante.controller.js';
import { VisitanteService } from './visitante.service.js';

const HistoricoItemSchema = z.object({
  id: z.string().uuid(),
  visitanteId: z.string().uuid(),
  userId: z.string().uuid(),
  dataContato: z.date(),
  observacaoContato: z.string().nullable(),
  createdAt: z.date(),
  autor: z.object({
    id: z.string().uuid(),
    nome: z.string(),
    tipoUsuario: z.string(),
  }),
});

const ToggleAcompanhamentoResponseSchema = z.object({
  estouAcompanhando: z.boolean(),
  message: z.string(),
});

export async function visitanteRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const service = new VisitanteService(app.orm);
  const controller = new VisitanteController(service);

  // 1. Cadastrar Visitante (POST /visitantes)
  server.post(
    '/',
    {
      onRequest: [app.authenticate],
      schema: {
        body: CreateVisitanteSchema,
        response: {
          201: VisitanteResponseSchema,
          404: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => controller.create(request as any, reply)
  );

  // 2. Listagem paginada com busca, filtros e ordenações (GET /visitantes)
  server.get(
    '/',
    {
      onRequest: [app.authenticate],
      schema: {
        querystring: ListVisitantesQuerySchema,
        response: {
          200: PaginatedVisitanteResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => controller.list(request as any, reply)
  );

  // 3. Buscar Visitante por ID (GET /visitantes/:id)
  server.get(
    '/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        params: IdParamSchema,
        response: {
          200: VisitanteResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => controller.findById(request as any, reply)
  );

  // 4. Atualizar ficha do Visitante (PATCH /visitantes/:id)
  server.patch(
    '/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        params: IdParamSchema,
        body: UpdateVisitanteSchema,
        response: {
          200: VisitanteResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => controller.update(request as any, reply)
  );

  // 5. Registrar conversa / contato pastoral (POST /visitantes/:id/contato)
  server.post(
    '/:id/contato',
    {
      onRequest: [app.authenticate],
      schema: {
        params: IdParamSchema,
        body: RegistrarDataContatoSchema,
        response: {
          200: VisitanteResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => controller.registrarContato(request as any, reply)
  );

  // 6. Histórico de conversas (GET /visitantes/:id/historico)
  server.get(
    '/:id/historico',
    {
      onRequest: [app.authenticate],
      schema: {
        params: IdParamSchema,
        response: {
          200: z.array(HistoricoItemSchema),
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => controller.getHistoricoContatos(request as any, reply)
  );

  // 7. Alternar acompanhamento anti-colisão (POST /visitantes/:id/acompanhar)
  server.post(
    '/:id/acompanhar',
    {
      onRequest: [app.authenticate],
      schema: {
        params: IdParamSchema,
        response: {
          200: ToggleAcompanhamentoResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => controller.toggleAcompanhamento(request as any, reply)
  );

  // 8. Desativar visitante - Soft Delete (DELETE /visitantes/:id)
  server.delete(
    '/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        params: IdParamSchema,
        response: {
          200: MessageResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => controller.deactivate(request as any, reply)
  );
}
