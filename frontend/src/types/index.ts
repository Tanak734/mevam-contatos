/**
 * Tipos de domínio do front. Espelham o schema.prisma do backend.
 * Datas "dia" (ultimoContato, dataContato, dataNascimento) usam o formato 'YYYY-MM-DD'.
 * Datas com horário (createdAt, updatedAt) usam ISO completo.
 */

export type TipoUsuario =
  | 'usuario_externo'
  | 'voluntario_acolhimento'
  | 'lider_connect'
  | 'supervisor'
  | 'presbitero'
  | 'pastor'
  | 'admin';

export type Genero = 'M' | 'F';
export type EstadoCivil = 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'outro';
export type StatusMembro = 'nao_membro' | 'membro';
export type StatusPessoa =
  | 'novo_convertido'
  | 'afastado'
  | 'em_transicao'
  | 'outra_igreja'
  | 'lideranca_outra_igreja'
  | 'uber';
export type ComoConheceu =
  | 'amigo'
  | 'familia'
  | 'convite_pessoa'
  | 'redes_sociais'
  | 'youtube'
  | 'oracao_12h'
  | 'google_maps'
  | 'passando_proximo'
  | 'connect'
  | 'acao_social'
  | 'evento'
  | 'outro';
export type Residencia = 'casa' | 'apartamento' | 'condominio';
export type DiaSemana = 'domingo' | 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado';

export interface Usuario {
  id: string;
  nome: string;
  telefone: string;
  genero: Genero | null;
  tipoUsuario: TipoUsuario;
  isAtivo: boolean;
  createdAt: string;
}

export interface Connect {
  id: string;
  nome: string;
  /** IDs dos usuários líderes (tabela ConnectLider). Todos têm o mesmo peso. */
  lideresIds: string[];
  supervisorId: string | null;
  diaSemana: DiaSemana | null;
  tipoResidencia: Residencia;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  complemento: string | null;
  cep: string | null;
  /** Link fixo do pin no Google Maps. Se vazio, geramos a partir do endereço. */
  linkMaps: string | null;
  isAtivo: boolean;
}

export interface HistoricoContato {
  id: string;
  autorId: string;
  dataContato: string;
  observacaoContato: string | null;
  createdAt: string;
}

export interface Visitante {
  id: string;
  /** Quem cadastrou */
  userId: string;
  connectId: string | null;
  discipuladorId: string | null;

  nome: string;
  apelidoReferencia: string | null;
  telefone: string;
  dataNascimento: string | null;
  genero: Genero | null;
  estadoCivil: EstadoCivil;

  cidadeMora: string;
  bairro: string | null;

  statusMembro: StatusMembro;
  statusPessoa: StatusPessoa | null;

  comoConheceu: ComoConheceu;
  outroMeioConhecer: string | null;
  ultimoContato: string | null;
  observacaoPessoa: string | null;

  isAtivo: boolean;
  createdAt: string;
  updatedAt: string;

  /** IDs dos usuários que estão conversando com a pessoa agora (AcompanhamentoAtivo) */
  acompanhantes: string[];
  historico: HistoricoContato[];
}

export type NivelTermometro = 'em_dia' | 'atencao' | 'urgente' | 'critico';
