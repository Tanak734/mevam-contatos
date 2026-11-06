import {
  BookHeart,
  Home,
  MessagesSquare,
  Shield,
  CircleUserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Area } from './permissions';

export type BadgeKey = 'precisamContato' | 'semDiscipulador' | 'colisoes';

export interface NavItem {
  area: Area;
  label: string;
  icon: LucideIcon;
  badge?: BadgeKey;
}

/**
 * Itens da barra superior de navegação
 */
export const NAVEGACAO: NavItem[] = [
  { area: 'contatos', label: 'Contatos', icon: Users, badge: 'precisamContato' },
  { area: 'connects', label: 'Connects', icon: Home },
  { area: 'discipulado', label: 'Discipulado', icon: BookHeart, badge: 'semDiscipulador' },
  { area: 'acompanhamentos', label: 'Acompanhamentos', icon: MessagesSquare },
  { area: 'usuarios', label: 'Usuários', icon: Shield },
  { area: 'perfil', label: 'Meu perfil', icon: CircleUserRound },
];
