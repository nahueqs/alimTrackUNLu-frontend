import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DetalleProduccionPage } from '@/pages/common/DetalleProduccion/DetalleProduccionPage';
import { usePublicService } from '@/services/public/usePublicService';
import { AppHeader } from '@/components/AppHeader/AppHeader.tsx';
import { useProductionWebSocket, type NotificationLevel } from '@/hooks/useProductionWebSocket';
import { ProductionStatusDisplay } from '@/components/ProductionStatusDisplay';
import { usePageTitle } from '@/hooks/usePageTitle.ts';
import { NotificationSelector } from '@/pages/common/DetalleProduccion/components/NotificationSelector';

const DetalleProduccionPublicPage: React.FC = () => {
  const { codigoProduccion } = useParams<{ codigoProduccion: string }>();
  
  usePageTitle(codigoProduccion ? `Producción ${codigoProduccion}` : 'Detalle de Producción');

  const [notificationLevel, setNotificationLevel] = useState<NotificationLevel>('ALL');

  const {
    loading,
    error,
    estructura,
    respuestas,
    getEstructuraProduccion,
    getUltimasRespuestasProduccion,
    updateFieldResponse,
    updateTableCellResponse,
    updateProductionState,
    updateProductionMetadata,
  } = usePublicService();

  useProductionWebSocket({
    codigoProduccion,
    estadoActual: respuestas,
    estructura,
    getUltimasRespuestas: getUltimasRespuestasProduccion,
    updateFieldResponse,
    updateTableCellResponse,
    updateProductionState,
    updateProductionMetadata,
    notificationLevel,
  });

  useEffect(() => {
    if (codigoProduccion) {
      Promise.all([
        getEstructuraProduccion(codigoProduccion),
        getUltimasRespuestasProduccion(codigoProduccion),
      ]);
    }
  }, [codigoProduccion, getEstructuraProduccion, getUltimasRespuestasProduccion]);

  return (
    <>
      <AppHeader title="AlimTrack UNLu" variant="public" />
      <ProductionStatusDisplay
        loading={loading && !respuestas}
        error={error}
        estructura={estructura}
        estadoActual={respuestas}
        redirectPath="/public/producciones"
        redirectLabel="Volver al Listado Público"
      >
        <div className="production-detail-container">
          <NotificationSelector
            value={notificationLevel}
            onChange={setNotificationLevel}
            className="notification-selector-wrapper"
          />

          <div className="public-readonly">
            <DetalleProduccionPage
              estructura={estructura!}
              respuestas={respuestas!}
              isEditable={false}
              HeaderComponent={() => null}
            />
          </div>
        </div>
      </ProductionStatusDisplay>
    </>
  );
};

export default DetalleProduccionPublicPage;
