import type { Connect } from '@/types';
import { normalizarTelefone } from './format';

/** Abre conversa direta com o número (opcionalmente com texto pronto) */
export const linkWhatsApp = (telefone: string, texto?: string) =>
  `https://wa.me/${normalizarTelefone(telefone).replace('+', '')}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;

/** Abre o WhatsApp para escolher o contato e enviar o texto */
export const linkCompartilharWhatsApp = (texto: string) => `https://wa.me/?text=${encodeURIComponent(texto)}`;

export const enderecoConnect = (c: Pick<Connect, 'rua' | 'numero' | 'complemento' | 'bairro' | 'cidade'>) =>
  `${c.rua}, ${c.numero}${c.complemento ? ` (${c.complemento})` : ''} – ${c.bairro}, ${c.cidade}`;

/** Endereço sem complemento: melhora o resultado da busca no Maps */
const enderecoBusca = (c: Pick<Connect, 'rua' | 'numero' | 'bairro' | 'cidade'>) =>
  `${c.rua}, ${c.numero} - ${c.bairro}, ${c.cidade}`;

export const linkMapsEndereco = (endereco: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;

/** Usa o link fixo cadastrado (pin exato); se não houver, gera pela busca do endereço */
export const linkMapsConnect = (c: Connect) => c.linkMaps?.trim() || linkMapsEndereco(enderecoBusca(c));

export const linkWaze = (endereco: string) =>
  `https://waze.com/ul?q=${encodeURIComponent(endereco)}&navigate=yes`;

export const abrirNovaAba = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

export const copiarTexto = async (texto: string) => {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
};
