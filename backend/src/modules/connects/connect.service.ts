import { Prisma, PrismaClient } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error.js';
import {
  ConnectResponseDTO,
  CreateConnectDTO,
  ListConnectsQueryDTO,
  PaginatedConnectResponseDTO,
  UpdateConnectDTO,
} from './connect.dto.js';

export class ConnectService {
  constructor(private readonly db: PrismaClient) {}

  async create(connectDto: CreateConnectDTO): Promise<ConnectResponseDTO> {
    const existeConnect = await this.db.connect.findFirst({
      where: { nome: connectDto.nome },
    });

    if (existeConnect) {
      throw AppError.conflict('O Connect já existe');
    }

    return this.db.connect.create({ data: connectDto });
  }

  async update(uuid: string, connect: UpdateConnectDTO): Promise<ConnectResponseDTO> {
    await this.findById(uuid);

    if (connect.nome) {
      const conflitoNome = await this.db.connect.findFirst({
        where: {
          nome: connect.nome,
          NOT: { id: uuid },
        },
      });

      if (conflitoNome) {
        throw AppError.conflict('O Connect já existe');
      }
    }

    return this.db.connect.update({
      where: { id: uuid },
      data: connect,
    });
  }

  async listPaginated(filtros: ListConnectsQueryDTO): Promise<PaginatedConnectResponseDTO> {
    const { page, limit, nome, bairro, cidade, isAtivo } = filtros;
    const skip = (page - 1) * limit;

    const where: Prisma.ConnectWhereInput = {
      isAtivo: isAtivo !== undefined ? isAtivo : true,
      ...(nome && { nome: { contains: nome, mode: 'insensitive' } }),
      ...(bairro && { bairro: { contains: bairro, mode: 'insensitive' } }),
      ...(cidade && { cidade: { contains: cidade, mode: 'insensitive' } }),
    };

    const [dados, total] = await Promise.all([
      this.db.connect.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
      this.db.connect.count({ where }),
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

  async deactivate(uuid: string): Promise<void> {
    await this.findById(uuid);

    await this.db.connect.update({
      where: { id: uuid },
      data: {
        isAtivo: false,
        deletedAt: new Date(),
      },
    });
  }

  async activate(uuid: string): Promise<void> {
    await this.findById(uuid);

    await this.db.connect.update({
      where: { id: uuid },
      data: {
        isAtivo: true,
        deletedAt: null,
      },
    });
  }

  async findById(uuid: string): Promise<ConnectResponseDTO> {
    const connect = await this.db.connect.findUnique({
      where: { id: uuid },
    });

    if (!connect) {
      throw AppError.notFound('Connect não encontrado');
    }

    return connect;
  }
}
