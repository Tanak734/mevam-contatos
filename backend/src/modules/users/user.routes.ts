import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from '@fastify/type-provider-zod';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { ChangeAdminSchema, CreateUserSchema, PaginatedUserQuerySchema, PaginatedUserResponseSchema, UpdateUserSchema, UserResponseSchema } from './user.dto.js';
import { ErrorResponseSchema, IdParamSchema } from '../../shared/schemas/common.schema.js';
import { ActionResponseSchema } from '../connects/connect.dto.js';
import { Server } from 'http';

export async function userRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const service = new UserService(app.orm);
  const controller = new UserController(service);

  server.post(
    '/',
    {
      schema: {
        body: CreateUserSchema,
        response: {
          201: UserResponseSchema,
          409: ErrorResponseSchema
        },
      },
    },
    controller.create
  );

  server.get(
    '/',
    {
      schema: {
        querystring: PaginatedUserQuerySchema,
        response: {
          200: PaginatedUserResponseSchema,
          401: ErrorResponseSchema
        },
      },
    },
    controller.list
  );

  server.get(
    '/:id',
    {
      schema: {
        params: IdParamSchema,
        response: {
          200: UserResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema
        },
      },
    },
    controller.findById
  );

  server.patch(
    '/:id',
    {
      schema: {
        params: IdParamSchema,
        body: UpdateUserSchema,
        response: {
          200: UserResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema
        },
      },
    },
    controller.update
  );

  server.delete(
    '/:id',
    {
      schema: {
        params: IdParamSchema,
        response: {
          200: ActionResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema
        },
      },
    },
    controller.deactivate
  );

  server.patch(
    '/:id/reativar',
    {
      schema: {
        params: IdParamSchema,
        response: {
          200: ActionResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    controller.activate
  );

  server.patch(
    '/:id/admin',
    {
      schema: {
        params: IdParamSchema,
        body: ChangeAdminSchema,
        response: {
          200: UserResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    controller.changeAdmin
  );
}
