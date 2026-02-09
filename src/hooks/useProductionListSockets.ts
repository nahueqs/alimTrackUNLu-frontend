import { useEffect } from 'react';
import { notificationService } from '@/services/notificaciones/notificationService';
import type { ProductionStateUpdatePayload } from '@/types/production';

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
  useEffect(() => {
    let unsubscribeState: (() => void) | undefined;
    let unsubscribeCreated: (() => void) | undefined;
    let unsubscribeDeleted: (() => void) | undefined;

    const connectAndSubscribe = () => {
      notificationService.connect(() => {
        // 1. Suscribirse a cambios de estado
        if (onStateChange) {
          unsubscribeState = notificationService.subscribeToProductionStateChanges((message) => {
            if (message.type === 'STATE_CHANGED') {
              onStateChange(message.codigoProduccion, {
                ...message.payload,
                timestamp: message.timestamp,
              });
            }
          });
        }

        // 2. Suscribirse a nuevas producciones
        if (onCreated) {
          unsubscribeCreated = notificationService.subscribeToProductionCreated((message) => {
            if (message.type === 'PRODUCTION_METADATA_CREATED') {
              onCreated();
            }
          });
        }

        // 3. Suscribirse a eliminaciones
        if (onDeleted) {
          unsubscribeDeleted = notificationService.subscribeToProduccionEliminada((message) => {
            if (message.type === 'PRODUCTION_DELETED') {
              onDeleted();
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
      // No desconectamos el servicio globalmente aquí para no afectar a otros componentes
      // notificationService.disconnect(); 
    };
  }, [onStateChange, onCreated, onDeleted]);
};
