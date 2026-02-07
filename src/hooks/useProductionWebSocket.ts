import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationService } from '@/services/notificaciones/notificationService.ts';
import type {
  EstructuraProduccionDTO,
  FieldUpdatePayload,
  ProductionMetadataUpdatedPayload,
  ProductionStateUpdatePayload,
  TableCellUpdatePayload,
} from '@/types/production';
import { findItemInStructure } from '@/utils/production/structureUtils';

export type NotificationLevel = 'ALL' | 'STATE_ONLY' | 'NONE';

// Definimos un tipo compatible con DTOs públicos y protegidos que tengan la info de estado
interface ProductionStateSource {
  produccion: {
    estado: string;
  };
}

interface UseProductionWebSocketProps {
  codigoProduccion: string | undefined;
  estadoActual: ProductionStateSource | null; // Tipo relajado
  estructura: EstructuraProduccionDTO | null;
  getUltimasRespuestas: (codigo: string) => Promise<void>;
  updateFieldResponse: (update: FieldUpdatePayload) => void;
  updateTableCellResponse: (update: TableCellUpdatePayload) => void;
  updateProductionState: (update: ProductionStateUpdatePayload) => void;
  updateProductionMetadata: (
    update: ProductionMetadataUpdatedPayload & { timestamp: string }
  ) => void;
  notificationLevel?: NotificationLevel;
}

export const useProductionWebSocket = ({
  codigoProduccion,
  estadoActual,
  estructura,
  getUltimasRespuestas,
  updateFieldResponse,
  updateTableCellResponse,
  updateProductionState,
  updateProductionMetadata,
  notificationLevel = 'ALL',
}: UseProductionWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const isPageVisible = useRef(true);

  // Referencias para el batching (agrupamiento)
  const pendingFieldUpdates = useRef<FieldUpdatePayload[]>([]);
  const pendingTableUpdates = useRef<TableCellUpdatePayload[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detectar visibilidad de la página
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisible.current = document.visibilityState === 'visible';
      if (import.meta.env.DEV) {
        console.log(
          '[WebSocket] Visibilidad cambiada:',
          isPageVisible.current ? 'VISIBLE' : 'OCULTO'
        );
      }
    };
    // Inicializar valor correcto
    isPageVisible.current = document.visibilityState === 'visible';

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    notificationService.connect(() => {
      setIsConnected(true);
      if (import.meta.env.DEV) console.log('[WebSocket] Conectado');
    });

    return () => {
      // notificationService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!('Notification' in window)) {
      console.warn('[WebSocket] Este navegador no soporta notificaciones de escritorio');
    } else if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (import.meta.env.DEV) console.log('[WebSocket] Permiso de notificaciones:', permission);
      });
    } else {
      if (import.meta.env.DEV) console.log('[WebSocket] Estado de permisos de notificación:', Notification.permission);
    }
  }, []);

  // Función para procesar el lote de actualizaciones acumuladas
  const processBatch = useCallback(() => {
    if (pendingFieldUpdates.current.length > 0) {
      pendingFieldUpdates.current.forEach((update) => updateFieldResponse(update));
      pendingFieldUpdates.current = [];
    }

    if (pendingTableUpdates.current.length > 0) {
      pendingTableUpdates.current.forEach((update) => updateTableCellResponse(update));
      pendingTableUpdates.current = [];
    }

    batchTimeoutRef.current = null;
  }, [updateFieldResponse, updateTableCellResponse]);

  // Función para encolar actualizaciones
  const queueUpdate = useCallback(
    (type: 'FIELD' | 'TABLE', payload: any) => {
      if (type === 'FIELD') {
        const index = pendingFieldUpdates.current.findIndex((u) => u.idCampo === payload.idCampo);
        if (index !== -1) {
          pendingFieldUpdates.current[index] = payload;
        } else {
          pendingFieldUpdates.current.push(payload);
        }
      } else {
        const index = pendingTableUpdates.current.findIndex(
          (u) =>
            u.idTabla === payload.idTabla &&
            u.idFila === payload.idFila &&
            u.idColumna === payload.idColumna
        );
        if (index !== -1) {
          pendingTableUpdates.current[index] = payload;
        } else {
          pendingTableUpdates.current.push(payload);
        }
      }

      if (!batchTimeoutRef.current) {
        batchTimeoutRef.current = setTimeout(processBatch, 100);
      }
    },
    [processBatch]
  );

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (codigoProduccion && isConnected) {
      const isFinalState =
        estadoActual?.produccion.estado === 'FINALIZADA' ||
        estadoActual?.produccion.estado === 'CANCELADA';

      if (!isFinalState) {
        unsubscribe = notificationService.subscribeToAutoSave(codigoProduccion, (message: any) => {
          const tryShowNotification = (title: string, body: string, type: string) => {
            // Filtrado de notificaciones según preferencia del usuario
            if (notificationLevel === 'NONE') return;
            if (notificationLevel === 'STATE_ONLY' && type !== 'STATE_CHANGED') return;

            if (import.meta.env.DEV) {
              console.log('[WebSocket] Intentando mostrar notificación:', {
                visible: isPageVisible.current,
                permission: Notification.permission,
                title,
              });
            }

            if (!isPageVisible.current && Notification.permission === 'granted') {
              try {
                const notif = new Notification(title, {
                  body,
                  tag: 'alimtrack-update',
                  icon: '/vite.svg', // Opcional: icono de la app
                });
                notif.onclick = () => {
                  window.focus();
                  notif.close();
                };
              } catch (e) {
                console.error('[WebSocket] Error al crear notificación:', e);
              }
            }
          };

          switch (message.type) {
            case 'FIELD_UPDATED': {
              queueUpdate('FIELD', message.payload);

              const { sectionTitle, itemTitle } = findItemInStructure(
                estructura,
                message.payload.idCampo,
                'campo'
              );
              const body =
                itemTitle && sectionTitle
                  ? `Cambio en campo "${itemTitle}" de sección "${sectionTitle}".`
                  : `Cambio en un campo de la producción ${codigoProduccion}.`;
              tryShowNotification(`Producción Actualizada`, body, 'FIELD_UPDATED');
              break;
            }
            case 'TABLE_CELL_UPDATED': {
              queueUpdate('TABLE', message.payload);

              const { sectionTitle, itemTitle } = findItemInStructure(
                estructura,
                message.payload.idTabla,
                'tabla'
              );
              const body =
                itemTitle && sectionTitle
                  ? `Cambio en tabla "${itemTitle}" de sección "${sectionTitle}".`
                  : `Cambio en una celda de tabla de la producción ${codigoProduccion}.`;
              tryShowNotification(`Producción Actualizada`, body, 'TABLE_CELL_UPDATED');
              break;
            }
            case 'STATE_CHANGED':
              updateProductionState(message.payload);
              tryShowNotification(
                `Estado Actualizado`,
                `El estado ha cambiado a: ${message.payload.estado}`,
                'STATE_CHANGED'
              );
              break;
            case 'PRODUCTION_METADATA_UPDATED':
              // Aseguramos que haya un timestamp
              const payloadWithTimestamp = {
                ...message.payload,
                timestamp: message.payload.timestamp || new Date().toISOString(),
              };
              updateProductionMetadata(payloadWithTimestamp);
              tryShowNotification(
                `Metadatos Actualizados`,
                `Se han actualizado los metadatos de la producción.`,
                'PRODUCTION_METADATA_UPDATED'
              );
              break;
            default:
              console.warn(
                `[useProductionWebSocket] Unknown update type '${message.type}'. Re-fetching all data.`
              );
              getUltimasRespuestas(codigoProduccion);
              break;
          }
        });
      }
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, [
    codigoProduccion,
    isConnected,
    estadoActual?.produccion.estado,
    getUltimasRespuestas,
    updateProductionState,
    updateProductionMetadata,
    estructura,
    queueUpdate,
    notificationLevel, // Agregado a dependencias
  ]);

  return { isConnected };
};
