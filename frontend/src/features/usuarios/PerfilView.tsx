import React, { useEffect, useState } from 'react';
import { BookHeart, CheckCircle2, House, UsersRound } from 'lucide-react';
import { useApp } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { NAVEGACAO } from '@/config/navigation';
import { podeAcessar } from '@/config/permissions';
import { TIPO_USUARIO } from '@/config/labels';
import { formatarData, tempoRelativo } from '@/lib/format';
import { UsuarioForm } from './UsuarioForm';

export const PerfilView: React.FC = () => {
  const { currentUser, usuarios, visitantes, connects, atualizarUsuario } = useApp();
  const [salvo, setSalvo] = useState(false);
  useEffect(() => setSalvo(false), [currentUser.id]);
  const meusContatos = visitantes.filter((v) => v.isAtivo && v.userId === currentUser.id);
  const acompanhados = visitantes.filter((v) => v.isAtivo && v.acompanhantes.includes(currentUser.id));
  const meusConnects = connects.filter((c) => c.isAtivo && c.lideresIds.includes(currentUser.id));
  const areas = NAVEGACAO.filter((item) => item.area !== 'perfil' && podeAcessar(currentUser.tipoUsuario, item.area));

  return <div className="space-y-6">
    <section><h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Meu perfil</h2><p className="mt-2 text-sm lg:text-base text-muted">Confira seus dados e atualize seu nome, telefone e gênero.</p></section>
    <div className="grid xl:grid-cols-2 gap-5 2xl:gap-7 items-start">
      <Card className="p-5 sm:p-7 2xl:p-9">
        <div className="flex items-start gap-4 border-b border-border pb-5 mb-5"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand text-2xl font-bold">{currentUser.nome[0]}</span><div className="min-w-0"><h3 className="text-xl 2xl:text-2xl font-bold truncate">{currentUser.nome}</h3><div className="mt-2 flex flex-wrap gap-2"><Badge variant="brand" size="md">{TIPO_USUARIO[currentUser.tipoUsuario]}</Badge><Badge variant={currentUser.isAtivo ? 'info' : 'neutral'} size="md">{currentUser.isAtivo ? 'Conta ativa' : 'Conta inativa'}</Badge></div></div></div>
        <h3 className="text-lg font-bold mb-1">Dados pessoais</h3><p className="text-sm text-muted mb-5">Seu perfil de acesso é definido pela administração.</p>
        {salvo && <p role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-info/30 bg-info/10 px-4 py-3 text-sm font-semibold text-info"><CheckCircle2 size={17} /> Dados atualizados nesta demonstração.</p>}
        <UsuarioForm key={currentUser.id} usuario={currentUser} usuarios={usuarios} submitLabel="Salvar meus dados" onSave={(dados) => { atualizarUsuario(currentUser.id, { nome: dados.nome, telefone: dados.telefone, genero: dados.genero }); setSalvo(true); }} />
      </Card>
      <div className="space-y-5">
        <div className="grid sm:grid-cols-3 gap-3">
          <Card className="p-5"><UsersRound size={19} className="text-brand" /><span className="block mt-3 text-sm text-muted">Contatos cadastrados</span><strong className="block mt-1 text-3xl tabular">{meusContatos.length}</strong></Card>
          <Card className="p-5"><BookHeart size={19} className="text-warm" /><span className="block mt-3 text-sm text-muted">Em acompanhamento</span><strong className="block mt-1 text-3xl tabular">{acompanhados.length}</strong></Card>
          <Card className="p-5"><House size={19} className="text-info" /><span className="block mt-3 text-sm text-muted">Connects que lidero</span><strong className="block mt-1 text-3xl tabular">{meusConnects.length}</strong></Card>
        </div>
        <Card className="p-5 sm:p-7"><h3 className="text-lg font-bold">Minhas pessoas</h3><p className="mt-1 text-sm text-muted">Acompanhamentos vinculados ao seu usuário.</p>{acompanhados.length ? <div className="mt-4 divide-y divide-border">{acompanhados.map((v) => <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-3"><strong className="text-sm 2xl:text-base">{v.nome}</strong><span className="text-sm text-muted">{v.ultimoContato ? `${tempoRelativo(v.ultimoContato)} · ${formatarData(v.ultimoContato)}` : 'Sem contato registrado'}</span></div>)}</div> : <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted">Nenhuma pessoa vinculada ao seu acompanhamento.</p>}</Card>
        <Card className="p-5 sm:p-7"><h3 className="text-lg font-bold">Meu acesso</h3><p className="mt-1 text-sm text-muted">Áreas disponíveis para o seu perfil.</p><div className="mt-4 flex flex-wrap gap-2">{areas.map((item) => <Badge key={item.area} variant="neutral" size="md">{item.label}</Badge>)}</div>{meusConnects.length > 0 && <><h4 className="mt-5 text-sm font-bold">Connects que você lidera</h4><p className="mt-1 text-sm text-muted">{meusConnects.map((c) => c.nome).join(' · ')}</p></>}</Card>
      </div>
    </div>
  </div>;
};
