import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from '@fastify/type-provider-zod';
import { z } from 'zod';
import { ConnectService } from '../services/connect.service.js';
import {
  CreateConnectSchema,
  UpdateConnectSchema,
  ListConnectsQuerySchema,
  ConnectResponseSchema,
  PaginatedConnectResponseSchema,
  ActionResponseSchema,
} from '../dtos/connect.dto.js';

// Schema para validação do parâmetro :id na URL
const ConnectParamsSchema = z.object({
  id: z.uuid('O identificador fornecido não é um UUID válido'),
});

// Schema padronizado para respostas de erro da API
const ErrorResponseSchema = z.object({
  message: z.string(),
});


export async function ConnectController(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Injeção da instância do Prisma registrada no Fastify (ex: app.db ou app.prisma)
  const connectService = new ConnectService(app.orm);

  // -------------------------------------------------------------
  // POST /connects - Criar um novo Connect
  // -------------------------------------------------------------
  server.post(
    '/',
    {
      schema: {
        body: CreateConnectSchema,
        response: {
          201: ConnectResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const novoConnect = await connectService.create(request.body);
        return reply.status(201).send(novoConnect);
      } catch (err: any) {
        if (err.message === 'O Connect ja existe') {
          return reply.status(409).send({ message: err.message });
        }
        throw err;
      }
    }
  );

  // -------------------------------------------------------------
  // GET /connects - Listagem com filtros e paginação
  // -------------------------------------------------------------
  server.get(
    '/',
    {
      schema: {
        querystring: ListConnectsQuerySchema,
        response: {
          200: PaginatedConnectResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const resultado = await connectService.listar(request.query);
      return reply.status(200).send(resultado);
    }
  );

  // -------------------------------------------------------------
  // GET /connects/:id - Buscar Connect específico por ID
  // -------------------------------------------------------------
  server.get(
    '/:id',
    {
      schema: {
        params: ConnectParamsSchema,
        response: {
          200: ConnectResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const connect = await connectService.findById(id);
        return reply.status(200).send(connect);
      } catch (err: any) {
        if (err.message === 'Connect não encontrado') {
          return reply.status(404).send({ message: err.message });
        }
        throw err;
      }
    }
  );

  // -------------------------------------------------------------
  // PATCH /connects/:id - Atualizar dados de um Connect
  // -------------------------------------------------------------
  server.patch(
    '/:id',
    {
      schema: {
        params: ConnectParamsSchema,
        body: UpdateConnectSchema,
        response: {
          200: ConnectResponseSchema,
          404: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const connectAtualizado = await connectService.update(id, request.body);
        return reply.status(200).send(connectAtualizado);
      } catch (err: any) {
        if (err.message === 'Connect não encontrado') {
          return reply.status(404).send({ message: err.message });
        }
        if (err.message === 'O Connect já existe') {
          return reply.status(409).send({ message: err.message });
        }
        throw err;
      }
    }
  );

  // -------------------------------------------------------------
  // DELETE /connects/:id - Desativação lógica (Soft Delete)
  // -------------------------------------------------------------
  server.delete(
    '/:id',
    {
      schema: {
        params: ConnectParamsSchema,
        response: {
          200: ActionResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        await connectService.desativar(id);
        return reply.status(200).send({ message: 'Connect desativado com sucesso' });
      } catch (err: any) {
        if (err.message === 'Connect não encontrado') {
          return reply.status(404).send({ message: err.message });
        }
        throw err;
      }
    }
  );

  // -------------------------------------------------------------
  // PATCH /connects/:id/reativar - Reativação lógica
  // -------------------------------------------------------------
  server.patch(
    '/:id/reativar',
    {
      schema: {
        params: ConnectParamsSchema,
        response: {
          200: ActionResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        await connectService.reativar(id);
        return reply.status(200).send({ message: 'Connect reativado com sucesso' });
      } catch (err: any) {
        if (err.message === 'Connect não encontrado') {
          return reply.status(404).send({ message: err.message });
        }
        throw err;
      }
    }
  );
}