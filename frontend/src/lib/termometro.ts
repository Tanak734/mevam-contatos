import type { NivelTermometro, Visitante } from '@/types';
import { diasDesde } from './format';

/**
 * TERMÔMETRO PASTORAL
 * Ajuste os limites de dias aqui para mudar a cadência de contato do app inteiro.
 */
export const LIMITES = {
  emDia: 3, //  0–3 dias
  atencao: 7, //  4–7 dias
  urgente: 13, //  8–13 dias  | 14+ = crítico
};

export interface Termometro {
  dias: number;
  nivel: NivelTermometro;
  /** true quando nunca houve contato registrado (conta a partir do cadastro) */
  semRegistro: boolean;
}

export const calcularTermometro = (v: Pick<Visitante, 'ultimoContato' | 'createdAt'>): Termometro => {
  const base = v.ultimoContato ?? v.createdAt.slice(0, 10);
  const dias = Math.max(0, diasDesde(base));
  const nivel: NivelTermometro =
    dias <= LIMITES.emDia
      ? 'em_dia'
      : dias <= LIMITES.atencao
        ? 'atencao'
        : dias <= LIMITES.urgente
          ? 'urgente'
          : 'critico';
  return { dias, nivel, semRegistro: !v.ultimoContato };
};

export const NIVEL_INFO: Record<
  NivelTermometro,
  { label: string; faixa: string; tone: 'brand' | 'info' | 'warning' | 'warm' | 'danger' }
> = {
  em_dia: { label: 'Em dia', faixa: `até ${LIMITES.emDia} dias`, tone: 'info' },
  atencao: { label: 'Atenção', faixa: `${LIMITES.emDia + 1} a ${LIMITES.atencao} dias`, tone: 'warning' },
  urgente: { label: 'Urgente', faixa: `${LIMITES.atencao + 1} a ${LIMITES.urgente} dias`, tone: 'warm' },
  critico: { label: 'Crítico', faixa: `${LIMITES.urgente + 1}+ dias`, tone: 'danger' },
};

export const ORDEM_NIVEIS: NivelTermometro[] = ['em_dia', 'atencao', 'urgente', 'critico'];

export const precisaContato = (v: Visitante) => calcularTermometro(v).nivel !== 'em_dia';
