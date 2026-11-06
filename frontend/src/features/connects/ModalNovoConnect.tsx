import React, { useState } from 'react';
import { X, Users, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/store/appStore';
import { RESIDENCIA, TIPO_USUARIO, opcoes } from '@/config/labels';
import type { Connect, Residencia } from '@/types';

interface ModalNovoConnectProps {
  isOpen: boolean;
  onClose: () => void;
  connectParaEditar?: Connect | null;
}

export const ModalNovoConnect: React.FC<ModalNovoConnectProps> = ({
  isOpen,
  onClose,
  connectParaEditar,
}) => {
  const { usuarios, adicionarConnect, atualizarConnect } = useApp();

  const [nome, setNome] = useState('');
  const [tipoResidencia, setTipoResidencia] = useState<Residencia>('casa');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('Paulínia');
  const [complemento, setComplemento] = useState('');
  const [cep, setCep] = useState('');
  const [linkMaps, setLinkMaps] = useState('');
  const [lideresIds, setLideresIds] = useState<string[]>([]);
  const [supervisorId, setSupervisorId] = useState('');
  const [erro, setErro] = useState('');

  React.useEffect(() => {
    if (connectParaEditar) {
      setNome(connectParaEditar.nome);
      setTipoResidencia(connectParaEditar.tipoResidencia);
      setRua(connectParaEditar.rua);
      setNumero(connectParaEditar.numero);
      setBairro(connectParaEditar.bairro);
      setCidade(connectParaEditar.cidade);
      setComplemento(connectParaEditar.complemento || '');
      setCep(connectParaEditar.cep || '');
      setLinkMaps(connectParaEditar.linkMaps || '');
      setLideresIds(connectParaEditar.lideresIds || []);
      setSupervisorId(connectParaEditar.supervisorId || '');
    } else {
      setNome('');
      setTipoResidencia('casa');
      setRua('');
      setNumero('');
      setBairro('');
      setCidade('Paulínia');
      setComplemento('');
      setCep('');
      setLinkMaps('');
      setLideresIds([]);
      setSupervisorId('');
    }
    setErro('');
  }, [connectParaEditar, isOpen]);

  const handleAdicionarLider = (userId: string) => {
    if (!userId) return;
    if (!lideresIds.includes(userId)) {
      setLideresIds([...lideresIds, userId]);
    }
  };

  const handleRemoverLider = (userId: string) => {
    setLideresIds(lideresIds.filter((id) => id !== userId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErro('Informe o nome do Connect.');
      return;
    }
    if (!rua.trim() || !numero.trim() || !bairro.trim()) {
      setErro('Preencha os campos de endereço obrigatórios (Rua, Número e Bairro).');
      return;
    }

    if (connectParaEditar) {
      atualizarConnect(connectParaEditar.id, {
        nome: nome.trim(),
        diaSemana: connectParaEditar.diaSemana || 'sabado',
        tipoResidencia,
        rua: rua.trim(),
        numero: numero.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim() || 'Paulínia',
        complemento: complemento.trim() || null,
        cep: cep.trim() || null,
        linkMaps: linkMaps.trim() || null,
        lideresIds,
        supervisorId: supervisorId || null,
      });
    } else {
      adicionarConnect({
        nome: nome.trim(),
        diaSemana: 'sabado',
        tipoResidencia,
        rua: rua.trim(),
        numero: numero.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim() || 'Paulínia',
        complemento: complemento.trim() || null,
        cep: cep.trim() || null,
        linkMaps: linkMaps.trim() || null,
        lideresIds,
        supervisorId: supervisorId || null,
        isAtivo: true,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={connectParaEditar ? 'Editar Connect' : 'Cadastrar Novo Connect'}
      description="Configure o grupo, as lideranças e o endereço. A data específica é confirmada ao criar o convite."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {erro && (
          <div className="p-3 text-xs bg-danger/10 text-danger border border-danger/20 rounded-lg">
            {erro}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Nome do Connect *"
              placeholder="Ex: Connect Betel, Connect Morumbi Jovem"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <Select
            label="Tipo de Residência"
            value={tipoResidencia}
            onChange={(e) => setTipoResidencia(e.target.value as Residencia)}
            options={opcoes(RESIDENCIA)}
          />

          <div className="sm:col-span-2">
            <Input
              label="Rua / Logradouro *"
              placeholder="Ex: Rua das Palmeiras"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              required
            />
          </div>

          <Input
            label="Número *"
            placeholder="Ex: 142"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            required
          />

          <Input
            label="Complemento"
            placeholder="Ex: Bloco B, Apto 12"
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
          />

          <Input
            label="Bairro *"
            placeholder="Ex: Betel"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            required
          />

          <Input
            label="Cidade *"
            placeholder="Paulínia"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            required
          />

          <div className="sm:col-span-2">
            <Input
              label="Link Pin no Google Maps"
              placeholder="Ex: https://maps.app.goo.gl/... ou link com coordenadas"
              hint="Se deixar em branco, geraremos o link automaticamente a partir do endereço."
              value={linkMaps}
              onChange={(e) => setLinkMaps(e.target.value)}
            />
          </div>

          {/* Gerenciamento dinâmico de N Líderes */}
          <div className="sm:col-span-2 space-y-2 p-3 rounded-xl bg-surface-2/40 border border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Users size={14} className="text-brand" />
                Líderes do Connect ({lideresIds.length} adicionado{lideresIds.length === 1 ? '' : 's'})
              </label>
              <span className="text-[11px] text-subtle">
                Adicione quantos líderes forem necessários
              </span>
            </div>

            {/* Tags / Cards dos líderes já selecionados */}
            {lideresIds.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {lideresIds.map((id) => {
                  const user = usuarios.find((u) => u.id === id);
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface text-foreground border border-border text-xs shadow-xs"
                    >
                      <span className="font-medium">{user?.nome || 'Líder'}</span>
                      {user && (
                        <span className="text-[10px] font-mono text-muted">
                          ({TIPO_USUARIO[user.tipoUsuario]})
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoverLider(id)}
                        className="p-0.5 rounded hover:bg-surface-2 text-subtle hover:text-danger ml-0.5 transition-colors"
                        title="Remover líder deste Connect"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-surface/50 border border-border border-dashed text-center text-xs text-subtle">
                Nenhum líder adicionado ainda. Escolha no seletor abaixo para vincular líderes.
              </div>
            )}

            {/* Seletor para adicionar mais líderes à lista */}
            <div className="pt-1">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleAdicionarLider(e.target.value);
                  }
                }}
                className="w-full h-9 px-3 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="">+ Selecionar e adicionar líder à célula...</option>
                {usuarios
                  .filter((u) => !lideresIds.includes(u.id))
                  .map((u) => (
                    <option key={u.id} value={u.id} className="bg-surface text-foreground">
                      {u.nome} ({TIPO_USUARIO[u.tipoUsuario]})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Supervisor */}
          <div className="sm:col-span-2">
            <Select
              label="Supervisor do Connect"
              value={supervisorId}
              onChange={(e) => setSupervisorId(e.target.value)}
              options={[
                { value: '', label: 'Selecione um supervisor/presbítero...' },
                ...usuarios.map((u) => ({ value: u.id, label: `${u.nome} (${TIPO_USUARIO[u.tipoUsuario]})` })),
              ]}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {connectParaEditar ? 'Salvar Alterações' : 'Criar Connect'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
