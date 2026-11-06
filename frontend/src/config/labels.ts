import type {
  ComoConheceu,
  DiaSemana,
  EstadoCivil,
  Residencia,
  StatusMembro,
  StatusPessoa,
  TipoUsuario,
} from '@/types';

/**
 * TEXTOS EXIBIDOS NA TELA PARA CADA VALOR DOS ENUMS.
 * Para renomear algo na interface, altere aqui.
 */

export const TIPO_USUARIO: Record<TipoUsuario, string> = {
  usuario_externo: 'Externo',
  voluntario_acolhimento: 'Acolhimento',
  lider_connect: 'Líder de Connect',
  supervisor: 'Supervisor',
  presbitero: 'Presbítero',
  pastor: 'Pastor',
  admin: 'Administrador',
};

export const ESTADO_CIVIL: Record<EstadoCivil, string> = {
  solteiro: 'Solteiro(a)',
  casado: 'Casado(a)',
  divorciado: 'Divorciado(a)',
  viuvo: 'Viúvo(a)',
  outro: 'Outro',
};

export const STATUS_MEMBRO: Record<StatusMembro, string> = {
  nao_membro: 'Não membro',
  membro: 'Membro',
};

export const STATUS_PESSOA: Record<StatusPessoa, string> = {
  novo_convertido: 'Novo convertido',
  afastado: 'Afastado',
  em_transicao: 'Em transição',
  outra_igreja: 'De outra igreja',
  lideranca_outra_igreja: 'Liderança de outra igreja',
  uber: 'Uber',
};

export const COMO_CONHECEU: Record<ComoConheceu, string> = {
  amigo: 'Amigo',
  familia: 'Família',
  convite_pessoa: 'Convite de alguém',
  redes_sociais: 'Redes sociais',
  youtube: 'YouTube',
  oracao_12h: 'Oração 12h',
  google_maps: 'Google Maps',
  passando_proximo: 'Passando próximo',
  connect: 'Connect',
  acao_social: 'Ação social',
  evento: 'Evento',
  outro: 'Outro',
};

export const RESIDENCIA: Record<Residencia, string> = {
  casa: 'Casa',
  apartamento: 'Apartamento',
  condominio: 'Condomínio',
};

/** Ordem segue o getDay() do JavaScript (0 = domingo). */
export const DIAS_SEMANA: { value: DiaSemana; label: string; curto: string }[] = [
  { value: 'domingo', label: 'Domingo', curto: 'Dom' },
  { value: 'segunda', label: 'Segunda-feira', curto: 'Seg' },
  { value: 'terca', label: 'Terça-feira', curto: 'Ter' },
  { value: 'quarta', label: 'Quarta-feira', curto: 'Qua' },
  { value: 'quinta', label: 'Quinta-feira', curto: 'Qui' },
  { value: 'sexta', label: 'Sexta-feira', curto: 'Sex' },
  { value: 'sabado', label: 'Sábado', curto: 'Sáb' },
];

export const labelDia = (dia: DiaSemana | null) =>
  DIAS_SEMANA.find((d) => d.value === dia)?.label ?? 'Sem dia definido';

/** Converte um Record de labels em opções para <Select>. */
export const opcoes = <T extends string>(mapa: Record<T, string>) =>
  (Object.entries(mapa) as [T, string][]).map(([value, label]) => ({ value, label }));
