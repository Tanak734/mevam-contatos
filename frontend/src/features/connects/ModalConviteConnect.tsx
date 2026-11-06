import React, { useMemo, useState } from 'react';
import { Copy, Check, MessageCircle, MapPin } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/store/appStore';
import { linkMapsConnect, linkCompartilharWhatsApp, copiarTexto, enderecoConnect } from '@/lib/links';
import { gerarTextoConvite, proximaData, OBSERVACAO_PADRAO } from '@/lib/convite';
import { formatarListaNomes } from '@/lib/format';
import type { Connect } from '@/types';

interface ModalConviteConnectProps {
  isOpen: boolean;
  onClose: () => void;
  connect: Connect | null;
}

export const ModalConviteConnect: React.FC<ModalConviteConnectProps> = ({
  isOpen,
  onClose,
  connect,
}) => {
  const { getUsuario } = useApp();

  const [nomeConvidado, setNomeConvidado] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('20:00');
  const [observacao, setObservacao] = useState(OBSERVACAO_PADRAO);
  const [copiado, setCopiado] = useState(false);

  // Initialize data with next occurrence of cell day
  React.useEffect(() => {
    if (connect) {
      setData(proximaData('sabado'));
      setNomeConvidado('');
      setHorario('20:00');
      setObservacao(OBSERVACAO_PADRAO);
      setCopiado(false);
    }
  }, [connect]);

  // Compute leaders string (supports N leaders)
  const lideresNomes = useMemo(() => {
    if (!connect) return '';
    const nomes = connect.lideresIds
      .map((id) => getUsuario(id)?.nome)
      .filter((n): n is string => Boolean(n));
    return formatarListaNomes(nomes);
  }, [connect, getUsuario]);

  const mapsUrl = useMemo(() => {
    if (!connect) return '';
    return linkMapsConnect(connect);
  }, [connect]);

  const localFormatado = useMemo(() => {
    if (!connect) return '';
    return enderecoConnect(connect);
  }, [connect]);

  const textoFinal = useMemo(() => {
    if (!connect) return '';
    return gerarTextoConvite({
      nomeConnect: connect.nome,
      nomeConvidado: nomeConvidado.trim() || undefined,
      data: data || proximaData('sabado'),
      horario,
      local: localFormatado,
      linkMaps: mapsUrl,
      lideres: lideresNomes || undefined,
      observacao: observacao.trim() || undefined,
    });
  }, [connect, nomeConvidado, data, horario, localFormatado, mapsUrl, lideresNomes, observacao]);

  if (!connect) return null;

  const handleCopiar = async () => {
    const ok = await copiarTexto(textoFinal);
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  const handleAbrirWhatsApp = () => {
    window.open(linkCompartilharWhatsApp(textoFinal), '_blank');
  };

  const handleAbrirMaps = () => {
    window.open(mapsUrl, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Convite • ${connect.nome}`}
      description="Confira a data e o horário antes de compartilhar no WhatsApp."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Formulário de Ajustes Rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-2/60 border border-border">
          <Input
            label="Nome do Convidado (Opcional)"
            placeholder="Ex: Carlos"
            value={nomeConvidado}
            onChange={(e) => setNomeConvidado(e.target.value)}
          />

          <Input
            type="time"
            label="Horário do Connect"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
          />

          <Input
            type="date"
            label="Data do Encontro"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />

          <div className="flex flex-col gap-1.5 justify-end">
            <label className="text-xs font-medium text-muted">Localização no Google Maps</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<MapPin size={14} className="text-brand" />}
              onClick={handleAbrirMaps}
              className="w-full text-xs"
            >
              Testar / Ver no Maps
            </Button>
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Frase de Fechamento / Observação"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>
        </div>

        {/* Live Preview estilo WhatsApp */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <MessageCircle size={14} className="text-brand" /> Pré-visualização da Mensagem (WhatsApp)
            </span>
            <span className="hidden sm:inline text-xs text-subtle">com link do Maps incluso</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-[#101b18] text-[#f1f3ee] font-sans text-sm sm:text-[15px] border border-[#294139] whitespace-pre-wrap leading-7 selection:bg-brand/40">
            {textoFinal}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            icon={<MapPin size={15} className="text-brand" />}
            onClick={handleAbrirMaps}
          >
            Abrir Pin no Maps
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              icon={copiado ? <Check size={16} className="text-brand" /> : <Copy size={16} />}
              onClick={handleCopiar}
            >
              {copiado ? 'Texto Copiado!' : 'Copiar Texto'}
            </Button>

            <Button
              type="button"
              variant="primary"
              icon={<MessageCircle size={16} />}
              onClick={handleAbrirWhatsApp}
            >
              Enviar pelo WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
