import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../../shared/errors/app-error.js';
import {
  CreateUserDTO,
  PaginatedUserQueryDTO,
  PaginatedUserResponseDTO,
  UpdateUserDTO,
  UserResponseDTO,
} from './user.dto.js';
import { tr } from 'zod/v4/locales';

export class UserService {
  constructor(private readonly db: PrismaClient) {}

  async create(userDto: CreateUserDTO): Promise<UserResponseDTO> {
    const existeUser = await this.db.user.findFirst({
      where: { telefone: userDto.telefone },
    });

    if (existeUser) {
      throw AppError.conflict('O Usuário já existe');
    }

    const { senha, ...dadosUser } = userDto;
    const senhaHash = await bcrypt.hash(senha, 12);

    return this.db.user.create({
      data: {
        ...dadosUser,
        senhaHash,
      },
      omit: {
        senhaHash: true,
      },
    });
  }

  async update(uuid: string, user: UpdateUserDTO): Promise<UserResponseDTO> {
    const existeUser = await this.db.user.findUnique({
      where: { id: uuid },
    });

    if (!existeUser) {
      throw AppError.notFound('Usuário não encontrado');
    }

    const { senha, ...dadosUser } = user;
    const dataToUpdate: Prisma.UserUpdateInput = { ...dadosUser };

    if (senha) {
      dataToUpdate.senhaHash = await bcrypt.hash(senha, 12);
    }

    return this.db.user.update({
      where: { id: uuid },
      data: dataToUpdate,
      omit: {
        senhaHash: true,
      },
    });
  }

  // Listagem paginada para o painel de administradores
  async listPaginated(filtros: PaginatedUserQueryDTO): Promise<PaginatedUserResponseDTO> {
    const { page, limit, nome, telefone, genero, tipoUsuario, isAdmin, isAtivo } = filtros;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      isAtivo: isAtivo !== undefined ? isAtivo : true,
      ...(nome && { nome: { contains: nome, mode: 'insensitive' } }),
      ...(telefone && { telefone: { contains: telefone } }),
      ...(genero && { genero }),
      ...(tipoUsuario && { tipoUsuario }),
      ...(isAdmin !== undefined && { isAdmin }),
    };

    const [dados, total] = await Promise.all([
      this.db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
        omit: {
          senhaHash: true,
        },
      }),
      this.db.user.count({ where }),
    ]);

    return {
      dados,
      meta: {
        total,
        page,
        limit,
        totalPaginas: Math.ceil(total / limit),
      },
    };
  }


  async findById(userId:string): Promise<UserResponseDTO>{
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound('Usuario não encontrado');
    }

    return user;
  }

  async changeAdmin(userId: string, isAdmin:boolean): Promise<void> {
    await this.findById(userId);

    this.db.user.update({
      where: {id: userId},
      data: {isAdmin},
      omit: {senhaHash: true}
    });
  }

  async safeDelete(userId: string): Promise<void> {
    await this.findById(userId);

    await this.db.user.update({
      where: {id: userId},
      data: {
        isAtivo: false,
        deletedAt: new Date(),
      },
    });
  }

  async reativar(userId: string): Promise<UserResponseDTO> {
    await this.findById(userId);

    return await this.db.user.update({
      where: {id: userId},
      data: {
        isAtivo: true,
        deletedAt: null,
      },
    });
  }
}
