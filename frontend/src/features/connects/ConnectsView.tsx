import React, { useState } from 'react';
import {
  MapPin,
  MessageCircle,
  Plus,
  Navigation,
  Edit2,
  Users,
} from 'lucide-react';
import { useApp } from '@/store/appStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ModalConviteConnect } from './ModalConviteConnect';
import { ModalNovoConnect } from './ModalNovoConnect';
import { linkMapsConnect } from '@/lib/links';
import { podeGerenciarConnects } from '@/config/permissions';
import { formatarListaNomes } from '@/lib/format';
import type { Connect } from '@/types';

export const ConnectsView: React.FC = () => {
  const { connects, getUsuario, currentUser } = useApp();

  const [connectParaConvite, setConnectParaConvite] = useState<Connect | null>(null);
  const [connectParaEditar, setConnectParaEditar] = useState<Connect | null>(null);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);

  const connectsFiltrados = connects.filter((c) => c.isAtivo);

  const abrirConvite = (c: Connect) => setConnectParaConvite(c);

  const abrirEdicao = (c: Connect) => {
    setConnectParaEditar(c);
    setModalNovoAberto(true);
  };

  const abrirNovo = () => {
    setConnectParaEditar(null);
    setModalNovoAberto(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div><p className="text-xs uppercase tracking-[0.18em] font-bold text-info">Comunidade pelo bairro</p><h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">Encontre um lugar para pertencer.</h2><p className="mt-2 text-base text-muted">Endereços, lideranças e convites prontos para compartilhar.</p></div>
        <span className="text-sm text-muted">{connectsFiltrados.length} Connects disponíveis</span>
      </div>
      <div className="flex justify-end">
        {podeGerenciarConnects(currentUser.tipoUsuario) && (
          <Button onClick={abrirNovo} size="sm" icon={<Plus size={15} />}>
            Novo Connect
          </Button>
        )}
      </div>

      {/* Grid de Cards Simplificados */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {connectsFiltrados.map((c) => {
          const lideres = c.lideresIds.map((id) => getUsuario(id)).filter(Boolean);
          const mapsUrl = linkMapsConnect(c);

          return (
            <Card
              key={c.id}
              className="p-5 2xl:p-7 flex flex-col justify-between space-y-5 bg-surface border-t-2 border-t-info hover:border-info/60 transition-colors"
            >
              <div className="space-y-2">
                {/* Encontro por data específica no convite */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg 2xl:text-xl text-foreground">{c.nome}</h3>
                    <span className="text-sm text-info font-semibold">Data e horário no convite</span>
                  </div>
                  {podeGerenciarConnects(currentUser.tipoUsuario) && (
                    <button
                      onClick={() => abrirEdicao(c)}
                      className="p-1 rounded text-subtle hover:text-foreground transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={13} />
                    </button>
                  )}
                </div>

                {/* Endereço */}
                <div className="text-sm text-muted space-y-0.5">
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <MapPin size={13} className="text-info shrink-0" />
                    <span>{c.bairro}, {c.cidade}</span>
                  </div>
                  <p className="text-sm text-subtle pl-4.5">
                    {c.rua}, {c.numero}{c.complemento ? ` (${c.complemento})` : ''}
                  </p>
                </div>

                {/* Líderes */}
                <div className="text-sm text-subtle flex items-center gap-1.5 pt-1">
                  <Users size={12} className="text-muted shrink-0" />
                  <span className="truncate">
                    {lideres.length > 0
                      ? formatarListaNomes(lideres.map((l) => l?.nome).filter((n): n is string => Boolean(n)))
                      : 'Sem líder definido'}
                  </span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-2 border-t border-border flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Navigation size={13} className="text-info" />}
                  className="flex-1 text-sm min-h-11"
                  onClick={() => window.open(mapsUrl, '_blank')}
                >
                  Ver no Maps
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  icon={<MessageCircle size={14} />}
                  className="flex-1 text-sm min-h-11"
                  onClick={() => abrirConvite(c)}
                >
                  Convite
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modais */}
      <ModalConviteConnect
        isOpen={Boolean(connectParaConvite)}
        onClose={() => setConnectParaConvite(null)}
        connect={connectParaConvite}
      />

      <ModalNovoConnect
        isOpen={modalNovoAberto}
        onClose={() => {
          setModalNovoAberto(false);
          setConnectParaEditar(null);
        }}
        connectParaEditar={connectParaEditar}
      />
    </div>
  );
};
