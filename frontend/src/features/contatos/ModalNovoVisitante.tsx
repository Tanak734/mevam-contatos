import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/store/appStore';
import {
  COMO_CONHECEU,
  ESTADO_CIVIL,
  STATUS_MEMBRO,
  STATUS_PESSOA,
  opcoes,
} from '@/config/labels';
import { apenasDigitos, mascaraTelefone } from '@/lib/format';
import type { ComoConheceu, EstadoCivil, Genero, StatusMembro, StatusPessoa, Visitante } from '@/types';

interface ModalNovoVisitanteProps {
  isOpen: boolean;
  onClose: () => void;
  visitanteParaEditar?: Visitante | null;
}

export const ModalNovoVisitante: React.FC<ModalNovoVisitanteProps> = ({ isOpen, onClose, visitanteParaEditar }) => {
  const { currentUser, connects, usuarios, adicionarVisitante, atualizarVisitante } = useApp();

  const [nome, setNome] = useState('');
  const [apelidoReferencia, setApelidoReferencia] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cidadeMora, setCidadeMora] = useState('Paulínia');
  const [bairro, setBairro] = useState('');
  const [genero, setGenero] = useState<Genero>('M');
  const [estadoCivil, setEstadoCivil] = useState<EstadoCivil>('solteiro');
  const [statusMembro, setStatusMembro] = useState<StatusMembro>('nao_membro');
  const [statusPessoa, setStatusPessoa] = useState<StatusPessoa | ''>('novo_convertido');
  const [comoConheceu, setComoConheceu] = useState<ComoConheceu>('convite_pessoa');
  const [connectId, setConnectId] = useState<string>('');
  const [discipuladorId, setDiscipuladorId] = useState<string>('');
  const [observacaoPessoa, setObservacaoPessoa] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setNome(visitanteParaEditar?.nome || '');
    setApelidoReferencia(visitanteParaEditar?.apelidoReferencia || '');
    setTelefone(visitanteParaEditar?.telefone || '');
    setDataNascimento(visitanteParaEditar?.dataNascimento || '');
    setCidadeMora(visitanteParaEditar?.cidadeMora || 'Paulínia');
    setBairro(visitanteParaEditar?.bairro || '');
    setGenero(visitanteParaEditar?.genero || 'M');
    setEstadoCivil(visitanteParaEditar?.estadoCivil || 'solteiro');
    setStatusMembro(visitanteParaEditar?.statusMembro || 'nao_membro');
    setStatusPessoa(visitanteParaEditar?.statusPessoa || '');
    setComoConheceu(visitanteParaEditar?.comoConheceu || 'convite_pessoa');
    setConnectId(visitanteParaEditar?.connectId || '');
    setDiscipuladorId(visitanteParaEditar?.discipuladorId || '');
    setObservacaoPessoa(visitanteParaEditar?.observacaoPessoa || '');
    setErro('');
  }, [isOpen, visitanteParaEditar]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErro('Informe o nome da pessoa.');
      return;
    }
    const cleanTel = apenasDigitos(telefone);
    if (!cleanTel || cleanTel.length < 10) {
      setErro('Informe um telefone válido com DDD (mínimo 10 dígitos).');
      return;
    }

    const dados = {
      userId: currentUser.id,
      nome: nome.trim(),
      apelidoReferencia: apelidoReferencia.trim() || null,
      telefone: cleanTel,
      dataNascimento: dataNascimento || null,
      genero,
      estadoCivil,
      cidadeMora: cidadeMora.trim() || 'Paulínia',
      bairro: bairro.trim() || null,
      statusMembro,
      statusPessoa: statusPessoa ? (statusPessoa as StatusPessoa) : null,
      comoConheceu,
      outroMeioConhecer: null,
      connectId: connectId || null,
      discipuladorId: discipuladorId || null,
      observacaoPessoa: observacaoPessoa.trim() || null,
      ultimoContato: null,
      isAtivo: true,
    };
    if (visitanteParaEditar) {
      const { userId: _userId, ultimoContato: _ultimoContato, isAtivo: _isAtivo, ...alteracoes } = dados;
      atualizarVisitante(visitanteParaEditar.id, alteracoes);
    } else {
      adicionarVisitante(dados);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={visitanteParaEditar ? 'Editar cadastro' : 'Cadastrar novo visitante'}
      description={visitanteParaEditar ? `Complete ou atualize as informações de ${visitanteParaEditar.nome}.` : 'Preencha os dados da pessoa para acompanhamento e direcionamento ao Connect.'}
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
              label="Nome Completo *"
              placeholder="Ex: Carlos Eduardo Ferreira"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErro('');
              }}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Referência Visual / Apelido"
              hint="Crucial para lembrar: ex. 'Carlos da Mecânica', 'amigo do Pedro do louvor'"
              placeholder="Ex: Camisa preta com o João, trabalha na Bosch"
              value={apelidoReferencia}
              onChange={(e) => setApelidoReferencia(e.target.value)}
            />
          </div>

          <Input
            label="Telefone / WhatsApp *"
            placeholder="(19) 99999-9999"
            value={mascaraTelefone(telefone)}
            onChange={(e) => setTelefone(e.target.value)}
            required
          />

          <Input
            type="date"
            label="Data de nascimento"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
          />

          <Select
            label="Gênero"
            value={genero}
            onChange={(e) => setGenero(e.target.value as Genero)}
            options={[
              { value: 'M', label: 'Masculino' },
              { value: 'F', label: 'Feminino' },
            ]}
          />

          <Input
            label="Bairro"
            placeholder="Ex: Betel, Morumbi, Centro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
          />

          <Input
            label="Cidade"
            value={cidadeMora}
            onChange={(e) => setCidadeMora(e.target.value)}
          />

          <Select
            label="Estado Civil"
            value={estadoCivil}
            onChange={(e) => setEstadoCivil(e.target.value as EstadoCivil)}
            options={opcoes(ESTADO_CIVIL)}
          />

          <Select
            label="Membresia"
            value={statusMembro}
            onChange={(e) => setStatusMembro(e.target.value as StatusMembro)}
            options={opcoes(STATUS_MEMBRO)}
          />

          <Select
            label="Momento / Status da Pessoa"
            value={statusPessoa}
            onChange={(e) => setStatusPessoa(e.target.value as StatusPessoa)}
            options={[{ value: '', label: 'Não informado' }, ...opcoes(STATUS_PESSOA)]}
          />

          <Select
            label="Como Conheceu a Igreja"
            value={comoConheceu}
            onChange={(e) => setComoConheceu(e.target.value as ComoConheceu)}
            options={opcoes(COMO_CONHECEU)}
          />

          <Select
            label="Encaminhar para Connect"
            value={connectId}
            onChange={(e) => setConnectId(e.target.value)}
            options={[
              { value: '', label: 'Nenhum / Definir depois' },
              ...connects.map((c) => ({ value: c.id, label: `${c.nome} (${c.bairro})` })),
            ]}
          />

          <Select
            label="Designar Discipulador(a)"
            value={discipuladorId}
            onChange={(e) => setDiscipuladorId(e.target.value)}
            options={[
              { value: '', label: 'Sem discipulador no momento' },
              ...usuarios.map((u) => ({ value: u.id, label: u.nome })),
            ]}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted">Observação Pastoral / Detalhes</label>
          <textarea
            className="w-full h-20 p-2.5 text-sm bg-surface-2 border border-border rounded-lg text-foreground focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none"
            placeholder="Informações relevantes sobre a visita, necessidades, motivos de oração gerais..."
            value={observacaoPessoa}
            onChange={(e) => setObservacaoPessoa(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {visitanteParaEditar ? 'Salvar alterações' : 'Salvar cadastro'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
