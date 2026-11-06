import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../../shared/errors/app-error.js';
import { LoginDTO, LoginResponseDTO } from './auth.dto.js';
import { UserResponseDTO } from '../users/user.dto.js';

export class AuthService {
  constructor(private readonly db: PrismaClient) {}

  async validarCredenciais(user: LoginDTO): Promise<Omit<User, 'senhaHash'>> {
    const existeUser = await this.db.user.findUnique({
      where: { telefone: user.telefone },
    });

    if (!existeUser || !existeUser.isAtivo) {
      throw AppError.unauthorized('Telefone ou senha inválidos.');
    }

    const senhaValida = await bcrypt.compare(user.senha, existeUser.senhaHash);
    if (!senhaValida) {
      throw AppError.unauthorized('Telefone ou senha inválidos.');
    }

    const { senhaHash: _, ...usuarioSemSenha } = existeUser;
    return usuarioSemSenha;
  }

  async getProfile(userId: string): Promise<UserResponseDTO>{
    const user = await this.db.user.findUnique({
      where: {id: userId},
      omit: {senhaHash: true}
    })

    if (!user || !user.isAtivo){
      throw AppError.notFound('Usuario não encontrado.');
    }

    return user;
  }
}
