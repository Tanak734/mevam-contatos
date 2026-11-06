import { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from './user.service.js';
import { ChangeAdminDTO, CreateUserDTO, PaginatedUserQueryDTO, UpdateUserDTO } from './user.dto.js';
import { IdParamDTO } from '../../shared/schemas/common.schema.js';
import { AppError } from '../../shared/errors/app-error.js';

export class UserController {
  constructor(private readonly userService: UserService) {}

  create = async (
    request: FastifyRequest<{ Body: CreateUserDTO }>,
    reply: FastifyReply
  ) => {
    const novoUser = await this.userService.create(request.body);
    return reply.status(201).send(novoUser);
  };

  list = async (
    request: FastifyRequest<{ Querystring: PaginatedUserQueryDTO }>,
    reply: FastifyReply
  ) => {
    const resultado = await this.userService.listPaginated(request.query);
    return reply.status(200).send(resultado);
  };

  update = async (
    request: FastifyRequest<{ Params: IdParamDTO; Body: UpdateUserDTO }>,
    reply: FastifyReply
  ) => {
    const userAtualizado = await this.userService.update(
      request.params.id,
      request.body
    );

    return reply.status(200).send(userAtualizado);
  };

  findById = async (
    request: FastifyRequest<{ Params: IdParamDTO }>,
    reply: FastifyReply
  ) => {
    const user = await this.userService.findById(request.params.id);
    return reply.status(200).send(user);
  };

  deactivate = async (
    request: FastifyRequest<{ Params: IdParamDTO }>,
    reply: FastifyReply
  ) => {
    if (request.user.sub === request.params.id) {
      throw AppError.badRequest('Você não pode desativar sua própria conta.');
    }

    await this.userService.safeDelete(request.params.id);
    return reply.status(200).send({ message: 'Usuário desativado com sucesso' });
  };

  activate = async (
    request: FastifyRequest<{ Params: IdParamDTO }>,
    reply: FastifyReply
  ) => {
    if (!request.user.isAdmin) {
      throw AppError.forbidden('Apenas administradores podem reativar contas.');
    }

    await this.userService.reativar(request.params.id);
    return reply.status(200).send({ message: 'Usuário reativado com sucesso' });
  };

  changeAdmin = async (
    request: FastifyRequest<{ Params: IdParamDTO; Body: ChangeAdminDTO }>,
    reply: FastifyReply
  ) => {
    if (!request.user.isAdmin) {
      throw AppError.forbidden('Apenas administradores podem alterar permissões de admin.');
    }

    if (request.user.sub === request.params.id && !request.body.isAdmin) {
      throw AppError.badRequest('Você não pode remover seu próprio privilégio de administrador.');
    }

    const user = await this.userService.changeAdmin(
      request.params.id,
      request.body.isAdmin
    );

    return reply.status(200).send(user);
  };
}