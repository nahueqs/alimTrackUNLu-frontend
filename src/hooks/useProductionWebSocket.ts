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
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useBrowserNotifications } from './useBrowserNotifications';

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
  estructura,
  getUltimasRespuestas,
  updateFieldResponse,
  updateTableCellResponse,
  updateProductionState,
  updateProductionMetadata,
  notificationLevel = 'ALL',
}: UseProductionWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useBrowserNotifications();

  // Referencias para el batching (agrupamiento)
  const pendingFieldUpdates = useRef<FieldUpdatePayload[]>([]);
  const pendingTableUpdates = useRef<TableCellUpdatePayload[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    notificationService.connect(() => {
      setIsConnected(true);
      if (import.meta.env.DEV) console.log('[WebSocket] Conectado');
    });

    // Configurar callback de reconexión para resincronizar datos
    notificationService.setOnReconnectedCallback(() => {
      if (codigoProduccion) {
        if (import.meta.env.DEV) console.log('[WebSocket] Reconectado. Resincronizando datos...');
        getUltimasRespuestas(codigoProduccion);
      }
    });

    return () => {
      // notificationService.disconnect();
    };
  }, [codigoProduccion, getUltimasRespuestas]);

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
    let unsubscribeDeleted: (() => void) | undefined;

    if (codigoProduccion && isConnected) {
      // Suscripción a actualizaciones generales
      unsubscribe = notificationService.subscribeToAutoSave(codigoProduccion, (message: any) => {
        const tryShowNotification = (title: string, body: string, type: string) => {
          // Filtrado de notificaciones según preferencia del usuario
          if (notificationLevel === 'NONE') return;
          if (notificationLevel === 'STATE_ONLY' && type !== 'STATE_CHANGED') return;

          showNotification(title, body, 'alimtrack-update');
        };

        if (!message) return;

        switch (message.type) {
          case 'FIELD_UPDATED': {
            if (!message.payload) break;
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
            if (!message.payload) break;
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
            if (!message.payload) break;
            updateProductionState(message.payload);
            tryShowNotification(
              `Estado Actualizado`,
              `El estado ha cambiado a: ${message.payload.estado}`,
              'STATE_CHANGED'
            );
            break;
          case 'PRODUCTION_METADATA_UPDATED':
            if (!message.payload) break;
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

      // Suscripción específica a eliminación
      unsubscribeDeleted = notificationService.subscribeToProduccionEliminada((msg) => {
        const msgCodigo = msg?.payload?.codigoProduccion || msg?.codigoProduccion;
        if (msgCodigo === codigoProduccion) {
          message.warning('La producción que estabas visualizando ha sido eliminada.');
          // Determinar a dónde redirigir basado en la URL actual
          const currentPath = window.location.pathname;
          if (currentPath.includes('/public/')) {
            navigate('/public/producciones');
          } else {
            navigate('/producciones');
          }
        }
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (unsubscribeDeleted) {
        unsubscribeDeleted();
      }
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, [
    codigoProduccion,
    isConnected,
    getUltimasRespuestas,
    updateProductionState,
    updateProductionMetadata,
    estructura,
    queueUpdate,
    notificationLevel,
    navigate,
    showNotification
  ]);

  return { isConnected };
};
