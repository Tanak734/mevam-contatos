import { PrismaClient } from "@prisma/client/extension";
import {CreateConnectDTO, ListConnectsQueryDTO, UpdateConnectDTO} from "../dtos/connect.dto.js";

export class ConnectService {

  constructor(private readonly db: PrismaClient) {}
  
  async create(connectDto: CreateConnectDTO){
    const existeUser = await this.db.connect.findFirst({
      where: {nome: connectDto.nome},
    });

    if(existeUser){
      throw new Error("O Connect ja existe");
    }

    return this.db.connect.create({data: connectDto});
  }

  async update(uuid: string, connect: UpdateConnectDTO)  {
    const existeUser = await this.db.connect.findUnique({
      where: {id: uuid}
    });

    if(!existeUser){
      throw new Error("O Connect não encontrado");
    }

    return this.db.connect.update({
      where: uuid,
      data: connect
    });
  }

  async listar(filtros: ListConnectsQueryDTO){
    const {page, nome, bairro, limit} = filtros;

    const skip = (page - 1) * limit;


    const where:any = {}
    if(nome){
      const where = {contains: nome, mode:'insentive'}
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
        totalPaginas: Math.ceil(total / page),
      },
    };
  }

}