import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TIPO_USUARIO, opcoes } from '@/config/labels';
import { apenasDigitos, mascaraTelefone, normalizarTelefone } from '@/lib/format';
import type { Genero, TipoUsuario, Usuario } from '@/types';

export type DadosUsuario = Pick<Usuario, 'nome' | 'telefone' | 'genero' | 'tipoUsuario' | 'isAtivo'>;

interface UsuarioFormProps {
  usuario?: Usuario | null;
  usuarios: Usuario[];
  canEditAccess?: boolean;
  submitLabel: string;
  onSave: (dados: DadosUsuario) => void;
  onCancel?: () => void;
}

export const UsuarioForm: React.FC<UsuarioFormProps> = ({ usuario, usuarios, canEditAccess = false, submitLabel, onSave, onCancel }) => {
  const [nome, setNome] = useState(usuario?.nome || '');
  const [telefone, setTelefone] = useState(usuario?.telefone || '');
  const [genero, setGenero] = useState<Genero | null>(usuario?.genero || null);
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>(usuario?.tipoUsuario || 'lider_connect');
  const [isAtivo, setIsAtivo] = useState(usuario?.isAtivo ?? true);
  const [erro, setErro] = useState('');

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    const nomeLimpo = nome.trim();
    if (nomeLimpo.length < 5) { setErro('Informe o nome completo com pelo menos 5 caracteres.'); return; }

    const digitos = apenasDigitos(telefone);
    const numeroLocal = digitos.startsWith('55') && digitos.length >= 12 ? digitos.slice(2) : digitos;
    if (numeroLocal.length !== 10 && numeroLocal.length !== 11) { setErro('Informe um telefone brasileiro com DDD.'); return; }

    const telefoneNormalizado = normalizarTelefone(telefone);
    if (usuarios.some((u) => u.id !== usuario?.id && normalizarTelefone(u.telefone) === telefoneNormalizado)) {
      setErro('Este telefone já está vinculado a outro usuário.');
      return;
    }

    setErro('');
    onSave({ nome: nomeLimpo, telefone: telefoneNormalizado, genero, tipoUsuario: canEditAccess ? tipoUsuario : (usuario?.tipoUsuario || tipoUsuario), isAtivo: canEditAccess ? isAtivo : (usuario?.isAtivo ?? true) });
  };

  return <form onSubmit={salvar} className="space-y-5">
    {erro && <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2"><Input label="Nome completo *" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={100} required className="h-11 text-base" /></div>
      <Input label="Telefone / WhatsApp *" type="tel" value={mascaraTelefone(telefone)} onChange={(e) => setTelefone(e.target.value)} inputMode="tel" required className="h-11 text-base" />
      <Select label="Gênero" value={genero || ''} onChange={(e) => setGenero(e.target.value ? e.target.value as Genero : null)} options={[{ value: '', label: 'Não informado' }, { value: 'M', label: 'Masculino' }, { value: 'F', label: 'Feminino' }]} className="h-11 text-base" />
      {canEditAccess && <><Select label="Perfil de acesso" value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value as TipoUsuario)} options={opcoes(TIPO_USUARIO)} className="h-11 text-base" /><Select label="Situação da conta" value={isAtivo ? 'ativo' : 'inativo'} onChange={(e) => setIsAtivo(e.target.value === 'ativo')} options={[{ value: 'ativo', label: 'Ativa' }, { value: 'inativo', label: 'Inativa' }]} className="h-11 text-base" /></>}
    </div>
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">{onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>}<Button type="submit" className="min-h-11">{submitLabel}</Button></div>
  </form>;
};
