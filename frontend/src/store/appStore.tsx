import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MOCK_CONNECTS, MOCK_USUARIOS, MOCK_VISITANTES } from '@/data/mockData';
import { precisaContato } from '@/lib/termometro';
import type { Connect, HistoricoContato, Usuario, Visitante } from '@/types';

interface RegistrarContatoParams {
  visitanteId: string;
  dataContato: string;
  observacaoContato: string | null;
  apelidoReferencia?: string;
  observacaoPessoa?: string;
}

interface AppContextType {
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  toggleTheme: () => void;

  currentUser: Usuario;
  setCurrentUser: (u: Usuario) => void;
  usuarios: Usuario[];
  adicionarUsuario: (u: Omit<Usuario, 'id' | 'createdAt'>) => void;
  atualizarUsuario: (id: string, updates: Partial<Usuario>) => void;

  connects: Connect[];
  adicionarConnect: (c: Omit<Connect, 'id'>) => void;
  atualizarConnect: (id: string, updates: Partial<Connect>) => void;

  visitantes: Visitante[];
  adicionarVisitante: (v: Omit<Visitante, 'id' | 'createdAt' | 'updatedAt' | 'acompanhantes' | 'historico'>) => void;
  atualizarVisitante: (id: string, updates: Partial<Visitante>) => void;
  excluirVisitante: (id: string) => void;
  registrarContato: (params: RegistrarContatoParams) => void;
  definirDiscipulador: (visitanteId: string, discipuladorId: string | null) => void;
  alternarAcompanhamento: (visitanteId: string) => void;

  // Helpers
  getUsuario: (id: string | null | undefined) => Usuario | undefined;
  getConnect: (id: string | null | undefined) => Connect | undefined;
  getOutrosAcompanhantes: (v: Visitante) => Usuario[];

  badges: {
    precisamContato: number;
    semDiscipulador: number;
    colisoes: number;
  };
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('mevam-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark'; // Dark default como apps cripto/web3 modernos
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mevam-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const [usuarios, setUsuarios] = useState<Usuario[]>(MOCK_USUARIOS);
  const [currentUser, setCurrentUser] = useState<Usuario>(MOCK_USUARIOS[0]); // Começa com Tanaka (Admin)
  const [connects, setConnects] = useState<Connect[]>(MOCK_CONNECTS);
  const [visitantes, setVisitantes] = useState<Visitante[]>(MOCK_VISITANTES);

  const getUsuario = (id: string | null | undefined) => (id ? usuarios.find((u) => u.id === id) : undefined);
  const getConnect = (id: string | null | undefined) => (id ? connects.find((c) => c.id === id) : undefined);

  /** Retorna apenas quem ALÉM do usuário atual está em acompanhamento ativo */
  const getOutrosAcompanhantes = (v: Visitante): Usuario[] => {
    return v.acompanhantes
      .filter((id) => id !== currentUser.id)
      .map((id) => getUsuario(id))
      .filter((u): u is Usuario => Boolean(u));
  };

  const adicionarUsuario = (u: Omit<Usuario, 'id' | 'createdAt'>) => {
    const novo: Usuario = {
      ...u,
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsuarios((prev) => [...prev, novo]);
  };

  const atualizarUsuario = (id: string, updates: Partial<Usuario>) => {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  const adicionarConnect = (c: Omit<Connect, 'id'>) => {
    const novo: Connect = {
      ...c,
      id: `c-${Date.now()}`,
    };
    setConnects((prev) => [...prev, novo]);
  };

  const atualizarConnect = (id: string, updates: Partial<Connect>) => {
    setConnects((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const adicionarVisitante = (
    v: Omit<Visitante, 'id' | 'createdAt' | 'updatedAt' | 'acompanhantes' | 'historico'>
  ) => {
    const agora = new Date().toISOString();
    const novo: Visitante = {
      ...v,
      id: `v-${Date.now()}`,
      createdAt: agora,
      updatedAt: agora,
      acompanhantes: [],
      historico: [],
    };
    setVisitantes((prev) => [novo, ...prev]);
  };

  const atualizarVisitante = (id: string, updates: Partial<Visitante>) => {
    setVisitantes((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v))
    );
  };

  const excluirVisitante = (id: string) => {
    // Soft delete
    setVisitantes((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isAtivo: false, updatedAt: new Date().toISOString() } : v))
    );
  };

  const registrarContato = ({
    visitanteId,
    dataContato,
    observacaoContato,
    apelidoReferencia,
    observacaoPessoa,
  }: RegistrarContatoParams) => {
    const agora = new Date().toISOString();
    const novoHistorico: HistoricoContato = {
      id: `h-${Date.now()}`,
      autorId: currentUser.id,
      dataContato,
      observacaoContato,
      createdAt: agora,
    };

    setVisitantes((prev) =>
      prev.map((v) => {
        if (v.id !== visitanteId) return v;

        return {
          ...v,
          ultimoContato: dataContato,
          apelidoReferencia: apelidoReferencia !== undefined ? apelidoReferencia : v.apelidoReferencia,
          observacaoPessoa: observacaoPessoa !== undefined ? observacaoPessoa : v.observacaoPessoa,
          historico: [novoHistorico, ...v.historico],
          updatedAt: agora,
        };
      })
    );
  };

  const definirDiscipulador = (visitanteId: string, discipuladorId: string | null) => {
    setVisitantes((prev) =>
      prev.map((v) => (v.id === visitanteId ? { ...v, discipuladorId, updatedAt: new Date().toISOString() } : v))
    );
  };

  const alternarAcompanhamento = (visitanteId: string) => {
    setVisitantes((prev) =>
      prev.map((v) => {
        if (v.id !== visitanteId) return v;
        const jaEsta = v.acompanhantes.includes(currentUser.id);
        const novaLista = jaEsta
          ? v.acompanhantes.filter((id) => id !== currentUser.id)
          : [...v.acompanhantes, currentUser.id];
        return { ...v, acompanhantes: novaLista, updatedAt: new Date().toISOString() };
      })
    );
  };

  // Badges calculados dinamicamente
  const badges = useMemo(() => {
    const ativos = visitantes.filter((v) => v.isAtivo);
    const precisam = ativos.filter(precisaContato).length;
    const semDisc = ativos.filter((v) => !v.discipuladorId).length;
    // Colisão: 2 ou mais pessoas conversando ao mesmo tempo
    const colisoes = ativos.filter((v) => v.acompanhantes.length >= 2).length;

    return {
      precisamContato: precisam,
      semDiscipulador: semDisc,
      colisoes,
    };
  }, [visitantes]);

  const value = {
    theme,
    setTheme,
    toggleTheme,
    currentUser,
    setCurrentUser,
    usuarios,
    adicionarUsuario,
    atualizarUsuario,
    connects,
    adicionarConnect,
    atualizarConnect,
    visitantes,
    adicionarVisitante,
    atualizarVisitante,
    excluirVisitante,
    registrarContato,
    definirDiscipulador,
    alternarAcompanhamento,
    getUsuario,
    getConnect,
    getOutrosAcompanhantes,
    badges,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
