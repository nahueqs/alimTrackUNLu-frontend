import { render, screen, waitFor } from '@/test/test-utils';
import { ProtectedRoute } from '../ProtectedRoute';
import { AuthProvider } from '../AuthProvider';
import { vi } from 'vitest';
import * as router from 'react-router-dom';
import { authService } from '@/services/auth/AuthService';

// Mock de Navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: vi.fn(() => null),
  };
});

// Mock del servicio de autenticación
vi.mock('@/services/auth/AuthService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('redirige a login si no hay token', async () => {
    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Contenido Protegido</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(router.Navigate).toHaveBeenCalledWith(
        expect.objectContaining({ to: '/login' }),
        expect.anything()
      );
    });
  });

  it('renderiza el contenido si hay token y usuario válido', async () => {
    localStorage.setItem('authToken', 'fake-token');
    
    // Mockear respuesta exitosa del usuario
    (authService.getCurrentUser as any).mockResolvedValue({ 
      email: 'test@test.com', 
      roles: ['USER'] 
    });

    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Contenido Protegido</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    // Esperar a que se resuelva la promesa de autenticación
    await waitFor(() => {
      expect(screen.getByText('Contenido Protegido')).toBeInTheDocument();
    });
  });
});
