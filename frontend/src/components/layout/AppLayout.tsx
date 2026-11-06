import React from 'react';
import { Navbar } from './Navbar';
import type { Area } from '@/config/permissions';
import { Moon, Plus, Sun } from 'lucide-react';
import { useApp } from '@/store/appStore';
import { Button } from '@/components/ui/Button';

interface AppLayoutProps {
  currentArea: Area;
  onNavigate: (area: Area) => void;
  onOpenNovoVisitante: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentArea, onNavigate, onOpenNovoVisitante, children }) => {
  const { theme, toggleTheme } = useApp();
  return (
  <div className={`min-h-screen bg-background text-foreground lg:flex lg:items-start ${currentArea === 'contatos' ? 'lg:h-dvh lg:min-h-0 lg:overflow-hidden lg:flex-row' : ''}`}>
    <Navbar currentArea={currentArea} onNavigate={onNavigate} onOpenNovoVisitante={onOpenNovoVisitante} />
    <div className={`min-w-0 flex-1 lg:flex lg:flex-col ${currentArea === 'contatos' ? 'lg:h-full lg:min-h-0' : ''}`}>
      <div className="hidden lg:flex w-full max-w-[2184px] relative min-[2560px]:-left-[20px] mx-auto shrink-0 justify-end items-center gap-3 px-6 2xl:px-8 pt-4 pb-1">
        <Button onClick={onOpenNovoVisitante} icon={<Plus size={18} />}>Novo visitante</Button>
        <button onClick={toggleTheme} className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl border border-border bg-surface hover:bg-surface-2 transition-colors" aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'} title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
      </div>
    <main className={`w-full min-w-0 lg:flex-1 max-w-[2184px] relative min-[2560px]:-left-[20px] mx-auto px-4 sm:px-7 lg:px-6 2xl:px-8 page-enter ${currentArea === 'contatos' ? 'py-4 lg:min-h-0 lg:overflow-hidden' : 'py-7 lg:py-9'}`} key={currentArea}>
      {children}
    </main>
    </div>
  </div>
  );
};
