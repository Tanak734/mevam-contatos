import React from 'react';
import { Moon, Plus, Sun, ChevronsUpDown } from 'lucide-react';
import { NAVEGACAO } from '@/config/navigation';
import { podeAcessar, type Area } from '@/config/permissions';
import { TIPO_USUARIO } from '@/config/labels';
import { useApp } from '@/store/appStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface NavbarProps {
  currentArea: Area;
  onNavigate: (area: Area) => void;
  onOpenNovoVisitante: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentArea, onNavigate, onOpenNovoVisitante }) => {
  const { currentUser, setCurrentUser, usuarios, theme, toggleTheme, badges } = useApp();
  const navItems = NAVEGACAO.filter((item) => podeAcessar(currentUser.tipoUsuario, item.area));

  return <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-surface/95 backdrop-blur-xl lg:h-dvh lg:w-[230px] 2xl:w-[270px] lg:border-b-0 lg:border-r">
    <div className="mx-auto max-w-[2880px] px-4 sm:px-7 lg:px-3 lg:py-5 lg:h-full lg:flex lg:flex-col lg:gap-6">
      <div className="min-h-[72px] py-3 flex items-center justify-between gap-3 lg:contents">
        <button onClick={() => onNavigate('contatos')} className="flex items-center gap-3 text-left shrink-0 lg:order-1 lg:px-2" aria-label="Ir para Contatos">
          <span className="h-10 w-10 2xl:h-12 2xl:w-12 rounded-xl bg-brand text-brand-foreground flex items-center justify-center font-bold text-xl tracking-[-0.1em]">M<span className="text-warm">.</span></span>
          <span className="hidden sm:block lg:block"><strong className="block text-base 2xl:text-lg leading-5 tracking-tight">MEVAM</strong><small className="block text-xs text-subtle uppercase tracking-[0.2em] mt-1">CONTATOS</small></span>
        </button>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 lg:order-3 lg:flex-col lg:items-stretch lg:border-t lg:border-border lg:pt-4">
          <label className="relative flex w-28 sm:w-auto items-center gap-2 rounded-xl border border-border bg-surface-2 px-2.5 h-10 sm:max-w-56 lg:w-full lg:max-w-none" title="Simular perfil de usuário">
            <span className="hidden sm:flex lg:hidden h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand text-[10px] font-bold">{currentUser.nome[0]}</span>
            <select aria-label="Simular perfil de usuário" value={currentUser.id} onChange={(e) => {
              const user = usuarios.find((u) => u.id === e.target.value);
              if (user) { setCurrentUser(user); if (!podeAcessar(user.tipoUsuario, currentArea)) onNavigate('contatos'); }
            }} className="appearance-none min-w-0 max-w-full flex-1 pr-3 bg-transparent text-sm font-semibold text-foreground truncate cursor-pointer focus:outline-none">
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome.split(' ')[0]} · {TIPO_USUARIO[u.tipoUsuario]}</option>)}
            </select>
            <ChevronsUpDown size={13} className="absolute right-2 text-subtle pointer-events-none" />
          </label>
          <button onClick={toggleTheme} className="h-10 w-10 shrink-0 flex items-center justify-center gap-2 rounded-xl border border-border hover:border-border-strong hover:bg-surface-2 transition-colors lg:hidden" aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'} title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
          <Button onClick={onOpenNovoVisitante} icon={<Plus size={17} />} className="hidden sm:inline-flex lg:hidden">Novo visitante</Button>
          <button onClick={onOpenNovoVisitante} className="sm:hidden h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-brand text-brand-foreground" aria-label="Novo visitante"><Plus size={20} /></button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto no-scrollbar lg:order-2 lg:flex-1 lg:min-h-0 lg:flex-col lg:overflow-y-auto" aria-label="Navegação principal">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentArea === item.area;
          const badge = item.badge ? badges[item.badge] : 0;
          return <button key={item.area} onClick={() => onNavigate(item.area)} aria-current={active ? 'page' : undefined} className={cn('shrink-0 flex items-center gap-2 border-b-[3px] px-3 sm:px-4 py-3 2xl:py-4 text-sm font-semibold transition-[color,background-color,border-color] hover:bg-surface-2 lg:border-b-0 lg:border-l-[3px] lg:rounded-xl lg:text-left lg:px-2', active ? 'border-brand text-brand lg:bg-brand/10' : 'border-transparent text-muted hover:text-foreground')}>
            <Icon className="shrink-0" size={18} strokeWidth={active ? 2.3 : 1.8} /><span>{item.label}</span>{badge > 0 && <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] tabular font-bold', active ? 'bg-brand/15 text-brand' : 'bg-surface-2 text-subtle')}>{badge}</span>}
          </button>;
        })}
      </nav>
    </div>
  </header>;
};
