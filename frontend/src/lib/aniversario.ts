import { differenceInCalendarDays } from 'date-fns';

/** Dias até o próximo aniversário, a partir da data local. */
export const diasAteAniversario = (dataNascimento: string, hoje = new Date()) => {
  const [, mes, dia] = dataNascimento.slice(0, 10).split('-').map(Number);
  if (!mes || !dia) return null;
  let proximo = new Date(hoje.getFullYear(), mes - 1, dia);
  if (differenceInCalendarDays(proximo, hoje) < 0) proximo = new Date(hoje.getFullYear() + 1, mes - 1, dia);
  return differenceInCalendarDays(proximo, hoje);
};
