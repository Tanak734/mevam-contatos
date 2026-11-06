import React, { useState } from 'react';
import { MessageCircle, Search, UsersRound } from 'lucide-react';
import { useApp } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TIPO_USUARIO } from '@/config/labels';
import { formatarData, tempoRelativo } from '@/lib/format';
import { linkWhatsApp } from '@/lib/links';

export const AcompanhamentosView: React.FC = () => {
  const { visitantes, usuarios } = useApp();
  const [busca, setBusca] = useState('');
  const ativos = visitantes.filter((v) => v.isAtivo);
  const usuariosAtivos = usuarios.filter((u) => u.isAtivo);
  const comAcompanhante = ativos.filter((v) => v.acompanhantes.length > 0).length;
  const semAcompanhante = ativos.length - comAcompanhante;
  const termo = busca.trim().toLocaleLowerCase('pt-BR');
  const grupos = usuariosAtivos.map((usuario) => ({
    usuario,
    pessoas: ativos.filter((v) => v.acompanhantes.includes(usuario.id)),
  })).sort((a, b) => b.pessoas.length - a.pessoas.length || a.usuario.nome.localeCompare(b.usuario.nome, 'pt-BR'));
  const gruposFiltrados = grupos.map((grupo) => {
    const usuarioCorresponde = grupo.usuario.nome.toLocaleLowerCase('pt-BR').includes(termo);
    return { ...grupo, pessoasVisiveis: !termo || usuarioCorresponde ? grupo.pessoas : grupo.pessoas.filter((v) => `${v.nome} ${v.apelidoReferencia || ''}`.toLocaleLowerCase('pt-BR').includes(termo)), usuarioCorresponde };
  }).filter((grupo) => !termo || grupo.usuarioCorresponde || grupo.pessoasVisiveis.length > 0);
  const semResponsavel = ativos.filter((v) => v.acompanhantes.length === 0);

  return <div className="space-y-6">
    <section><h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Quem acompanha quem</h2><p className="mt-2 max-w-3xl text-sm lg:text-base text-muted">Cada usuário aparece com as pessoas vinculadas ao seu acompanhamento. Uma pessoa pode aparecer na lista de mais de um usuário. O vínculo fixo de discipulado fica na aba Discipulado.</p></section>
    <div className="grid sm:grid-cols-3 gap-3">
      <Card className="p-5 border-l-4 border-l-brand"><span className="text-sm text-muted">Usuários com pessoas</span><strong className="block mt-2 text-3xl tabular">{grupos.filter((g) => g.pessoas.length > 0).length}</strong></Card>
      <Card className="p-5 border-l-4 border-l-info"><span className="text-sm text-muted">Pessoas acompanhadas</span><strong className="block mt-2 text-3xl tabular">{comAcompanhante}</strong></Card>
      <Card className="p-5 border-l-4 border-l-danger"><span className="text-sm text-muted">Sem acompanhante</span><strong className="block mt-2 text-3xl tabular">{semAcompanhante}</strong></Card>
    </div>
    <label className="relative block w-full sm:max-w-md 2xl:max-w-[650px]"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" /><input type="search" aria-label="Buscar usuário ou pessoa acompanhada" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar usuário ou pessoa acompanhada" className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-brand" /></label>
    {semResponsavel.length > 0 && !termo && <Card className="border-l-4 border-l-danger p-5"><h3 className="text-base font-bold text-danger">Sem acompanhante</h3><p className="mt-1 text-sm text-muted">Pessoas que ainda não aparecem na lista de nenhum usuário.</p><div className="mt-3 flex flex-wrap gap-2">{semResponsavel.map((v) => <Badge key={v.id} variant="danger" size="md">{v.nome}</Badge>)}</div></Card>}
    <div className="space-y-3">{gruposFiltrados.length === 0 ? <Card className="p-8 text-center text-sm text-muted">Nenhum usuário ou pessoa encontrado.</Card> : gruposFiltrados.map(({ usuario, pessoas, pessoasVisiveis }) => <Card key={usuario.id} className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2/50 px-4 sm:px-6 py-4"><div className="flex items-center gap-3 min-w-0"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand font-bold">{usuario.nome[0]}</span><div className="min-w-0"><h3 className="truncate text-base lg:text-lg font-bold">{usuario.nome}</h3><p className="text-xs sm:text-sm text-muted">{TIPO_USUARIO[usuario.tipoUsuario]}</p></div></div><Badge variant={pessoas.length ? 'brand' : 'neutral'} size="md">{pessoas.length} {pessoas.length === 1 ? 'pessoa' : 'pessoas'}</Badge></div>
      {pessoasVisiveis.length === 0 ? <p className="px-4 sm:px-6 py-5 text-sm text-muted">Nenhuma pessoa em acompanhamento.</p> : <div className="divide-y divide-border">{pessoasVisiveis.map((v) => <div key={v.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4"><div className="min-w-0"><strong className="block text-sm sm:text-base">{v.nome}</strong>{v.apelidoReferencia && <p className="mt-0.5 text-xs sm:text-sm text-muted truncate">{v.apelidoReferencia}</p>}</div><div className="flex flex-wrap items-center gap-3 sm:gap-5"><div className="text-xs sm:text-sm"><span className="text-subtle">Último contato: </span><strong>{v.ultimoContato ? tempoRelativo(v.ultimoContato) : 'sem registro'}</strong><span className="text-subtle"> · {v.ultimoContato ? formatarData(v.ultimoContato) : '—'}</span></div><Button size="sm" variant="outline" icon={<MessageCircle size={16} className="text-info" />} onClick={() => window.open(linkWhatsApp(v.telefone), '_blank', 'noopener,noreferrer')}>WhatsApp</Button></div></div>)}</div>}
    </Card>)}</div>
    <p className="flex items-start gap-2 text-sm text-muted"><UsersRound size={17} className="shrink-0 mt-0.5" /> A lista usa os vínculos de acompanhamento cadastrados. Registrar uma conversa atualiza o histórico da pessoa; não cria um vínculo automaticamente.</p>
  </div>;
};
