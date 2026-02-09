import { render, waitFor, act } from '@/test/test-utils';
import ProductionsResultPage from '../ProduccionesPage';
import { vi } from 'vitest';
import { notificationService } from '@/services/notificaciones/notificationService';
import { ProductionState } from '@/constants/ProductionStates';
import { AuthProvider } from '@/context/auth/AuthProvider';

// Mock del servicio protegido
const mockGetProducciones = vi.fn();
const mockUpdateProductionStateInList = vi.fn();

vi.mock('@/services/production/useProductionService', () => ({
  useProductionService: () => ({
    producciones: [], // No renderizamos datos
    loading: false,
    error: false,
    getProducciones: mockGetProducciones,
    updateProductionStateInList: mockUpdateProductionStateInList,
    deleteProduction: vi.fn(),
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
  useAuth: () => ({ user: { email: 'admin@test.com' }, isAuthenticated: true }),
  AuthProvider: ({ children }: any) => <div>{children}</div>,
}));

describe('ProduccionesPage (Protegido) - Lógica de Integración', () => {
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
    renderWithAuth(<ProductionsResultPage />);
    expect(mockGetProducciones).toHaveBeenCalled();
  });

  it('Actualiza el estado local ante evento WebSocket', async () => {
    let stateCallback: ((msg: any) => void) | undefined;
    (notificationService.connect as any).mockImplementation((cb: any) => cb && cb());
    (notificationService.subscribeToProductionStateChanges as any).mockImplementation((cb: any) => {
      stateCallback = cb;
      return vi.fn();
    });

    renderWithAuth(<ProductionsResultPage />);

    const wsMessage = {
      type: 'STATE_CHANGED',
      codigoProduccion: 'PROD-123',
      payload: { estado: ProductionState.FINALIZADA },
      timestamp: '2024-01-01'
    };

    act(() => {
      if (stateCallback) {
        stateCallback(wsMessage);
      }
    });

    await waitFor(() => {
      expect(mockUpdateProductionStateInList).toHaveBeenCalledWith(
        'PROD-123',
        expect.objectContaining({ estado: ProductionState.FINALIZADA })
      );
    });
  });

  it('Recarga la lista ante evento de creación', async () => {
    let createdCallback: ((msg: any) => void) | undefined;
    (notificationService.connect as any).mockImplementation((cb: any) => cb && cb());
    (notificationService.subscribeToProductionCreated as any).mockImplementation((cb: any) => {
      createdCallback = cb;
      return vi.fn();
    });

    renderWithAuth(<ProductionsResultPage />);

    act(() => {
      if (createdCallback) {
        createdCallback({ type: 'PRODUCTION_METADATA_CREATED' });
      }
    });

    await waitFor(() => {
      expect(mockGetProducciones).toHaveBeenCalledTimes(2);
    });
  });
});
