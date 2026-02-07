import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DetalleProduccionPage } from '@/pages/common/DetalleProduccion/DetalleProduccionPage';
import { AppHeader } from '@/components/AppHeader/AppHeader.tsx';
import { ProductionStatusDisplay } from '@/components/ProductionStatusDisplay';
import { usePageTitle } from '@/hooks/usePageTitle.ts';
import { NotificationSelector } from '@/pages/common/DetalleProduccion/components/NotificationSelector';
import { usePublicProductionData } from '@/hooks/usePublicProductionData';
import { PrintButton } from '@/components/common/PrintButton';
import { notificationService } from '@/services/notificaciones/notificationService';
import { message } from 'antd';

const DetalleProduccionPublicPage: React.FC = () => {
  const { codigoProduccion } = useParams<{ codigoProduccion: string }>();
  const navigate = useNavigate();
  
  usePageTitle(codigoProduccion ? `Producción ${codigoProduccion}` : 'Detalle de Producción');

  const {
    loading,
    error,
    estructura,
    respuestas,
    notificationLevel,
    setNotificationLevel,
  } = usePublicProductionData(codigoProduccion);

  // Efecto para manejar la eliminación de la producción vía WebSocket
  useEffect(() => {
    if (!codigoProduccion) return;

    const unsubscribe = notificationService.subscribeToProduccionEliminada((msg) => {
      if (msg.payload.codigoProduccion === codigoProduccion) {
        message.warning('La producción que estabas visualizando ha sido eliminada.');
        navigate('/public/producciones');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [codigoProduccion, navigate]);

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', marginBottom: '8px' }}>
            <PrintButton estructura={estructura} respuestas={respuestas} />
            <NotificationSelector
              value={notificationLevel}
              onChange={setNotificationLevel}
              className=""
            />
          </div>

          <div className="public-readonly">
            <DetalleProduccionPage
              estructura={estructura!}
              respuestas={respuestas!}
              isEditable={false}
            />
          </div>
        </div>
      </ProductionStatusDisplay>
    </>
  );
};

export default DetalleProduccionPublicPage;
