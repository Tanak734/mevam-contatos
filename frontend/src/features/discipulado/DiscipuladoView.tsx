import React, { useState } from 'react';
import { BookHeart, Search, UserRoundX } from 'lucide-react';
import { useApp } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { TIPO_USUARIO } from '@/config/labels';
import type { Visitante } from '@/types';

type Filtro = 'aguardando' | 'todos';

export const DiscipuladoView: React.FC = () => {
  const { visitantes, usuarios, getUsuario, definirDiscipulador } = useApp();
  const [filtro, setFiltro] = useState<Filtro>('aguardando');
  const [busca, setBusca] = useState('');
  const [visitanteSelecionado, setVisitanteSelecionado] = useState<Visitante | null>(null);
  const [novoDiscipuladorId, setNovoDiscipuladorId] = useState('');

  const ativos = visitantes.filter((v) => v.isAtivo);
  const aguardando = ativos.filter((v) => !v.discipuladorId);
  const lista = ativos.filter((v) => {
    if (filtro === 'aguardando' && v.discipuladorId) return false;
    return `${v.nome} ${v.apelidoReferencia || ''}`.toLocaleLowerCase('pt-BR').includes(busca.trim().toLocaleLowerCase('pt-BR'));
  }).sort((a, b) => Number(Boolean(a.discipuladorId)) - Number(Boolean(b.discipuladorId)) || a.nome.localeCompare(b.nome, 'pt-BR'));

  const abrir = (v: Visitante) => {
    setVisitanteSelecionado(v);
    setNovoDiscipuladorId(v.discipuladorId || '');
  };
  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitanteSelecionado) return;
    definirDiscipulador(visitanteSelecionado.id, novoDiscipuladorId || null);
    setVisitanteSelecionado(null);
  };

  return <div className="space-y-6">
    <section><h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Discipulado</h2><p className="mt-2 max-w-3xl text-sm lg:text-base text-muted">Aqui você define o vínculo de cada pessoa com um discipulador. A lista mostra primeiro quem ainda precisa de indicação. Conversas em andamento aparecem na aba Acompanhamentos.</p></section>
    <div className="grid sm:grid-cols-2 gap-3 max-w-[1400px]">
      <Card className="p-5 border-l-4 border-l-warm"><div className="flex items-center gap-2 text-sm text-muted"><UserRoundX size={18} className="text-warm" /> Aguardando indicação</div><strong className="block mt-2 text-3xl tabular">{aguardando.length}</strong></Card>
      <Card className="p-5 border-l-4 border-l-brand"><div className="flex items-center gap-2 text-sm text-muted"><BookHeart size={18} className="text-brand" /> Com discipulador</div><strong className="block mt-2 text-3xl tabular">{ativos.length - aguardando.length}</strong></Card>
    </div>
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Filtrar discipulado">
        <Button size="sm" variant={filtro === 'aguardando' ? 'primary' : 'outline'} onClick={() => setFiltro('aguardando')}>Aguardando ({aguardando.length})</Button>
        <Button size="sm" variant={filtro === 'todos' ? 'primary' : 'outline'} onClick={() => setFiltro('todos')}>Todas as pessoas ({ativos.length})</Button>
      </div>
      <label className="relative block w-full lg:w-80 2xl:w-[520px]"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" /><input aria-label="Buscar pessoas no discipulado" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar pessoa ou referência" className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-brand" /></label>
    </div>
    <div className="space-y-2"><p className="text-sm text-subtle">{lista.length} pessoas neste filtro</p>{lista.length === 0 ? <Card className="p-8 text-center text-sm text-muted">Nenhuma pessoa encontrada.</Card> : lista.map((v) => {
      const discipulador = getUsuario(v.discipuladorId);
      return <Card key={v.id} className="p-4 sm:p-5"><div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0"><strong className="block text-base lg:text-lg truncate">{v.nome}</strong><span className="block text-sm text-muted truncate">{v.apelidoReferencia || 'Sem referência cadastrada'}</span></div>
        <div><span className="block text-xs text-subtle mb-1">Discipulador responsável</span>{discipulador ? <strong className="text-sm lg:text-base">{discipulador.nome}</strong> : <Badge variant="warning" dot size="md">Aguardando indicação</Badge>}</div>
        <Button variant={discipulador ? 'outline' : 'primary'} className="w-full md:w-auto min-h-11" onClick={() => abrir(v)}>{discipulador ? 'Trocar discipulador' : 'Indicar discipulador'}</Button>
      </div></Card>;
    })}</div>
    <Modal isOpen={Boolean(visitanteSelecionado)} onClose={() => setVisitanteSelecionado(null)} title="Definir discipulador" description={`Selecione quem ficará responsável por ${visitanteSelecionado?.nome}.`} maxWidth="sm">
      <form onSubmit={salvar} className="space-y-4"><Select label="Discipulador(a)" value={novoDiscipuladorId} onChange={(e) => setNovoDiscipuladorId(e.target.value)} options={[{ value: '', label: 'Sem discipulador' }, ...usuarios.filter((u) => u.isAtivo && u.tipoUsuario !== 'usuario_externo').map((u) => ({ value: u.id, label: `${u.nome} · ${TIPO_USUARIO[u.tipoUsuario]}` }))]} /><div className="flex justify-end gap-2 pt-2 border-t border-border"><Button type="button" variant="ghost" onClick={() => setVisitanteSelecionado(null)}>Cancelar</Button><Button type="submit">Salvar vínculo</Button></div></form>
    </Modal>
  </div>;
};
