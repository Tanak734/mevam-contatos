import { FastifyReply, FastifyRequest } from 'fastify';
import { IdParamDTO } from '../../shared/schemas/common.schema.js';
import {
  CreateVisitanteDTO,
  ListVisitantesQueryDTO,
  RegistrarDataContatoDTO,
  UpdateVisitanteDTO,
} from './visitante.dto.js';
import { VisitanteService } from './visitante.service.js';

export class VisitanteController {
  constructor(private readonly visitanteService: VisitanteService) {}

  create = async (
    request: FastifyRequest<{ Body: CreateVisitanteDTO }>,
    reply: FastifyReply
  ) => {
    const novo = await this.visitanteService.create(
      request.body,
      request.user.sub
    );
    return reply.status(201).send(novo);
  };

  list = async (
    request: FastifyRequest<{ Querystring: ListVisitantesQueryDTO }>,
    reply: FastifyReply
  ) => {
    const resultado = await this.visitanteService.listPaginated(
      request.query,
      request.user.sub
    );
    return reply.status(200).send(resultado);
  };

  findById = async (
    request: FastifyRequest<{ Params: IdParamDTO }>,
    reply: FastifyReply
  ) => {
    const visitante = await this.visitanteService.findById(
      request.params.id,
      request.user.sub
    );
    return reply.status(200).send(visitante);
  };

  update = async (
    request: FastifyRequest<{ Params: IdParamDTO; Body: UpdateVisitanteDTO }>,
    reply: FastifyReply
  ) => {
    const atualizado = await this.visitanteService.update(
      request.params.id,
      request.body,
      request.user.sub
    );
    return reply.status(200).send(atualizado);
  };

  registrarContato = async (
    request: FastifyRequest<{ Params: IdParamDTO; Body: RegistrarDataContatoDTO }>,
    reply: FastifyReply
  ) => {
    const resultado = await this.visitanteService.registrarContato(
      request.params.id,
      request.user.sub,
      request.body
    );
    return reply.status(200).send(resultado);
  };

  getHistoricoContatos = async (
    request: FastifyRequest<{ Params: IdParamDTO }>,
    reply: FastifyReply
  ) => {
    const historico = await this.visitanteService.getHistoricoContatos(request.params.id);
    return reply.status(200).send(historico);
  };

  toggleAcompanhamento = async (
    request: FastifyRequest<{ Params: IdParamDTO }>,
    reply: FastifyReply
  ) => {
    const resultado = await this.visitanteService.toggleAcompanhamento(
      request.params.id,
      request.user.sub
    );
    return reply.status(200).send(resultado);
  };

  deactivate = async (
    request: FastifyRequest<{ Params: IdParamDTO }>,
    reply: FastifyReply
  ) => {
    await this.visitanteService.deactivate(request.params.id);
    return reply.status(200).send({ message: 'Visitante desativado com sucesso' });
  };
}
