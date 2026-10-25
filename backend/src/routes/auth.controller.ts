import { FastifyInstance } from 'fastify'
import {ZodTypeProvider} from '@fastify/type-provider-zod'
import {z} from 'zod'
import { ConnectService } from '../services/connect.service.js';
import { ConnectResponseSchema, CreateConnectSchema, ListConnectsQuerySchema, PaginatedConnectResponseSchema, UpdateConnectSchema } from '../dtos/connect.dto.js';

const ConnectParamsSchema = z.object({
  id: z.uuid("O item nao é um uuid"),
})

const ErrorResponseSchema = z.object({
  message: z.string()
})

export async function ConnectController(app:FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const connectService = new ConnectService(app.orm);

  // ! Post method
  server.post(
    '/connects',
    {
      schema: {
        body: CreateConnectSchema,
        response: {
          201: ConnectResponseSchema,
          409: ErrorResponseSchema
        },
      },
    },
    async (request, reply) => {
      try {
        const resultado = await connectService.create(request.body);
        return reply.status(201).send(resultado);
      } catch (err: any) {
        if(err.message === "O connect ja Existe"){
          return reply.status(409).send({message: err.message});
        }
        throw err;
      }
    }
  );

  // ! Get method
  server.get(
    '/connects',
    {
      schema: {
        querystring: ListConnectsQuerySchema,
        response: {
          200: PaginatedConnectResponseSchema,
          404: ErrorResponseSchema
        },
      },
    },
    async (request, reply) => {
      const resultado = await connectService.listar(request.query);
      
      if(resultado.dados === null || resultado.dados.length === 0){
        return reply.status(404).send({message: "Nenhum connect encontrado"});
      }
      return reply.status(200).send(resultado);
      }
  )

  // ! Patch method
  server.patch(
    '/connects/:id',
    {
      schema: {
        params: ConnectParamsSchema,
        body: UpdateConnectSchema,
        response:{
          200: ConnectResponseSchema,
          404: ErrorResponseSchema,
          409: ErrorResponseSchema
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const connectAtualizado = await connectService.update(id, request.body);
        return reply.status(200).send(connectAtualizado);
      } catch (err: any){
        if (err.message === 'Connect não encontrado'){
          return reply.status(404).send({message: err.message})
        }

        if (err.message === 'Connect ja existe'){
          return reply.status(409).send({message: err.message})
        }

        throw err;
      }
    }
  );
}