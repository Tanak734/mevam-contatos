import React, { useState } from 'react';
import { CheckCircle2, Pencil, Plus, Search, ShieldCheck, UsersRound } from 'lucide-react';
import { useApp } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TIPO_USUARIO } from '@/config/labels';
import { mascaraTelefone } from '@/lib/format';
import { UsuarioForm, type DadosUsuario } from './UsuarioForm';
import type { Usuario } from '@/types';

type Filtro = 'todos' | 'ativos' | 'inativos';

export const UsuariosView: React.FC = () => {
  const { usuarios, visitantes, currentUser, adicionarUsuario, atualizarUsuario } = useApp();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [emEdicao, setEmEdicao] = useState<Usuario | 'novo' | null>(null);
  const [mensagem, setMensagem] = useState('');
  const ativos = usuarios.filter((u) => u.isAtivo).length;
  const lista = usuarios.filter((u) => {
    if (filtro === 'ativos' && !u.isAtivo) return false;
    if (filtro === 'inativos' && u.isAtivo) return false;
    return `${u.nome} ${u.telefone} ${TIPO_USUARIO[u.tipoUsuario]}`.toLocaleLowerCase('pt-BR').includes(busca.trim().toLocaleLowerCase('pt-BR'));
  }).sort((a, b) => Number(b.isAtivo) - Number(a.isAtivo) || a.nome.localeCompare(b.nome, 'pt-BR'));

  const salvar = (dados: DadosUsuario) => {
    if (emEdicao === 'novo') {
      adicionarUsuario(dados);
      setMensagem('Usuário cadastrado nesta demonstração.');
    } else if (emEdicao) {
      atualizarUsuario(emEdicao.id, dados);
      setMensagem(`Dados de ${dados.nome} atualizados nesta demonstração.`);
    }
    setEmEdicao(null);
  };

  return <div className="space-y-6">
    <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"><div><h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Usuários</h2><p className="mt-2 text-sm lg:text-base text-muted">Consulte a equipe e edite dados, perfil de acesso e situação de cada conta.</p></div><Button onClick={() => setEmEdicao('novo')} icon={<Plus size={18} />} className="min-h-11">Novo usuário</Button></section>
    <div className="grid sm:grid-cols-3 gap-3">
      <Card className="p-5 border-l-4 border-l-brand"><UsersRound size={19} className="text-brand" /><span className="block mt-3 text-sm text-muted">Usuários cadastrados</span><strong className="block mt-1 text-3xl tabular">{usuarios.length}</strong></Card>
      <Card className="p-5 border-l-4 border-l-info"><CheckCircle2 size={19} className="text-info" /><span className="block mt-3 text-sm text-muted">Contas ativas</span><strong className="block mt-1 text-3xl tabular">{ativos}</strong></Card>
      <Card className="p-5 border-l-4 border-l-warm"><ShieldCheck size={19} className="text-warm" /><span className="block mt-3 text-sm text-muted">Administradores</span><strong className="block mt-1 text-3xl tabular">{usuarios.filter((u) => u.tipoUsuario === 'admin').length}</strong></Card>
    </div>
    {mensagem && <p role="status" className="rounded-xl border border-info/30 bg-info/10 px-4 py-3 text-sm font-semibold text-info">{mensagem}</p>}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"><div className="flex gap-2" role="group" aria-label="Filtrar usuários"><Button size="sm" variant={filtro === 'todos' ? 'primary' : 'outline'} onClick={() => setFiltro('todos')}>Todos</Button><Button size="sm" variant={filtro === 'ativos' ? 'primary' : 'outline'} onClick={() => setFiltro('ativos')}>Ativos</Button><Button size="sm" variant={filtro === 'inativos' ? 'primary' : 'outline'} onClick={() => setFiltro('inativos')}>Inativos</Button></div><label className="relative block w-full lg:w-96 2xl:w-[600px]"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" /><input type="search" aria-label="Buscar usuários" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, telefone ou cargo" className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-brand" /></label></div>
    <div className="space-y-3"><p className="text-sm text-subtle">{lista.length} usuários neste filtro</p>{lista.length === 0 ? <Card className="p-8 text-center text-sm text-muted">Nenhum usuário encontrado.</Card> : lista.map((u) => {
      const pessoas = visitantes.filter((v) => v.isAtivo && v.acompanhantes.includes(u.id)).length;
      return <Card key={u.id} className="p-4 sm:p-5 2xl:p-6"><div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center">
        <div className="flex items-center gap-3 min-w-0"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand text-lg font-bold">{u.nome[0]}</span><div className="min-w-0"><strong className="block text-base 2xl:text-lg truncate">{u.nome}</strong><span className="text-sm text-muted">{mascaraTelefone(u.telefone)}</span></div></div>
        <div><span className="block text-xs text-subtle mb-1">Perfil de acesso</span><Badge variant={u.tipoUsuario === 'admin' ? 'brand' : 'neutral'} size="md">{TIPO_USUARIO[u.tipoUsuario]}</Badge></div>
        <div><span className="block text-xs text-subtle mb-1">Situação e acompanhamento</span><span className="flex flex-wrap items-center gap-2"><Badge variant={u.isAtivo ? 'info' : 'neutral'} size="md">{u.isAtivo ? 'Ativo' : 'Inativo'}</Badge><span className="text-sm text-muted">{pessoas} {pessoas === 1 ? 'pessoa' : 'pessoas'}</span></span></div>
        <Button variant="outline" icon={<Pencil size={16} />} className="w-full md:w-auto min-h-11" onClick={() => setEmEdicao(u)}>Editar usuário</Button>
      </div></Card>;
    })}</div>
    <Modal isOpen={emEdicao !== null} onClose={() => setEmEdicao(null)} title={emEdicao === 'novo' ? 'Novo usuário' : `Editar ${emEdicao?.nome || 'usuário'}`} description={emEdicao === 'novo' ? 'Cadastre os dados e escolha o perfil de acesso.' : 'Atualize os dados e as permissões deste usuário.'} maxWidth="lg">
      {emEdicao && <UsuarioForm key={emEdicao === 'novo' ? 'novo' : emEdicao.id} usuario={emEdicao === 'novo' ? null : emEdicao} usuarios={usuarios} canEditAccess={emEdicao === 'novo' || emEdicao.id !== currentUser.id} submitLabel={emEdicao === 'novo' ? 'Cadastrar usuário' : 'Salvar alterações'} onSave={salvar} onCancel={() => setEmEdicao(null)} />}
      {emEdicao !== 'novo' && emEdicao?.id === currentUser.id && <p className="mt-3 text-xs text-muted">Para sua própria conta, altere o cargo e a situação por outro administrador. Seus dados pessoais também estão em Meu perfil.</p>}
    </Modal>
  </div>;
};
