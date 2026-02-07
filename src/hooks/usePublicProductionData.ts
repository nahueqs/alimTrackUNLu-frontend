import { useEffect, useState } from 'react';
import { usePublicService } from '@/services/public/usePublicService';
import { useProductionWebSocket, type NotificationLevel } from '@/hooks/useProductionWebSocket';

export const usePublicProductionData = (codigoProduccion?: string) => {
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

  // Configuración de WebSockets
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

  // Carga inicial de datos
  useEffect(() => {
    if (codigoProduccion) {
      Promise.all([
        getEstructuraProduccion(codigoProduccion),
        getUltimasRespuestasProduccion(codigoProduccion),
      ]);
    }
  }, [codigoProduccion, getEstructuraProduccion, getUltimasRespuestasProduccion]);

  return {
    loading,
    error,
    estructura,
    respuestas,
    notificationLevel,
    setNotificationLevel,
  };
};
