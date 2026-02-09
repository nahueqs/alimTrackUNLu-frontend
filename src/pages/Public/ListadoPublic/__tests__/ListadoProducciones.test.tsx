import { render, waitFor, act } from '@/test/test-utils';
import { ListadoProducciones } from '../ListadoProducciones';
import { vi } from 'vitest';
import { notificationService } from '@/services/notificaciones/notificationService';
import { AuthProvider } from '@/context/auth/AuthProvider';

// Mock del servicio público
const mockGetProduccionesPublicas = vi.fn();

vi.mock('@/services/public/usePublicService', () => ({
  usePublicService: () => ({
    producciones: [], // Array vacío, no nos importa el renderizado
    loading: false,
    error: null,
    getProduccionesPublicas: mockGetProduccionesPublicas,
    updateProductionStateInList: vi.fn(),
  }),
}));

// Mock de notificationService
vi.mock('@/services/notificaciones/notificationService', () => ({
  notificationService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    subscribeToProductionStateChanges: vi.fn(),
    subscribeToProductionCreated: vi.fn(),
    subscribeToProduccionEliminada: vi.fn(),
  },
}));

// Mock de AuthProvider
vi.mock('@/context/auth/AuthProvider', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
  AuthProvider: ({ children }: any) => <div>{children}</div>,
}));

describe('ListadoProducciones (Público) - Lógica de Integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithAuth = (ui: React.ReactElement) => {
    return render(
      <AuthProvider>
        {ui}
      </AuthProvider>
    );
  };

  it('Solicita las producciones al montar', () => {
    renderWithAuth(<ListadoProducciones />);
    expect(mockGetProduccionesPublicas).toHaveBeenCalled();
  });

  it('Se conecta y suscribe a WebSockets', () => {
    renderWithAuth(<ListadoProducciones />);
    
    expect(notificationService.connect).toHaveBeenCalled();
    
    // Simular conexión exitosa para verificar suscripciones
    const connectCallback = (notificationService.connect as any).mock.calls[0][0];
    if (connectCallback) connectCallback();

    expect(notificationService.subscribeToProductionStateChanges).toHaveBeenCalled();
    expect(notificationService.subscribeToProductionCreated).toHaveBeenCalled();
    expect(notificationService.subscribeToProduccionEliminada).toHaveBeenCalled();
  });

  it('Recarga los datos cuando se crea una nueva producción (WebSocket)', async () => {
    let createdCallback: ((msg: any) => void) | undefined;
    
    // Capturar el callback de suscripción
    (notificationService.connect as any).mockImplementation((cb: any) => cb && cb());
    (notificationService.subscribeToProductionCreated as any).mockImplementation((cb: any) => {
      createdCallback = cb;
      return vi.fn();
    });

    renderWithAuth(<ListadoProducciones />);

    // Simular evento
    act(() => {
      if (createdCallback) {
        createdCallback({ type: 'PRODUCTION_METADATA_CREATED' });
      }
    });

    // Verificar recarga (1 al montar + 1 por evento)
    await waitFor(() => {
      expect(mockGetProduccionesPublicas).toHaveBeenCalledTimes(2);
    });
  });
});
