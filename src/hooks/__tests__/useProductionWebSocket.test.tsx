import { renderHook, waitFor } from '@/test/test-utils';
import { useProductionWebSocket } from '../useProductionWebSocket';
import { notificationService } from '@/services/notificaciones/notificationService';
import { vi } from 'vitest';

// Mock del servicio de notificaciones
vi.mock('@/services/notificaciones/notificationService', () => ({
  notificationService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    subscribeToAutoSave: vi.fn(),
    setOnReconnectedCallback: vi.fn(),
  },
}));

describe('useProductionWebSocket - Robustez y Reconexión', () => {
  const mockGetUltimasRespuestas = vi.fn();
  const mockUpdateFieldResponse = vi.fn();
  const mockUpdateTableCellResponse = vi.fn();
  const mockUpdateProductionState = vi.fn();
  const mockUpdateProductionMetadata = vi.fn();

  const defaultProps = {
    codigoProduccion: 'PROD-123',
    estadoActual: { produccion: { estado: 'EN_PROCESO' } },
    estructura: null,
    getUltimasRespuestas: mockGetUltimasRespuestas,
    updateFieldResponse: mockUpdateFieldResponse,
    updateTableCellResponse: mockUpdateTableCellResponse,
    updateProductionState: mockUpdateProductionState,
    updateProductionMetadata: mockUpdateProductionMetadata,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Se conecta al montar y configura los callbacks', () => {
    renderHook(() => useProductionWebSocket(defaultProps));

    expect(notificationService.connect).toHaveBeenCalled();
    expect(notificationService.setOnReconnectedCallback).toHaveBeenCalled();
  });

  it('Resincroniza datos (getUltimasRespuestas) cuando ocurre una reconexión', async () => {
    // 1. Capturar el callback de reconexión que el hook registra
    let reconnectCallback: (() => void) | undefined;
    
    (notificationService.setOnReconnectedCallback as any).mockImplementation((cb: () => void) => {
      reconnectCallback = cb;
    });

    renderHook(() => useProductionWebSocket(defaultProps));

    // 2. Verificar que se registró el callback
    expect(reconnectCallback).toBeDefined();

    // 3. SIMULAR CAÍDA Y RECONEXIÓN DEL SERVIDOR
    // Ejecutamos manualmente el callback que el hook pasó al servicio
    if (reconnectCallback) {
        reconnectCallback();
    }

    // 4. Verificar que el hook pidió los datos de nuevo
    // Esta es la prueba de "Persistencia ante fallos": Si vuelve la conexión, actualizo todo.
    expect(mockGetUltimasRespuestas).toHaveBeenCalledWith('PROD-123');
  });

  it('Procesa mensajes de actualización de campos (Field Update)', async () => {
    // Capturar el callback de suscripción
    let messageCallback: ((msg: any) => void) | undefined;
    
    // Simulamos que connect llama al callback de éxito inmediatamente
    (notificationService.connect as any).mockImplementation((onConnect: any) => onConnect && onConnect());

    (notificationService.subscribeToAutoSave as any).mockImplementation((_code: string, cb: any) => {
      messageCallback = cb;
      return vi.fn(); // unsubscribe mock
    });

    renderHook(() => useProductionWebSocket(defaultProps));

    // Simular llegada de mensaje por WebSocket
    const mockMessage = {
      type: 'FIELD_UPDATED',
      payload: { idCampo: 1, valor: 'Nuevo Valor', timestamp: '2024-01-01' }
    };

    if (messageCallback) {
      messageCallback(mockMessage);
    }

    // El hook usa un sistema de batching (setTimeout), así que esperamos
    await waitFor(() => {
      expect(mockUpdateFieldResponse).toHaveBeenCalledWith(mockMessage.payload);
    });
  });

  it('Procesa cambios de estado de producción', async () => {
    let messageCallback: ((msg: any) => void) | undefined;
    (notificationService.connect as any).mockImplementation((onConnect: any) => onConnect && onConnect());
    (notificationService.subscribeToAutoSave as any).mockImplementation((_code: string, cb: any) => {
      messageCallback = cb;
      return vi.fn();
    });

    renderHook(() => useProductionWebSocket(defaultProps));

    const mockMessage = {
      type: 'STATE_CHANGED',
      payload: { estado: 'FINALIZADA', timestamp: '2024-01-01' }
    };

    if (messageCallback) {
      messageCallback(mockMessage);
    }

    expect(mockUpdateProductionState).toHaveBeenCalledWith(mockMessage.payload);
  });
});
