import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from '@fastify/type-provider-zod';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { LoginResponseSchema, LoginSchema } from './auth.dto.js';
import { ErrorResponseSchema } from '../../shared/schemas/common.schema.js';
import { UserResponseSchema } from '../users/user.dto.js';

export async function authRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const service = new AuthService(app.orm);
  const controller = new AuthController(service);

  server.post(
    '/login',
    {
      schema: {
        body: LoginSchema,
        response:{
          200: LoginResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema
        }
      }
    },
    controller.login
  );

  server.get(
    '/me',
    {
      onRequest: [app.authenticate],
      schema: {
        response: {
          200: UserResponseSchema,
          401: ErrorResponseSchema
        }
      }
    },
    controller.me
  );
}
