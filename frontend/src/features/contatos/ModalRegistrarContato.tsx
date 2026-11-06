import React, { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Tag } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/store/appStore';
import { calcularTermometro } from '@/lib/termometro';
import type { Visitante } from '@/types';

interface ModalRegistrarContatoProps {
  isOpen: boolean;
  onClose: () => void;
  visitante: Visitante | null;
}

export const ModalRegistrarContato: React.FC<ModalRegistrarContatoProps> = ({
  isOpen,
  onClose,
  visitante,
}) => {
  const { registrarContato } = useApp();

  const [dataContato, setDataContato] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [observacaoContato, setObservacaoContato] = useState('');
  const [apelidoReferencia, setApelidoReferencia] = useState('');
  const [observacaoPessoa, setObservacaoPessoa] = useState('');
  const [mostrarCamposExtras, setMostrarCamposExtras] = useState(false);

  // Sync initial state when visitor changes
  React.useEffect(() => {
    if (visitante) {
      setDataContato(format(new Date(), 'yyyy-MM-dd'));
      setObservacaoContato('');
      setApelidoReferencia(visitante.apelidoReferencia || '');
      setObservacaoPessoa(visitante.observacaoPessoa || '');
      setMostrarCamposExtras(false);
    }
  }, [visitante]);

  if (!visitante) return null;

  const term = calcularTermometro(visitante);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    registrarContato({
      visitanteId: visitante.id,
      dataContato,
      observacaoContato: observacaoContato.trim() || null,
      apelidoReferencia: apelidoReferencia.trim() || undefined,
      observacaoPessoa: observacaoPessoa.trim() || undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar contato"
      description={`Anote a conversa com ${visitante.nome}. A data do último contato será atualizada.`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info card */}
        <div className="p-3 rounded-lg bg-surface-2 border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div>
            <div className="font-semibold text-foreground">{visitante.nome}</div>
            <div className="text-muted">
              {visitante.apelidoReferencia ? `"${visitante.apelidoReferencia}"` : 'Sem referência visual cadastrada'}
            </div>
          </div>
          <div className="sm:text-right">
            <span className="font-mono text-subtle text-[11px]">
              {term.semRegistro ? 'Nunca contatado' : `Último contato há ${term.dias} dias`}
            </span>
          </div>
        </div>

        <Input
          type="date"
          label="Data do Contato *"
          value={dataContato}
          onChange={(e) => setDataContato(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted">Resumo do Contato / Próximos Passos</label>
          <textarea
            className="w-full h-24 p-2.5 text-sm bg-surface-2 border border-border rounded-lg text-foreground focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none"
            placeholder="Ex: Mandei mensagem no WhatsApp convidando para o Connect. Ele confirmou presença..."
            value={observacaoContato}
            onChange={(e) => setObservacaoContato(e.target.value)}
          />
        </div>

        {/* Toggle para atualizar referência ou observação da pessoa */}
        <div>
          <button
            type="button"
            onClick={() => setMostrarCamposExtras(!mostrarCamposExtras)}
            className="text-xs text-brand hover:underline flex items-center gap-1 font-medium"
          >
            <Tag size={12} />
            {mostrarCamposExtras ? 'Ocultar campos da pessoa' : 'Atualizar referência visual / observação da pessoa'}
          </button>
        </div>

        {mostrarCamposExtras && (
          <div className="space-y-3 p-3 rounded-lg bg-surface-2/40 border border-border animate-fade-in">
            <Input
              label="Referência Visual / Apelido"
              placeholder="Ex: Carlos da Mecânica, amigo do João"
              value={apelidoReferencia}
              onChange={(e) => setApelidoReferencia(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Observação Pessoal Geral</label>
              <textarea
                className="w-full h-16 p-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-brand resize-none"
                value={observacaoPessoa}
                onChange={(e) => setObservacaoPessoa(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" icon={<CheckCircle2 size={16} />}>
            Salvar Contato
          </Button>
        </div>
      </form>
    </Modal>
  );
};
