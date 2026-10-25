import { PrismaClient, Prisma } from "@prisma/client";

import {ConnectResponseDTO, CreateConnectDTO, ListConnectsQueryDTO, PaginatedConnectResponseDTO, UpdateConnectDTO} from "../dtos/connect.dto.js";
export class ConnectService {

  constructor(private readonly db: PrismaClient) {}
  
  async create(connectDto: CreateConnectDTO):Promise<ConnectResponseDTO>{
    const existeConnect = await this.db.connect.findFirst({
      where: {nome: connectDto.nome},
    });

    if(existeConnect){
      throw new Error("O Connect ja existe");
    }

    return this.db.connect.create({data: connectDto});
  }

  async update(uuid: string, connect: UpdateConnectDTO):Promise<ConnectResponseDTO> {
    const existeConnect = await this.db.connect.findUnique({
      where: {id: uuid}
    });

    if(!existeConnect){
      throw new Error("O Connect não encontrado");
    }

    return this.db.connect.update({
      where: { id: uuid },
      data: connect,
    });
  }

  async listar(filtros: ListConnectsQueryDTO):Promise<PaginatedConnectResponseDTO>{
    const {page, limit, nome, bairro, cidade, isAtivo, } = filtros;
    const skip = (page - 1) * limit;

    const where:Prisma.ConnectWhereInput = {};

    where.isAtivo = isAtivo !== undefined ? isAtivo : true;

    if (nome) {
      where.nome = { contains: nome, mode: 'insensitive' };
    }

    if (bairro) {
      where.bairro = { contains: bairro, mode: 'insensitive' };
    }

    if (cidade) {
      where.cidade = { contains: cidade, mode: 'insensitive' };
    }


    const [dados, total] = await Promise.all([
        this.db.connect.findMany({
          where,
          skip,
          take: limit,
          orderBy: {nome: 'asc'}
        }),
        this.db.connect.count({ where })
    ]);

    return {
      dados,
      meta:{
        total,
        page,
        limit,
        totalPaginas: Math.ceil(total / limit),
      },
    };
  }

  async desativar(uuid: string): Promise<void> {
    const existeConnect = await this.db.connect.findFirst({
      where: { id: uuid },
    });

    if (!existeConnect) {
      throw new Error("Connect não encontrado");
    }

    await this.db.connect.update({
      where: { id: uuid },
      data: {
        isAtivo: false,
        deletedAt: new Date(),
      },
    });
  }

  async reativar(uuid: string): Promise<void> {
    const existeConnect = await this.db.connect.findFirst({
      where: { id: uuid },
    });

    if (!existeConnect) {
      throw new Error("Connect não encontrado");
    }

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
      where: {id: uuid}
    });
 
    if (!connect){
      throw new Error("O Connect não encontrado")
    }

    return connect;
  }
}