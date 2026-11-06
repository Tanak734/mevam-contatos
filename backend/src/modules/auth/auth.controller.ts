import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service.js';
import { JWTPayloadDTO, LoginDTO } from './auth.dto.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}


  login = async (
    request:FastifyRequest<{Body: LoginDTO}>,
    reply:FastifyReply
  ) => {
    const loginUser = await this.authService.validarCredenciais(request.body);

    const payload: JWTPayloadDTO = {
      sub: loginUser.id,
      nome: loginUser.nome,
      tipoUser: loginUser.tipoUsuario,
      isAdmin: loginUser.isAdmin
    };

    const token = request.server.jwt.sign(payload);

    return reply.status(200).send({token, user: loginUser});
  }

  me = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const userId = request.user.sub;
    const user = await this.authService.getProfile(userId);

    return reply.status(200).send(user)
  }

}
