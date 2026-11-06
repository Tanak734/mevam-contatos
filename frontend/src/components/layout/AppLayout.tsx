import React from 'react';
import { Navbar } from './Navbar';
import type { Area } from '@/config/permissions';

interface AppLayoutProps {
  currentArea: Area;
  onNavigate: (area: Area) => void;
  onOpenNovoVisitante: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentArea, onNavigate, onOpenNovoVisitante, children }) => (
  <div className={`min-h-screen bg-background text-foreground lg:flex lg:items-start ${currentArea === 'contatos' ? 'lg:h-dvh lg:min-h-0 lg:overflow-hidden lg:flex-row' : ''}`}>
    <Navbar currentArea={currentArea} onNavigate={onNavigate} onOpenNovoVisitante={onOpenNovoVisitante} />
    <main className={`w-full min-w-0 lg:flex-1 max-w-[2880px] mx-auto px-4 sm:px-7 lg:px-5 2xl:px-8 page-enter ${currentArea === 'contatos' ? 'py-4 lg:h-full lg:min-h-0 lg:flex-1 lg:overflow-hidden' : 'py-7 lg:py-9'}`} key={currentArea}>
      {children}
    </main>
  </div>
);
