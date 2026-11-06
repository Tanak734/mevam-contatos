import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

function extrairTelefoneValido(input: string) {
  const limpo = input.trim();

  if (limpo.startsWith('+')) {
    const phone = parsePhoneNumberFromString(limpo);
    if (phone?.isValid()) return phone;
  }

  const apenasNumeros = limpo.replace(/\D/g, '');

  if (apenasNumeros.length === 10 || apenasNumeros.length === 11) {
    const phoneBR = parsePhoneNumberFromString(apenasNumeros, 'BR');
    if (phoneBR?.isValid()) return phoneBR;
  }

  const phoneComMais = parsePhoneNumberFromString(`+${apenasNumeros}`);
  if (phoneComMais?.isValid()) return phoneComMais;

  return null;
}

export const telefoneValidator = z
  .string()
  .refine((val) => extrairTelefoneValido(val) !== null, {
    message: 'Número de telefone inválido. Verifique o DDD e o número digitado.',
  })
  .transform((val) => extrairTelefoneValido(val)!.number);
