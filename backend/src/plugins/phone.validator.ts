import { z } from 'zod'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

function extrairTelefoneValido(input: string) {
  const limpo = input.trim()

  // 1. Se já começa com '+', testa direto o DDI informado (Brasil, EUA, etc.)
  if (limpo.startsWith('+')) {
    const phone = parsePhoneNumberFromString(limpo)
    if (phone?.isValid()) return phone
  }

  const apenasNumeros = limpo.replace(/\D/g, '')

  // 2. Se a pessoa digitou sem '+', mas colocou apenas DDD + Número do Brasil (10 ou 11 dígitos)
  // Testamos como número nacional brasileiro ANTES de testar como DDI internacional
  if (apenasNumeros.length === 10 || apenasNumeros.length === 11) {
    const phoneBR = parsePhoneNumberFromString(apenasNumeros, 'BR')
    if (phoneBR?.isValid()) return phoneBR
  }

  // 3. Se a pessoa digitou o DDI (ex: 5519999998888 ou 14155552671), mas esqueceu o '+'
  // Adicionamos o '+' na frente e deixamos a biblioteca identificar o país pelo DDI
  const phoneComMais = parsePhoneNumberFromString(`+${apenasNumeros}`)
  if (phoneComMais?.isValid()) return phoneComMais

  return null
}

export const telefoneValidator = z
  .string()
  .refine((val) => extrairTelefoneValido(val) !== null, {
    message: 'Número de telefone inválido. Verifique o DDD e o número digitado.',
  })
  .transform((val) => {
    // Como já passou pelo refine, temos certeza que não é null
    return extrairTelefoneValido(val)!.number // Retorna sempre no padrão +5519999998888
  })