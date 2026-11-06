import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from '@fastify/type-provider-zod';
import {
  ErrorResponseSchema,
  IdParamSchema,
} from '../../shared/schemas/common.schema.js';
import {
  ActionResponseSchema,
  ConnectResponseSchema,
  CreateConnectSchema,
  ListConnectsQuerySchema,
  PaginatedConnectResponseSchema,
  UpdateConnectSchema,
} from './connect.dto.js';
import { ConnectService } from './connect.service.js';
import { ConnectController } from './connect.controller.js'

export async function connectRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const service = new ConnectService(app.orm);
  const connectController = new ConnectController(service);

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
    connectController.create
  );

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
    connectController.list
  );

  server.get(
    '/:id',
    {
      schema: {
        params: IdParamSchema,
        response: {
          200: ConnectResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    connectController.findById
  );

  server.patch(
    '/:id',
    {
      schema: {
        params: IdParamSchema,
        body: UpdateConnectSchema,
        response: {
          200: ConnectResponseSchema,
          404: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    connectController.update
  );

  server.delete(
    '/:id',
    {
      schema: {
        params: IdParamSchema,
        response: {
          200: ActionResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    connectController.deactivate
  );

  server.patch(
    '/:id/reativar',
    {
      schema: {
        params: IdParamSchema,
        response: {
          200: ActionResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    connectController.activate
  );
}
