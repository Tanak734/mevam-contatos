import { FastifyReply, FastifyRequest } from 'fastify';
import { IdParamDTO } from '../../shared/schemas/common.schema.js';
import {
  CreateConnectDTO,
  ListConnectsQueryDTO,
  UpdateConnectDTO,
} from './connect.dto.js';
import { ConnectService } from './connect.service.js';

export class ConnectController {
  constructor(private readonly connectService: ConnectService) {}

  create = async (
    request: FastifyRequest<{ Body: CreateConnectDTO }>,
    reply: FastifyReply
  ) => {
    const novoConnect = await this.connectService.create(request.body);
    return reply.status(201).send(novoConnect);
  };

  list = async (
    request: FastifyRequest<{ Querystring: ListConnectsQueryDTO }>,
    reply: FastifyReply
  ) => {
    const resultado = await this.connectService.listPaginated(request.query);
    return reply.status(200).send(resultado);
  };

  findById = async (
    request: FastifyRequest<{ Params: IdParamDTO }>,
    reply: FastifyReply
  ) => {
    const connect = await this.connectService.findById(request.params.id);
    return reply.status(200).send(connect);
  };

  update = async (
    request: FastifyRequest<{ Params: IdParamDTO; Body: UpdateConnectDTO }>,
    reply: FastifyReply
  ) => {
    const connectAtualizado = await this.connectService.update(
      request.params.id,
      request.body
    );
    return reply.status(200).send(connectAtualizado);
  };

  deactivate = async (
    request: FastifyRequest<{ Params: IdParamDTO }>,
    reply: FastifyReply
  ) => {
    await this.connectService.deactivate(request.params.id);
    return reply.status(200).send({ message: 'Connect desativado com sucesso' });
  };

  activate = async (
    request: FastifyRequest<{ Params: IdParamDTO }>,
    reply: FastifyReply
  ) => {
    await this.connectService.activate(request.params.id);
    return reply.status(200).send({ message: 'Connect reativado com sucesso' });
  };
}
