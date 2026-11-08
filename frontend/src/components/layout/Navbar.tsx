import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, Moon, Plus, Sun, ChevronsUpDown, X } from 'lucide-react';
import { NAVEGACAO } from '@/config/navigation';
import { podeAcessar, type Area } from '@/config/permissions';
import { TIPO_USUARIO } from '@/config/labels';
import { useApp } from '@/store/appStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';

interface NavbarProps {
  currentArea: Area;
  onNavigate: (area: Area) => void;
  onOpenNovoVisitante: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentArea, onNavigate, onOpenNovoVisitante }) => {
  const { currentUser, setCurrentUser, usuarios, theme, toggleTheme, badges } = useApp();
  const [menuAberto, setMenuAberto] = useState(false);
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const navItems = NAVEGACAO.filter((item) => podeAcessar(currentUser.tipoUsuario, item.area));
  useBodyScrollLock(isMobile && menuAberto);

  useEffect(() => { if (!isMobile) setMenuAberto(false); }, [isMobile]);
  useEffect(() => {
    if (!menuAberto) return;
    drawerRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuAberto(false);
      if (event.key !== 'Tab') return;
      const elements = drawerRef.current?.querySelectorAll<HTMLElement>('button, select');
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      menuButtonRef.current?.focus();
    };
  }, [menuAberto]);

  const navegar = (area: Area) => { onNavigate(area); setMenuAberto(false); };
  const marca = (compact = false) => <button onClick={() => navegar('contatos')} className="flex items-center gap-2.5 text-left shrink-0" aria-label="Ir para Contatos">
    <span className={cn('rounded-xl bg-brand text-brand-foreground flex items-center justify-center font-bold tracking-[-0.1em]', compact ? 'h-9 w-9 text-lg' : 'h-12 w-12 text-xl')}>M<span className="text-warm">.</span></span>
    <span><strong className="block text-base 2xl:text-lg leading-5 tracking-tight">MEVAM</strong><small className="block text-[10px] text-subtle uppercase tracking-[0.2em] mt-0.5">CONTATOS</small></span>
  </button>;
  const perfil = () => <label className="relative flex w-full items-center rounded-xl border border-border bg-surface-2 px-2.5 h-11" title="Simular perfil de usuário">
    <select aria-label="Simular perfil de usuário" value={currentUser.id} onChange={(event) => {
      const user = usuarios.find((u) => u.id === event.target.value);
      if (user) { setCurrentUser(user); if (!podeAcessar(user.tipoUsuario, currentArea)) navegar('contatos'); }
    }} className="appearance-none min-w-0 w-full pr-4 bg-transparent text-sm font-semibold text-foreground truncate cursor-pointer focus:outline-none">
      {usuarios.map((user) => <option key={user.id} value={user.id}>{user.nome.split(' ')[0]} · {TIPO_USUARIO[user.tipoUsuario]}</option>)}
    </select><ChevronsUpDown size={13} className="absolute right-2 text-subtle pointer-events-none" />
  </label>;
  const navegacao = () => <nav className="flex flex-col gap-1 min-h-0 flex-1 overflow-y-auto no-scrollbar" aria-label="Navegação principal">
    {navItems.map((item) => {
      const Icon = item.icon;
      const active = currentArea === item.area;
      const badge = item.badge ? badges[item.badge] : 0;
      return <button key={item.area} onClick={() => navegar(item.area)} aria-current={active ? 'page' : undefined} className={cn('shrink-0 flex items-center gap-2 border-l-[3px] rounded-xl px-3 py-3 2xl:py-4 text-sm font-semibold text-left transition-colors hover:bg-surface-2', active ? 'border-brand text-brand bg-brand/10' : 'border-transparent text-muted hover:text-foreground')}>
        <Icon className="shrink-0" size={18} /><span>{item.label}</span>{badge > 0 && <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] tabular font-bold', active ? 'bg-brand/15 text-brand' : 'bg-surface-2 text-subtle')}>{badge}</span>}
      </button>;
    })}
  </nav>;

  return <>
    {isMobile ? <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-border bg-surface/95 backdrop-blur-xl px-3 py-3">
      {marca(true)}
      <div className="flex items-center gap-2">
        <Button size="sm" className="min-h-10 px-3" onClick={onOpenNovoVisitante} icon={<Plus size={16} />}>Novo visitante</Button>
        <button ref={menuButtonRef} onClick={() => setMenuAberto(true)} aria-label="Abrir menu" aria-expanded={menuAberto} aria-controls="menu-mobile" className="h-10 w-10 flex shrink-0 items-center justify-center rounded-xl border border-border hover:bg-surface-2"><Menu size={21} /></button>
      </div>
    </header> : <aside className="sticky top-0 shrink-0 h-dvh w-[230px] 2xl:w-[270px] border-r border-border bg-surface/95 px-3 py-5 flex flex-col gap-6">
      <div className="px-2">{marca()}</div>
      {navegacao()}
      <div className="border-t border-border pt-4">{perfil()}</div>
    </aside>}
    {isMobile && menuAberto && createPortal(<div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={() => setMenuAberto(false)} />
      <aside ref={drawerRef} id="menu-mobile" role="dialog" aria-modal="true" aria-labelledby="titulo-menu-mobile" className="relative h-dvh w-[min(320px,88vw)] bg-surface border-r border-border p-4 flex flex-col gap-5 animate-fade-in">
        <div className="flex items-center justify-between gap-3"><h2 id="titulo-menu-mobile" className="font-bold text-lg">Menu · MEVAM</h2><button onClick={() => setMenuAberto(false)} aria-label="Fechar menu" className="h-10 w-10 flex items-center justify-center rounded-xl border border-border"><X size={20} /></button></div>
        {navegacao()}
        <div className="border-t border-border pt-4 space-y-3">
          <button onClick={toggleTheme} className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}{theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}</button>
          {perfil()}
        </div>
      </aside>
    </div>, document.body)}
  </>;
};
