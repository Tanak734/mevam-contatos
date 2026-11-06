import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/** 'YYYY-MM-DD' de hoje no fuso local */
export const hojeISO = () => format(new Date(), 'yyyy-MM-dd');

/** Data N dias atrás em 'YYYY-MM-DD' (usado nos dados de exemplo) */
export const diasAtras = (n: number) => format(new Date(Date.now() - n * 86_400_000), 'yyyy-MM-dd');

export const diasDesde = (data: string) => differenceInCalendarDays(new Date(), parseISO(data));

export const formatarData = (data: string | null | undefined, padrao = 'dd/MM/yyyy') =>
  data ? format(parseISO(data), padrao, { locale: ptBR }) : '—';

/** "há 3 dias", "hoje", "ontem" */
export const tempoRelativo = (data: string | null | undefined) => {
  if (!data) return 'nunca';
  const dias = diasDesde(data);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  return `há ${dias} dias`;
};

/** Mantém só os dígitos */
export const apenasDigitos = (valor: string) => valor.replace(/\D/g, '');

/** Normaliza para E.164 brasileiro: (19) 99123-4567 -> +5519991234567 */
export const normalizarTelefone = (valor: string) => {
  const d = apenasDigitos(valor);
  if (d.startsWith('55') && d.length >= 12) return `+${d}`;
  return `+55${d}`;
};

/** +5519991234567 -> (19) 99123-4567 */
export const formatarTelefone = (valor: string) => {
  let d = apenasDigitos(valor);
  if (d.startsWith('55') && d.length >= 12) d = d.slice(2);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return valor;
};

/** Máscara progressiva enquanto o usuário digita */
export const mascaraTelefone = (valor: string) => {
  const numeros = apenasDigitos(valor);
  const d = (numeros.startsWith('55') && numeros.length >= 12 ? numeros.slice(2) : numeros).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export const iniciais = (nome: string) =>
  nome
    .replace(/^(Pr|Presb|Dr|Dra)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

export const primeiroNome = (nome: string) =>
  nome.replace(/^(Pr|Presb)\.?\s+/i, '').split(/\s+/)[0] ?? nome;

export const saudacao = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

export const formatarListaNomes = (nomes: string[]) => {
  if (nomes.length === 0) return '';
  if (nomes.length === 1) return nomes[0];
  if (nomes.length === 2) return `${nomes[0]} & ${nomes[1]}`;
  return `${nomes.slice(0, -1).join(', ')} & ${nomes[nomes.length - 1]}`;
};

export const gerarId = (prefixo: string) => `${prefixo}-${Math.random().toString(36).slice(2, 10)}`;
