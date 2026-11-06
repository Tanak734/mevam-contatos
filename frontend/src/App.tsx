import React, { lazy, Suspense, useEffect, useState } from 'react';
import { AppProvider, useApp } from '@/store/appStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { ContatosView } from '@/features/contatos/ContatosView';
const ConnectsView = lazy(() => import('@/features/connects/ConnectsView').then((module) => ({ default: module.ConnectsView })));
const AcompanhamentosView = lazy(() => import('@/features/acompanhamentos/AcompanhamentosView').then((module) => ({ default: module.AcompanhamentosView })));
const DiscipuladoView = lazy(() => import('@/features/discipulado/DiscipuladoView').then((module) => ({ default: module.DiscipuladoView })));
const UsuariosView = lazy(() => import('@/features/usuarios/UsuariosView').then((module) => ({ default: module.UsuariosView })));
const PerfilView = lazy(() => import('@/features/usuarios/PerfilView').then((module) => ({ default: module.PerfilView })));
import { ModalNovoVisitante } from '@/features/contatos/ModalNovoVisitante';
import { podeAcessar, rotaInicial, type Area } from '@/config/permissions';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();
  const [currentArea, setCurrentArea] = useState<Area>('contatos');
  const [modalNovoVisitanteAberto, setModalNovoVisitanteAberto] = useState(false);

  // Redireciona se o perfil atual não tiver permissão para a área selecionada
  useEffect(() => {
    if (!podeAcessar(currentUser.tipoUsuario, currentArea)) {
      const nova = rotaInicial(currentUser.tipoUsuario).replace('/', '') as Area;
      setCurrentArea(nova);
    }
  }, [currentUser.tipoUsuario, currentArea]);

  const handleNavigate = (area: Area) => {
    if (podeAcessar(currentUser.tipoUsuario, area)) {
      setCurrentArea(area);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  return (
    <AppLayout
      currentArea={currentArea}
      onNavigate={handleNavigate}
      onOpenNovoVisitante={() => setModalNovoVisitanteAberto(true)}
    >
      <Suspense fallback={<div className="rounded-2xl border border-border bg-surface p-8 text-sm text-muted">Carregando área...</div>}>
        {currentArea === 'contatos' && <ContatosView />}
        {currentArea === 'connects' && <ConnectsView />}
        {currentArea === 'discipulado' && <DiscipuladoView />}
        {currentArea === 'acompanhamentos' && <AcompanhamentosView />}
        {currentArea === 'usuarios' && <UsuariosView />}
        {currentArea === 'perfil' && <PerfilView />}
      </Suspense>

      {/* Modal Global Novo Visitante */}
      <ModalNovoVisitante
        isOpen={modalNovoVisitanteAberto}
        onClose={() => setModalNovoVisitanteAberto(false)}
      />
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
