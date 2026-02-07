import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader/AppHeader.tsx';
import { CustomTable } from '@/components/ui/CustomTable/CustomTable.tsx';
import { getPublicProductionColumns } from './ListadoProduccionesColumns.tsx';
import type { ProduccionPublicMetadataDTO } from '@/types/production';
import { usePublicService } from '@/services/public/usePublicService.ts';
import { useIsMobile } from '@/hooks/useIsMobile.ts';
import './ListadoProducciones.css';
import { notificationService } from '@/services/notificaciones/notificationService.ts';
import { usePageTitle } from '@/hooks/usePageTitle.ts';
import { Button } from '@/components/ui';
import { ArrowLeftIcon } from 'lucide-react';

export const ListadoProducciones: React.FC = () => {
  usePageTitle('Producciones');
  const {
    producciones,
    loading,
    error,
    getProduccionesPublicas,
    updateProductionStateInList,
  } = usePublicService();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getProduccionesPublicas();
  }, [getProduccionesPublicas]);

  // Suscripción a WebSockets para actualizaciones en tiempo real
  useEffect(() => {
    let unsubscribeState: (() => void) | undefined;
    let unsubscribeCreated: (() => void) | undefined;
    let unsubscribeDeleted: (() => void) | undefined;

    const connectAndSubscribe = () => {
      notificationService.connect(() => {
        // Suscribirse a cambios de estado globales
        unsubscribeState = notificationService.subscribeToProductionStateChanges((message) => {
          if (message.type === 'STATE_CHANGED') {
            updateProductionStateInList(message.codigoProduccion, {
              ...message.payload,
              timestamp: message.timestamp,
            });
          }
        });

        // Suscribirse a nuevas producciones creadas
        unsubscribeCreated = notificationService.subscribeToProductionCreated((message) => {
          // Cuando se crea una producción, recargamos la lista completa para simplificar
          // Podríamos optimizar agregando solo la nueva, pero requeriría mapear el payload al DTO completo
          if (message.type === 'PRODUCTION_METADATA_CREATED') {
            getProduccionesPublicas();
          }
        });

        // Suscribirse a producciones eliminadas
        unsubscribeDeleted = notificationService.subscribeToProduccionEliminada((message) => {
          if (message.type === 'PRODUCTION_DELETED') {
            // Recargar la lista cuando se elimina una producción
            getProduccionesPublicas();
          }
        });
      });
    };

    connectAndSubscribe();

    return () => {
      if (unsubscribeState) unsubscribeState();
      if (unsubscribeCreated) unsubscribeCreated();
      if (unsubscribeDeleted) unsubscribeDeleted();
      notificationService.disconnect();
    };
  }, [updateProductionStateInList, getProduccionesPublicas]);

  const handleView = (record: ProduccionPublicMetadataDTO) => {
    navigate(`/public/producciones/ver/${record.codigoProduccion}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleBack = () => {
    navigate('/'); // O a donde corresponda volver desde la vista pública
  };

  const filteredProducciones = producciones
    .filter(
      (p) =>
        p.codigoProduccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.lote && p.lote.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime());

  const columns = getPublicProductionColumns({
    onView: handleView,
    isMobile,
  });

  return (
    <div className="public-layout">
      <AppHeader title="AlimTrack" variant="public" />
      <main className="public-main container">
        <div className="public-list-header">
          <div style={{ marginBottom: '1rem', width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
             <Button icon={<ArrowLeftIcon />} onClick={handleBack} variant={'secondary'}>
                Volver al Inicio
             </Button>
          </div>
          <h1 className="public-list-title">Producciones - CIDETA UNLu</h1>
          <p className="public-list-subtitle">
            Consulte el estado y avance de las producciones de la planta.
          </p>
        </div>

        <div className="public-search-container">
          <input
            type="text"
            className="public-search-input"
            placeholder="Buscar por código o lote..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="public-list-content">
          <CustomTable
            columns={columns}
            dataSource={filteredProducciones}
            loading={loading}
            rowKey="codigoProduccion"
            locale={{
              emptyText: error
                ? 'Error al cargar las producciones'
                : 'No se encontraron producciones',
            }}
          />
        </div>
      </main>
    </div>
  );
};
