import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DetalleProduccionPage } from '@/pages/common/DetalleProduccion/DetalleProduccionPage';
import { AppHeader } from '@/components/AppHeader/AppHeader.tsx';
import { useProductionData } from '@/hooks/useProductionData';
import { useProductionWebSocket, type NotificationLevel } from '@/hooks/useProductionWebSocket';
import { useProductionActions } from '@/hooks/useProductionActions';
import { ProductionStatusDisplay } from '@/components/ProductionStatusDisplay';
import { SavingIndicator } from '@/components/SavingIndicator';
import { ProductionState } from '@/constants/ProductionStates';
import { usePageTitle } from '@/hooks/usePageTitle.ts';
import { NotificationSelector } from '@/pages/common/DetalleProduccion/components/NotificationSelector';

const DetalleProduccionProtectedPage: React.FC = () => {
  const { codigoProduccion } = useParams<{ codigoProduccion: string }>();
  
  usePageTitle(codigoProduccion ? `Producción ${codigoProduccion}` : 'Detalle de Producción');

  const [notificationLevel, setNotificationLevel] = useState<NotificationLevel>('ALL');

  const {
    loading: loadingData,
    error: errorData,
    estadoActual,
    estructura,
    getUltimasRespuestas,
    isSaving,
    guardarRespuestaCampo,
    guardarRespuestaCeldaTabla,
    cambiarEstadoProduccion,
    guardarMetadata,
    updateFieldResponse,
    updateTableCellResponse,
    updateProductionState,
    updateProductionMetadata,
  } = useProductionData(codigoProduccion);

  useProductionWebSocket({
    codigoProduccion,
    estadoActual,
    estructura,
    getUltimasRespuestas,
    updateFieldResponse,
    updateTableCellResponse,
    updateProductionState,
    updateProductionMetadata,
    notificationLevel,
  });

  const {
    debouncedCampoChange,
    debouncedTablaChange,
    debouncedMetadataChange,
    handleCambioEstado,
  } = useProductionActions({
    isSaving,
    guardarRespuestaCampo,
    guardarRespuestaCeldaTabla,
    cambiarEstadoProduccion,
    guardarMetadata,
    estadoActual,
    estructura,
    updateFieldResponse,
    updateTableCellResponse,
  });

  const isProductionEditable = estadoActual?.produccion.estado === ProductionState.EN_PROCESO;

  return (
    <ProductionStatusDisplay
      loading={loadingData}
      error={errorData ? 'Error al cargar la producción' : null}
      estructura={estructura}
      estadoActual={estadoActual}
      redirectPath="/producciones"
      redirectLabel="Volver al Listado"
    >
      <SavingIndicator isSaving={isSaving} />
      
      <AppHeader />
      
      <div className="production-detail-container">
        <NotificationSelector
          value={notificationLevel}
          onChange={setNotificationLevel}
          className="notification-selector-wrapper"
        />

        <DetalleProduccionPage
          estructura={estructura!}
          respuestas={estadoActual!}
          isEditable={isProductionEditable}
          onCampoChange={debouncedCampoChange}
          onTablaChange={debouncedTablaChange}
          onMetadataChange={debouncedMetadataChange}
          onCambioEstado={handleCambioEstado}
        />
      </div>
    </ProductionStatusDisplay>
  );
};

export default DetalleProduccionProtectedPage;
