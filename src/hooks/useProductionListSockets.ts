import { useEffect } from 'react';
import { notificationService } from '@/services/notificaciones/notificationService';
import type { ProductionStateUpdatePayload } from '@/types/production';
import { useBrowserNotifications } from './useBrowserNotifications';

interface UseProductionListSocketsProps {
  onStateChange?: (codigoProduccion: string, payload: ProductionStateUpdatePayload & { timestamp: string }) => void;
  onCreated?: () => void;
  onDeleted?: () => void;
}

export const useProductionListSockets = ({
  onStateChange,
  onCreated,
  onDeleted,
}: UseProductionListSocketsProps) => {
  const { showNotification } = useBrowserNotifications();

  useEffect(() => {
    let unsubscribeState: (() => void) | undefined;
    let unsubscribeCreated: (() => void) | undefined;
    let unsubscribeDeleted: (() => void) | undefined;

    const connectAndSubscribe = () => {
      notificationService.connect(() => {
        // 1. Suscribirse a cambios de estado
        if (onStateChange) {
          unsubscribeState = notificationService.subscribeToProductionStateChanges((message) => {
            if (message?.type === 'STATE_CHANGED') {
              const codigo = message.codigoProduccion || message.payload?.codigoProduccion || 'Desconocido';
              onStateChange(codigo, {
                ...message.payload,
                timestamp: message.timestamp,
              });
              showNotification(
                'Estado de Producción Actualizado',
                `La producción ${codigo} cambió a estado: ${message.payload?.estado || 'Desconocido'}`,
                'alimtrack-list-update'
              );
            }
          });
        }

        // 2. Suscribirse a nuevas producciones
        if (onCreated) {
          unsubscribeCreated = notificationService.subscribeToProductionCreated((message) => {
            if (message?.type === 'PRODUCTION_METADATA_CREATED') {
              onCreated();
              const codigo = message.payload?.codigoProduccion || message.codigoProduccion || 'Nueva';
              showNotification(
                'Nueva Producción',
                `Se ha creado una nueva producción: ${codigo}`,
                'alimtrack-list-update'
              );
            }
          });
        }

        // 3. Suscribirse a eliminaciones
        if (onDeleted) {
          unsubscribeDeleted = notificationService.subscribeToProduccionEliminada((message) => {
            if (message?.type === 'PRODUCTION_DELETED') {
              onDeleted();
              const codigo = message.payload?.codigoProduccion || message.codigoProduccion || 'Desconocida';
              showNotification(
                'Producción Eliminada',
                `Se ha eliminado la producción: ${codigo}`,
                'alimtrack-list-update'
              );
            }
          });
        }
      });
    };

    connectAndSubscribe();

    return () => {
      if (unsubscribeState) unsubscribeState();
      if (unsubscribeCreated) unsubscribeCreated();
      if (unsubscribeDeleted) unsubscribeDeleted();
    };
  }, [onStateChange, onCreated, onDeleted, showNotification]);
};
