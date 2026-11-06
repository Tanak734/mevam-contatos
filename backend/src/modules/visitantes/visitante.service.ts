import { Prisma, PrismaClient } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error.js';
import {
  CreateVisitanteDTO,
  ListVisitantesQueryDTO,
  PaginatedVisitanteResponseDTO,
  RegistrarDataContatoDTO,
  UpdateVisitanteDTO,
  VisitanteResponseDTO,
} from './visitante.dto.js';

export class VisitanteService {
  constructor(private readonly db: PrismaClient) {}

  /**
   * Calcula o termômetro pastoral com base no tempo sem contato
   */
  private calcularTermometro(
    ultimoContato: Date | null,
    createdAt: Date
  ): {
    diasSemContato: number;
    statusAlerta: 'em_dia' | 'atencao' | 'urgente' | 'critico';
  } {
    const dataRef = ultimoContato ? new Date(ultimoContato) : new Date(createdAt);
    const hoje = new Date();
    const diffEmMs = Math.max(0, hoje.getTime() - dataRef.getTime());
    const diasSemContato = Math.floor(diffEmMs / (1000 * 60 * 60 * 24));

    let statusAlerta: 'em_dia' | 'atencao' | 'urgente' | 'critico' = 'em_dia';
    if (diasSemContato >= 14) {
      statusAlerta = 'critico';
    } else if (diasSemContato >= 8) {
      statusAlerta = 'urgente';
    } else if (diasSemContato >= 4) {
      statusAlerta = 'atencao';
    }

    return { diasSemContato, statusAlerta };
  }

  /**
   * Formata os dados de um visitante para o DTO de resposta
   */
  private formatarVisitante(
    visitante: any,
    currentUserId?: string
  ): VisitanteResponseDTO {
    const { diasSemContato, statusAlerta } = this.calcularTermometro(
      visitante.ultimoContato,
      visitante.createdAt
    );

    const acompanhantes = visitante.acompanhantes ?? [];
    const estouAcompanhando = currentUserId
      ? acompanhantes.some((a: any) => a.userId === currentUserId && a.isAtivo)
      : false;

    // Número de outras pessoas acompanhando além do usuário atual
    const outrasPessoasAcompanhando = currentUserId
      ? acompanhantes.filter((a: any) => a.userId !== currentUserId && a.isAtivo).length
      : acompanhantes.filter((a: any) => a.isAtivo).length;

    return {
      id: visitante.id,
      userId: visitante.userId,
      connectId: visitante.connectId,
      nome: visitante.nome,
      apelidoReferencia: visitante.apelidoReferencia,
      telefone: visitante.telefone,
      dataNascimento: visitante.dataNascimento,
      genero: visitante.genero,
      estadoCivil: visitante.estadoCivil,
      cidadeMora: visitante.cidadeMora,
      bairro: visitante.bairro,
      statusMembro: visitante.statusMembro,
      statusPessoa: visitante.statusPessoa,
      tempoMembro: visitante.tempoMembro,
      comoConheceu: visitante.comoConheceu,
      outroMeioConhecer: visitante.outroMeioConhecer,
      ultimoContato: visitante.ultimoContato,
      observacaoPessoa: visitante.observacaoPessoa,
      isAtivo: visitante.isAtivo,
      createdAt: visitante.createdAt,
      updatedAt: visitante.updatedAt,
      diasSemContato,
      statusAlerta,
      outrasPessoasAcompanhando,
      estouAcompanhando,
    };
  }

  /**
   * 1. Criar novo visitante
   */
  async create(
    visitanteDto: CreateVisitanteDTO,
    currentUserId: string
  ): Promise<VisitanteResponseDTO> {
    const telefoneExiste = await this.db.visitante.findUnique({
      where: { telefone: visitanteDto.telefone },
    });

    if (telefoneExiste) {
      throw AppError.conflict('Já existe um visitante cadastrado com este telefone');
    }

    if (visitanteDto.connectId) {
      const connectExiste = await this.db.connect.findUnique({
        where: { id: visitanteDto.connectId },
      });
      if (!connectExiste) {
        throw AppError.notFound('Connect informado não foi encontrado');
      }
    }

    const novo = await this.db.visitante.create({
      data: {
        ...visitanteDto,
        userId: currentUserId,
      },
      include: {
        acompanhantes: true,
      },
    });

    return this.formatarVisitante(novo, currentUserId);
  }

  /**
   * 2. Listagem paginada com filtros pastorais e ordenações especiais
   */
  async listPaginated(
    filtros: ListVisitantesQueryDTO,
    currentUserId?: string
  ): Promise<PaginatedVisitanteResponseDTO> {
    const {
      page,
      limit,
      busca,
      bairro,
      cidadeMora,
      statusMembro,
      statusPessoa,
      connectId,
      userId,
      ordenarPor,
    } = filtros;

    const skip = (page - 1) * limit;

    const where: Prisma.VisitanteWhereInput = {
      isAtivo: true,
      ...(bairro && { bairro: { contains: bairro, mode: 'insensitive' } }),
      ...(cidadeMora && { cidadeMora: { contains: cidadeMora, mode: 'insensitive' } }),
      ...(statusMembro && { statusMembro }),
      ...(statusPessoa && { statusPessoa }),
      ...(connectId && { connectId }),
      ...(userId && { userId }),
      ...(busca && {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' } },
          { apelidoReferencia: { contains: busca, mode: 'insensitive' } },
          { telefone: { contains: busca } },
        ],
      }),
    };

    // Ordenação Prisma padrão
    let orderBy: Prisma.VisitanteOrderByWithRelationInput = { nome: 'asc' };

    switch (ordenarPor) {
      case 'nome_desc':
        orderBy = { nome: 'desc' };
        break;
      case 'data_cadastro_desc':
        orderBy = { createdAt: 'desc' };
        break;
      case 'data_cadastro_asc':
        orderBy = { createdAt: 'asc' };
        break;
      case 'ultimo_contato_desc':
      case 'dias_sem_contato_asc':
        orderBy = { ultimoContato: 'desc' };
        break;
      case 'ultimo_contato_asc':
      case 'dias_sem_contato_desc':
        orderBy = { ultimoContato: 'asc' };
        break;
      case 'bairro_asc':
        orderBy = { bairro: 'asc' };
        break;
      case 'nome_asc':
      default:
        orderBy = { nome: 'asc' };
        break;
    }

    const [visitantes, total] = await Promise.all([
      this.db.visitante.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          acompanhantes: true,
        },
      }),
      this.db.visitante.count({ where }),
    ]);

    const dados = visitantes.map((v) => this.formatarVisitante(v, currentUserId));

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

  /**
   * 3. Buscar visitante por ID
   */
  async findById(uuid: string, currentUserId?: string): Promise<VisitanteResponseDTO> {
    const visitante = await this.db.visitante.findUnique({
      where: { id: uuid },
      include: {
        acompanhantes: true,
      },
    });

    if (!visitante || !visitante.isAtivo) {
      throw AppError.notFound('Visitante não encontrado ou inativo');
    }

    return this.formatarVisitante(visitante, currentUserId);
  }

  /**
   * 4. Atualizar ficha do visitante
   */
  async update(
    uuid: string,
    dados: UpdateVisitanteDTO,
    currentUserId?: string
  ): Promise<VisitanteResponseDTO> {
    await this.findById(uuid);

    if (dados.telefone) {
      const telefoneEmUso = await this.db.visitante.findFirst({
        where: {
          telefone: dados.telefone,
          NOT: { id: uuid },
        },
      });

      if (telefoneEmUso) {
        throw AppError.conflict('Este telefone já pertence a outro visitante');
      }
    }

    if (dados.connectId) {
      const connectExiste = await this.db.connect.findUnique({
        where: { id: dados.connectId },
      });
      if (!connectExiste) {
        throw AppError.notFound('Connect informado não foi encontrado');
      }
    }

    const atualizado = await this.db.visitante.update({
      where: { id: uuid },
      data: dados,
      include: {
        acompanhantes: true,
      },
    });

    return this.formatarVisitante(atualizado, currentUserId);
  }

  /**
   * 5. Registrar conversa no histórico e atualizar último contato
   */
  async registrarContato(
    visitanteId: string,
    currentUserId: string,
    dados: RegistrarDataContatoDTO
  ): Promise<VisitanteResponseDTO> {
    await this.findById(visitanteId);

    const atualizado = await this.db.$transaction(async (tx) => {
      // 1. Grava histórico
      await tx.historicoContato.create({
        data: {
          visitanteId,
          userId: currentUserId,
          dataContato: dados.dataContato,
          observacaoContato: dados.observacaoContato,
        },
      });

      // 2. Atualiza ficha do visitante
      return tx.visitante.update({
        where: { id: visitanteId },
        data: {
          ultimoContato: dados.dataContato,
          ...(dados.apelidoReferencia && { apelidoReferencia: dados.apelidoReferencia }),
          ...(dados.observacaoPessoa && { observacaoPessoa: dados.observacaoPessoa }),
        },
        include: {
          acompanhantes: true,
        },
      });
    });

    return this.formatarVisitante(atualizado, currentUserId);
  }

  /**
   * 6. Obter histórico cronológico de conversas de um visitante
   */
  async getHistoricoContatos(visitanteId: string) {
    await this.findById(visitanteId);

    return this.db.historicoContato.findMany({
      where: { visitanteId },
      orderBy: { dataContato: 'desc' },
      include: {
        autor: {
          select: {
            id: true,
            nome: true,
            tipoUsuario: true,
          },
        },
      },
    });
  }

  /**
   * 7. Alternar Acompanhamento Ativo (Anti-colisão: começar / parar de acompanhar)
   */
  async toggleAcompanhamento(
    visitanteId: string,
    currentUserId: string
  ): Promise<{ estouAcompanhando: boolean; message: string }> {
    await this.findById(visitanteId);

    const acompanhamentoExistente = await this.db.acompanhamentoAtivo.findUnique({
      where: {
        visitanteId_userId: {
          visitanteId,
          userId: currentUserId,
        },
      },
    });

    if (acompanhamentoExistente && acompanhamentoExistente.isAtivo) {
      await this.db.acompanhamentoAtivo.update({
        where: { id: acompanhamentoExistente.id },
        data: {
          isAtivo: false,
          encerradoEm: new Date(),
        },
      });

      return {
        estouAcompanhando: false,
        message: 'Você parou de acompanhar este visitante',
      };
    }

    await this.db.acompanhamentoAtivo.upsert({
      where: {
        visitanteId_userId: {
          visitanteId,
          userId: currentUserId,
        },
      },
      update: {
        isAtivo: true,
        encerradoEm: null,
      },
      create: {
        visitanteId,
        userId: currentUserId,
        isAtivo: true,
      },
    });

    return {
      estouAcompanhando: true,
      message: 'Você agora está acompanhando este visitante',
    };
  }

  /**
   * 8. Desativação suave (Soft delete)
   */
  async deactivate(uuid: string): Promise<void> {
    await this.findById(uuid);

    await this.db.visitante.update({
      where: { id: uuid },
      data: {
        isAtivo: false,
        deletedAt: new Date(),
      },
    });
  }
}
