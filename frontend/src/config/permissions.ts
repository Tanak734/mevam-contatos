import type { TipoUsuario } from '@/types';

/**
 * REGRAS DE ACESSO (RBAC)
 * Para liberar/bloquear uma área para um cargo, edite apenas este arquivo.
 */

export type Area = 'contatos' | 'connects' | 'acompanhamentos' | 'discipulado' | 'usuarios' | 'perfil';

const TODOS: TipoUsuario[] = [
  'usuario_externo',
  'voluntario_acolhimento',
  'lider_connect',
  'supervisor',
  'presbitero',
  'pastor',
  'admin',
];

const IGREJA: TipoUsuario[] = TODOS.filter((t) => t !== 'usuario_externo');

export const LIDERANCA: TipoUsuario[] = ['lider_connect', 'supervisor', 'presbitero', 'pastor', 'admin'];

const ACESSO: Record<Area, TipoUsuario[]> = {
  contatos: TODOS,
  connects: IGREJA,
  acompanhamentos: LIDERANCA,
  discipulado: LIDERANCA,
  usuarios: ['admin'],
  perfil: TODOS,
};

export const podeAcessar = (perfil: TipoUsuario, area: Area) => ACESSO[area]?.includes(perfil) ?? false;

export const isExterno = (perfil: TipoUsuario) => perfil === 'usuario_externo';

export const isLideranca = (perfil: TipoUsuario) => LIDERANCA.includes(perfil);

/** Líderes veem os NOMES de quem está conversando com a pessoa. Os demais só veem o número. */
export const podeVerNomesAcompanhantes = isLideranca;

export const podeGerenciarConnects = isLideranca;

/** Externo vê apenas os contatos que ele mesmo cadastrou. */
export const veApenasProprioContatos = isExterno;

/** Primeira rota após o login: sempre 'contatos' */
export const rotaInicial = (_perfil: TipoUsuario) => '/contatos';
