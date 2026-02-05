/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Spin } from 'antd';
import type { LoginRequest, RegisterRequest } from '@/services/auth/Auth.ts';
import { authService } from '@/services/auth/AuthService.ts';
import type { User } from '@/services/auth/User.ts';
import { setOnUnauthorizedHandler, setTokenRefreshHandler } from '@/services/ApiClient.ts';
import { SessionTimeoutModal } from '@/components/auth/SessionTimeoutModal.tsx';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  isAuthenticated: boolean;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el modal de "Extender Sesión"
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);

  const activeRefreshPromise = useRef<Promise<string | null> | null>(null);
  const modalResolver = useRef<((token: string | null) => void) | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    setUser(null);
    setError(null);
    setIsTimeoutModalOpen(false);
    activeRefreshPromise.current = null;
    modalResolver.current = null;
  }, []);

  const updateUser = useCallback((newUser: User) => {
    setUser(newUser);
    localStorage.setItem('userData', JSON.stringify(newUser));
  }, []);

  // --- Lógica de Refresh ---
  const handleTokenRefresh = useCallback(async (): Promise<string | null> => {
    if (activeRefreshPromise.current) {
      return activeRefreshPromise.current;
    }

    const promise = (async () => {
      try {
        // PASO 1: Preguntar al usuario si quiere extender
        console.log('[AuthProvider] Token expirado. Preguntando al usuario...');
        setIsTimeoutModalOpen(true);

        // Esperar decisión del usuario (Extender o Salir)
        const userDecision = await new Promise<'EXTEND' | 'LOGOUT'>((resolve) => {
          (modalResolver as any).current = resolve;
        });

        if (userDecision === 'LOGOUT') {
          logout();
          return null;
        }

        // PASO 2: Intentar Refresh Silencioso
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (storedRefreshToken) {
          try {
            console.log('[AuthProvider] Intentando refresh...');
            const response = await authService.refreshToken(storedRefreshToken);
            const newAccessToken = response.access_token;

            if (newAccessToken) {
              console.log('[AuthProvider] Refresh exitoso.');
              localStorage.setItem('authToken', newAccessToken);
              if (response.refresh_token) {
                localStorage.setItem('refreshToken', response.refresh_token);
              }
              setIsTimeoutModalOpen(false); // Cerrar modal de timeout
              return newAccessToken;
            }
          } catch (err) {
            console.warn('[AuthProvider] Falló el refresh automático.', err);
          }
        }

        // PASO 3: Si falló el refresh o no había token -> LOGOUT DIRECTO
        console.warn('[AuthProvider] No se pudo extender la sesión. Deslogueando.');
        setIsTimeoutModalOpen(false);
        logout();
        return null;

      } catch (e) {
        console.error('[AuthProvider] Error en flujo de refresh', e);
        logout();
        return null;
      } finally {
        activeRefreshPromise.current = null;
      }
    })();

    activeRefreshPromise.current = promise;
    return promise;
  }, [logout]);

  // --- Handlers para el Modal de Timeout ---
  const handleExtendSession = () => {
    if ((modalResolver as any).current) {
      (modalResolver as any).current('EXTEND');
    }
  };

  const handleTimeoutLogout = () => {
    if ((modalResolver as any).current) {
      (modalResolver as any).current('LOGOUT');
    }
  };

  // --- Configuración Inicial ---
  useEffect(() => {
    setOnUnauthorizedHandler(() => {
      // Si ocurre un 401 y NO estamos gestionando un refresh, logout.
      if (!isTimeoutModalOpen && !activeRefreshPromise.current) {
        logout();
      }
    });
    setTokenRefreshHandler(handleTokenRefresh);
  }, [logout, handleTokenRefresh, isTimeoutModalOpen]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setInitialLoading(false);
        return;
      }
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try { setUser(JSON.parse(storedUserData)); } catch (e) { localStorage.removeItem('userData'); }
      }
      try {
        // Intentamos obtener el usuario actual. Si falla (ej. 401/403), el ApiClient intentará refrescar.
        // Si el refresh falla, lanzará error y caeremos en el catch -> logout.
        const freshUserData = await authService.getCurrentUser();
        updateUser(freshUserData);
      } catch (err) {
        console.warn('[AuthProvider] Falló la verificación de sesión al inicio.', err);
        logout();
      } finally {
        setInitialLoading(false);
      }
    };
    checkAuthStatus();
  }, [logout, updateUser]);

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('authToken', response.access_token);
      if (response.refresh_token) localStorage.setItem('refreshToken', response.refresh_token);
      updateUser(response.user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      localStorage.setItem('authToken', response.access_token);
      if (response.refresh_token) localStorage.setItem('refreshToken', response.refresh_token);
      updateUser(response.user);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    initialLoading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {initialLoading ? (
        <Spin spinning={initialLoading} fullscreen tip="Verificando sesión..." />
      ) : (
        <>
          {children}
          
          {/* Modal Único: Pregunta si extender */}
          <SessionTimeoutModal 
            open={isTimeoutModalOpen}
            onExtend={handleExtendSession}
            onLogout={handleTimeoutLogout}
          />
        </>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
