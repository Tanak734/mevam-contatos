import React, { useMemo, useRef, useState } from 'react';
import {
  AlertCircle, ArrowUpDown, BookHeart, Cake, ChevronRight,
  Clock3, Edit3, House, Lightbulb, MessageCircle, Plus, Search, UsersRound,
} from 'lucide-react';
import { useApp } from '@/store/appStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ModalRegistrarContato } from './ModalRegistrarContato';
import { ModalNovoVisitante } from './ModalNovoVisitante';
import { calcularTermometro, NIVEL_INFO, precisaContato } from '@/lib/termometro';
import { linkWhatsApp } from '@/lib/links';
import { formatarData, mascaraTelefone, tempoRelativo } from '@/lib/format';
import { COMO_CONHECEU, ESTADO_CIVIL, STATUS_MEMBRO, STATUS_PESSOA } from '@/config/labels';
import { isExterno } from '@/config/permissions';
import { cn } from '@/lib/utils';
import { diasAteAniversario } from '@/lib/aniversario';
import type { Visitante } from '@/types';

type Filtro = 'todos' | 'precisam' | 'sem_connect' | 'sem_discipulador' | 'nao_membros';
type Ordenacao = 'prioridade' | 'recentes' | 'nome';

export const ContatosView: React.FC = () => {
  const {
    visitantes, currentUser, getConnect, getUsuario,
    getOutrosAcompanhantes,
  } = useApp();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('prioridade');
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [visitanteParaContato, setVisitanteParaContato] = useState<Visitante | null>(null);
  const [visitanteParaEditar, setVisitanteParaEditar] = useState<Visitante | null>(null);
  const listaRef = useRef<HTMLElement>(null);
  const fichaRef = useRef<HTMLDivElement>(null);

  const listaBase = useMemo(
    () => visitantes.filter((v) => v.isAtivo && (!isExterno(currentUser.tipoUsuario) || v.userId === currentUser.id)),
    [visitantes, currentUser],
  );
  const aniversariantesHoje = useMemo(() => listaBase
    .filter((v) => v.dataNascimento && diasAteAniversario(v.dataNascimento) === 0)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')), [listaBase]);

  const listaFiltrada = useMemo(() => listaBase.filter((v) => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    const texto = `${v.nome} ${v.apelidoReferencia || ''} ${v.telefone} ${v.bairro || ''}`.toLocaleLowerCase('pt-BR');
    if (!texto.includes(termo)) return false;
    if (filtro === 'precisam') return precisaContato(v);
    if (filtro === 'sem_connect') return !v.connectId;
    if (filtro === 'sem_discipulador') return !v.discipuladorId;
    if (filtro === 'nao_membros') return v.statusMembro === 'nao_membro';
    return true;
  }).sort((a, b) => {
    const aniversarioA = Boolean(a.dataNascimento && diasAteAniversario(a.dataNascimento) === 0);
    const aniversarioB = Boolean(b.dataNascimento && diasAteAniversario(b.dataNascimento) === 0);
    if (aniversarioA !== aniversarioB) return aniversarioA ? -1 : 1;
    if (ordenacao === 'recentes') return (b.ultimoContato || b.createdAt).localeCompare(a.ultimoContato || a.createdAt);
    if (ordenacao === 'nome') return a.nome.localeCompare(b.nome, 'pt-BR');
    return calcularTermometro(b).dias - calcularTermometro(a).dias || a.nome.localeCompare(b.nome, 'pt-BR');
  }), [listaBase, busca, filtro, ordenacao]);
  const selecionado = listaFiltrada.find((v) => v.id === selecionadoId) || listaFiltrada[0] || null;

  const filtros: { id: Filtro; label: string; count: number }[] = [
    { id: 'todos', label: 'Todos', count: listaBase.length },
    { id: 'precisam', label: 'Precisam de contato', count: listaBase.filter(precisaContato).length },
    ...(!isExterno(currentUser.tipoUsuario) ? [
      { id: 'sem_connect' as Filtro, label: 'Sem Connect', count: listaBase.filter((v) => !v.connectId).length },
      { id: 'sem_discipulador' as Filtro, label: 'Sem discipulador', count: listaBase.filter((v) => !v.discipuladorId).length },
    ] : []),
    { id: 'nao_membros', label: 'Não membros', count: listaBase.filter((v) => v.statusMembro === 'nao_membro').length },
  ];

  const abrirWhatsApp = (v: Visitante) => window.open(linkWhatsApp(v.telefone), '_blank', 'noopener,noreferrer');
  const faltantes = (v: Visitante) => [
    !v.connectId && 'Connect',
    !v.discipuladorId && 'discipulador',
    !v.apelidoReferencia && 'referência',
    !v.dataNascimento && 'data de nascimento',
    !v.bairro && 'bairro',
    !v.observacaoPessoa && 'observação',
  ].filter((item): item is string => Boolean(item));

  const detalhes = (v: Visitante) => {
    const outros = getOutrosAcompanhantes(v);
    const pendencias = faltantes(v);

    return <div className="space-y-4 mt-4">
      <section className="rounded-xl border border-border bg-surface-2/60 p-4 min-w-0"><h3 className="text-lg font-bold">Dados da pessoa</h3><dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-x-5 gap-y-3 text-base"><div><dt className="text-sm text-subtle">Telefone</dt><dd className="mt-1 font-semibold break-words">{mascaraTelefone(v.telefone)}</dd></div><div><dt className="text-sm text-subtle">Membresia</dt><dd className="mt-1 font-semibold break-words">{STATUS_MEMBRO[v.statusMembro]}</dd></div><div><dt className="text-sm text-subtle">Momento</dt><dd className="mt-1 font-semibold break-words">{v.statusPessoa ? STATUS_PESSOA[v.statusPessoa] : 'Não informado'}</dd></div><div><dt className="text-sm text-subtle">Conheceu por</dt><dd className="mt-1 font-semibold break-words">{COMO_CONHECEU[v.comoConheceu]}</dd></div><div className={cn(!v.dataNascimento && 'rounded-lg border border-warning/60 bg-warning/10 p-3')}><dt className="text-sm text-subtle">Nascimento</dt><dd className="mt-1 font-semibold break-words">{v.dataNascimento ? formatarData(v.dataNascimento) : 'Não informado'}</dd></div><div><dt className="text-sm text-subtle">Estado civil</dt><dd className="mt-1 font-semibold break-words">{ESTADO_CIVIL[v.estadoCivil]}</dd></div><div className={cn('sm:col-span-2', !v.bairro && 'rounded-lg border border-warning/60 bg-warning/10 p-3')}><dt className="text-sm text-subtle">Onde mora</dt><dd className="mt-1 font-semibold break-words">{[v.bairro, v.cidadeMora].filter(Boolean).join(', ') || 'Não informado'}</dd></div></dl></section>
      <section className="rounded-xl border border-border bg-surface-2/40 p-4">
        <h3 className="text-base font-bold mb-3">Situação e vínculos</h3>
        <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-3 text-base">
          <div className={cn('rounded-lg border p-3 min-w-0', !v.connectId ? 'border-danger/70 bg-danger/15 ring-1 ring-danger/20' : 'border-border bg-surface')}><span className="text-sm font-bold text-subtle"><House size={14} className="inline mr-1 text-info" /> Connect</span><p className="mt-1 font-semibold">{v.connectId ? getConnect(v.connectId)?.nome || 'Connect não encontrado' : <span className="flex items-center gap-2 font-bold text-danger"><AlertCircle size={18} />Sem Connect</span>}</p></div>
          <div className={cn('rounded-lg border p-3 min-w-0', !v.discipuladorId ? 'border-warning/70 bg-warning/15 ring-1 ring-warning/20' : 'border-border bg-surface')}><span className="text-sm font-bold text-subtle"><BookHeart size={14} className="inline mr-1 text-brand" /> Discipulado</span><p className="mt-1 font-semibold">{v.discipuladorId ? getUsuario(v.discipuladorId)?.nome || 'Pessoa não encontrada' : <span className="flex items-center gap-2 font-bold text-warning"><AlertCircle size={18} />Sem discipulador</span>}</p></div>
          <div className="rounded-lg border border-border bg-surface p-3 min-w-0"><span className="text-sm font-bold text-subtle"><UsersRound size={14} className="inline mr-1 text-warning" /> Acompanhamento</span><p className="mt-1 font-semibold">{outros.length} {outros.length === 1 ? 'outra pessoa' : 'outras pessoas'}</p></div>
        </div>
        {pendencias.length > 0 && <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/60 bg-warning/10 p-3" aria-label="Informações faltantes">
          <div className="flex flex-wrap items-center gap-2">
            <AlertCircle size={20} className="text-warning shrink-0" />
            <h4 className="font-bold text-base mr-1">{pendencias.length} {pendencias.length === 1 ? 'informação pendente' : 'informações pendentes'}</h4>
            {pendencias.map((item) => <span key={item} className="rounded-lg border border-warning/50 bg-surface px-2 py-1 text-sm font-semibold text-warning">{item}</span>)}
          </div>
          <Button variant="outline" className="border-warning/60 text-warning hover:bg-warning/15" icon={<Edit3 size={17} />} onClick={() => setVisitanteParaEditar(v)}>Completar dados</Button>
        </div>}
      </section>
      <div className="grid 2xl:grid-cols-2 gap-4 items-start">
        <section className="rounded-xl border border-border bg-surface-2/40 p-4"><h3 className="text-base font-bold">Sobre a pessoa</h3><p className="mt-2 text-base leading-relaxed text-muted">{v.observacaoPessoa || 'Ainda não há observações. Adicione detalhes que ajudem no próximo contato.'}</p></section>
        <section className="rounded-xl border border-border bg-surface-2/40 p-4"><div className="flex items-center justify-between gap-2"><h3 className="text-base font-bold">Histórico de contato</h3><span className="text-sm text-subtle">{v.historico.length} registro{v.historico.length !== 1 ? 's' : ''}</span></div>{v.historico.length === 0 ? <p className="mt-3 text-base text-muted">Nenhuma conversa registrada ainda.</p> : <div className="mt-3 space-y-3">{v.historico.map((h) => <div key={h.id} className="border-l-2 border-brand/40 pl-3"><div className="flex flex-wrap justify-between gap-2 text-sm"><strong>{getUsuario(h.autorId)?.nome || 'Líder'}</strong><span className="text-subtle">{formatarData(h.dataContato)}</span></div>{h.observacaoContato && <p className="text-base text-muted leading-relaxed mt-2">{h.observacaoContato}</p>}</div>)}</div>}</section>
      </div>
    </div>;
  };

  return <div className="mx-auto max-w-[2120px] space-y-3 lg:space-y-0 lg:h-full lg:min-h-0 lg:flex lg:flex-col">
    {aniversariantesHoje.length > 0 && <div className="rounded-xl border border-brand/45 bg-brand/10 px-4 py-3 flex items-center gap-3"><Cake size={20} className="text-brand shrink-0" /><strong className="text-base">Aniversário hoje: {aniversariantesHoje.map((v) => v.nome).join(', ')}</strong></div>}
    <div className="grid lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] xl:grid-cols-[minmax(340px,400px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(400px,480px)_minmax(0,1fr)] gap-3 items-start lg:flex-1 lg:min-h-0 lg:items-stretch">
      <aside ref={listaRef} className="min-w-0 scroll-mt-32 rounded-2xl border border-border bg-surface lg:h-full lg:min-h-0 flex flex-col overflow-hidden" aria-label="Lista de contatos">
        <div className="p-3 border-b border-border space-y-2 shrink-0">
          <label className="relative block"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" /><input type="search" aria-label="Buscar contatos" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome, referência ou telefone" className="h-10 w-full rounded-xl border border-border bg-surface-2 pl-10 pr-3 text-sm text-foreground focus:outline-none focus:border-brand" /></label>
          <div className="grid grid-cols-2 gap-2"><select aria-label="Filtrar contatos" value={filtro} onChange={(e) => setFiltro(e.target.value as Filtro)} className="min-w-0 h-9 rounded-lg border border-border bg-surface-2 px-2 text-sm text-foreground focus:outline-none focus:border-brand">{filtros.map((item) => <option key={item.id} value={item.id}>{item.label} ({item.count})</option>)}</select><label className="flex min-w-0 items-center gap-1 text-muted"><ArrowUpDown size={15} className="shrink-0" /><select aria-label="Ordenar contatos" value={ordenacao} onChange={(e) => setOrdenacao(e.target.value as Ordenacao)} className="min-w-0 w-full h-9 rounded-lg border border-border bg-surface-2 px-2 text-sm text-foreground focus:outline-none focus:border-brand"><option value="prioridade">Prioridade</option><option value="recentes">Contato recente</option><option value="nome">Nome A–Z</option></select></label></div>
          <p className="text-xs font-semibold text-muted">{listaFiltrada.length} {listaFiltrada.length === 1 ? 'pessoa encontrada' : 'pessoas encontradas'}</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar">{listaFiltrada.length === 0 ? <p className="p-6 text-sm text-muted">Nenhum contato neste filtro.</p> : listaFiltrada.map((v) => {
          const term = calcularTermometro(v); const info = NIVEL_INFO[term.nivel]; const active = selecionado?.id === v.id;
          const aniversarioHoje = Boolean(v.dataNascimento && diasAteAniversario(v.dataNascimento) === 0);
          return <button key={v.id} onClick={() => { setSelecionadoId(v.id); if (window.innerWidth < 1024) requestAnimationFrame(() => fichaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }} aria-current={active ? 'true' : undefined} className={cn('block w-full border-b border-border border-l-[3px] px-4 py-3 text-left transition-colors hover:bg-surface-2', active ? 'border-l-brand bg-brand/10' : 'border-l-transparent')}>
            <span className="flex items-start justify-between gap-2"><span className="min-w-0"><strong className="block truncate text-base font-bold">{v.nome}</strong><span className="block truncate text-sm text-muted">{v.apelidoReferencia || 'Sem referência'}</span></span><span className="flex shrink-0 items-center gap-2">{v.dataNascimento && <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold', aniversarioHoje ? 'border-brand/50 bg-brand/15 text-brand' : 'border-border text-muted')}><Cake size={13} />{aniversarioHoje ? 'Hoje' : formatarData(v.dataNascimento, 'dd/MM')}</span>}<ChevronRight size={17} className="text-subtle" /></span></span>
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5"><Badge variant={info.tone} dot size="sm">{info.label}</Badge>{!v.connectId && <Badge variant="danger" size="sm" className="border-danger/70 bg-danger/20 font-semibold"><AlertCircle size={12} />Sem Connect</Badge>}{!v.discipuladorId && <Badge variant="warning" size="sm" className="border-warning/70 bg-warning/20 font-semibold"><AlertCircle size={12} />Sem discipulador</Badge>}</span>
            <span className="mt-2 flex items-end justify-between gap-2 text-sm"><span className="min-w-0"><span className="block text-xs text-subtle">Último contato</span><strong className="block text-foreground font-semibold">{v.ultimoContato ? formatarData(v.ultimoContato) : 'Ainda não houve'}</strong></span><span className="shrink-0 text-right"><span className="block text-xs font-medium text-muted">{v.acompanhantes.length} {v.acompanhantes.length === 1 ? 'pessoa acompanha' : 'pessoas acompanham'}</span><strong className="block text-base text-foreground whitespace-nowrap">{v.ultimoContato ? tempoRelativo(v.ultimoContato) : 'Novo'}</strong></span></span>
          </button>;
        })}</div>
      </aside>
      <div ref={fichaRef} aria-label="Ficha do visitante" className="min-w-0 scroll-mt-32 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:no-scrollbar overscroll-contain rounded-2xl border border-border bg-surface p-4 sm:p-5">{selecionado ? <div className="w-full lg:min-h-full lg:flex lg:flex-col">
        <button className="lg:hidden mb-4 text-sm font-semibold text-brand" onClick={() => listaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>← Voltar à lista</button>
        <div className="grid 2xl:grid-cols-[minmax(0,1fr)_auto] gap-5 items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={NIVEL_INFO[calcularTermometro(selecionado).nivel].tone} dot size="md">{NIVEL_INFO[calcularTermometro(selecionado).nivel].label}</Badge>
              {selecionado.dataNascimento && <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted"><Cake size={16} className="text-brand" />{diasAteAniversario(selecionado.dataNascimento) === 0 ? 'Aniversário hoje' : `Aniversário: ${formatarData(selecionado.dataNascimento, 'dd/MM')}`}</span>}
            </div>
            <h3 className="mt-3 text-2xl 2xl:text-3xl font-bold">{selecionado.nome}</h3>
            <p className="mt-1 text-base text-muted">{selecionado.apelidoReferencia || 'Sem referência cadastrada'}</p>
          </div>
          <div className={cn('rounded-xl border px-5 py-4 2xl:min-w-[240px]', calcularTermometro(selecionado).nivel === 'critico' ? 'border-danger/45 bg-danger/10' : 'border-brand/30 bg-brand/5')}>
            <span className="flex items-center gap-2 text-sm font-bold text-muted"><Clock3 size={17} className="text-brand" /> Último contato</span>
            <strong className="mt-1 block text-2xl 2xl:text-3xl">{selecionado.ultimoContato ? tempoRelativo(selecionado.ultimoContato) : 'Ainda não houve'}</strong>
            <span className="mt-1 block text-base text-muted">{selecionado.ultimoContato ? formatarData(selecionado.ultimoContato) : `Cadastro: ${formatarData(selecionado.createdAt)}`}</span>
          </div>
        </div>
        <div role="group" aria-label="Ações do visitante" className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="lg" variant="secondary" className="bg-emerald-800 border-emerald-700 text-white hover:bg-emerald-700" icon={<MessageCircle size={21} />} onClick={() => abrirWhatsApp(selecionado)}>WhatsApp</Button>
          <Button size="lg" variant="secondary" className="bg-yellow-600 border-yellow-500 text-yellow-950 hover:bg-yellow-500" icon={<Edit3 size={20} />} onClick={() => setVisitanteParaEditar(selecionado)}>Editar cadastro</Button>
          <Button size="lg" icon={<Plus size={19} />} onClick={() => setVisitanteParaContato(selecionado)}>Registrar contato</Button>
        </div>
        {detalhes(selecionado)}
        <section aria-label="Sugestões para a próxima conversa" className="mt-4 lg:mt-auto pt-4">
          <div className="border-t border-border pt-3">
            <h4 className="flex items-center gap-2 text-base font-semibold"><Lightbulb size={18} className="text-warning shrink-0" />Para a próxima conversa</h4>
            <div className="mt-3 grid 2xl:grid-cols-3 gap-3 text-sm leading-relaxed text-muted">
              <p className="rounded-lg bg-surface-2/50 px-3 py-2">{selecionado.statusMembro === 'membro' ? 'Como você tem passado nesta semana?' : 'Como você tem passado desde a sua visita?'}</p>
              <p className="rounded-lg bg-surface-2/50 px-3 py-2">{selecionado.connectId ? 'Como tem sido sua experiência no Connect?' : 'Gostaria de conhecer um Connect perto de você?'}</p>
              <p className="rounded-lg bg-surface-2/50 px-3 py-2">{selecionado.discipuladorId ? 'Como está seu acompanhamento? Podemos ajudar em algo?' : 'Gostaria de ter alguém para acompanhar sua caminhada de fé?'}</p>
            </div>
          </div>
        </section>
      </div> : <div className="p-8 text-center text-muted">Selecione uma pessoa na lista.</div>}</div>
    </div>
    <ModalRegistrarContato isOpen={Boolean(visitanteParaContato)} onClose={() => setVisitanteParaContato(null)} visitante={visitanteParaContato} />
    <ModalNovoVisitante isOpen={Boolean(visitanteParaEditar)} onClose={() => setVisitanteParaEditar(null)} visitanteParaEditar={visitanteParaEditar} />
  </div>;
};
