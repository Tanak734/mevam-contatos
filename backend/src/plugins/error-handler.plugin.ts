import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../shared/errors/app-error.js';

export function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  if ('validation' in error && error.validation) {
    return reply.status(400).send({
      message: error.message || 'Erro de validação nos dados enviados',
    });
  }

  request.log.error({ err: error }, 'Unhandled application error');

  return reply.status(500).send({
    message: 'Erro interno do servidor',
  });
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler(errorHandler);
}
