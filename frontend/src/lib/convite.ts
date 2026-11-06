import { addDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DIAS_SEMANA } from '@/config/labels';
import type { DiaSemana } from '@/types';
import { primeiroNome } from './format';

/** Próxima data (a partir de hoje, incluindo hoje) que cai no dia da semana do Connect */
export const proximaData = (dia: DiaSemana | null): string => {
  const hoje = new Date();
  if (!dia) return format(hoje, 'yyyy-MM-dd');
  const alvo = DIAS_SEMANA.findIndex((d) => d.value === dia);
  const diff = (alvo - hoje.getDay() + 7) % 7;
  return format(addDays(hoje, diff), 'yyyy-MM-dd');
};

/** '2026-10-29' -> 'quarta-feira, 29/10' */
export const dataPorExtenso = (iso: string) => format(parseISO(iso), "EEEE, dd/MM", { locale: ptBR });

/** '20:00' -> '20h', '19:30' -> '19h30' */
export const horarioFormatado = (hora: string) => {
  if (!hora) return 'a confirmar';
  const [h, m] = hora.split(':');
  return m === '00' ? `${h}h` : `${h}h${m}`;
};

export const OBSERVACAO_PADRAO = 'Chame seus amigos e venha com a gente! 🙌';

export interface DadosConvite {
  nomeConnect: string;
  nomeConvidado?: string;
  data: string;
  horario: string;
  local: string;
  linkMaps?: string;
  lideres?: string;
  observacao?: string;
}

/** Texto final do convite. Usa a formatação do WhatsApp (*negrito*). */
export const gerarTextoConvite = (d: DadosConvite) => {
  const linhas = [
    `*${d.nomeConnect}* 🏡`,
    '',
    d.nomeConvidado
      ? `Olá, ${primeiroNome(d.nomeConvidado)}! Tudo bem? 😊`
      : 'Olá! Tudo bem? 😊',
    'Queremos te convidar para o nosso Connect desta semana:',
    '',
    `📅 *Data:* ${dataPorExtenso(d.data)}`,
    `⏰ *Horário:* ${horarioFormatado(d.horario)}`,
    `📍 *Local:* ${d.local}`,
  ];

  if (d.linkMaps) linhas.push(`🗺️ *Como chegar:* ${d.linkMaps}`);
  if (d.lideres) linhas.push(`👥 *Líderes:* ${d.lideres}`);

  linhas.push('', d.observacao?.trim() || OBSERVACAO_PADRAO, '', 'Te esperamos! 🙏');

  return linhas.join('\n');
};
