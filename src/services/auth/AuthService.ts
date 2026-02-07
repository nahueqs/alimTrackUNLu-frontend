import { apiClient } from '../ApiClient.ts';
import type { AuthResponse, LoginRequest, RegisterRequest } from './Auth.ts';
import type { User } from './User.ts';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    if (import.meta.env.DEV) console.log('[AuthService] Login attempt for:', credentials.email);
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

    if (!response.access_token || !response.user) {
      throw new Error('Respuesta de login inválida desde el servidor.');
    }

    if (import.meta.env.DEV) console.log('[AuthService] Login successful');
    return response;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    if (import.meta.env.DEV) console.log('[AuthService] Register attempt for:', userData.email);
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);

    if (!response.access_token || !response.user) {
      throw new Error('Respuesta de registro inválida desde el servidor.');
    }

    if (import.meta.env.DEV) console.log('[AuthService] Registration successful');
    return response;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    if (import.meta.env.DEV) console.log('[AuthService] Attempting token refresh');

    // IMPORTANTE: Enviar el refresh token en el header
    return await apiClient.post<AuthResponse>(
      '/auth/refresh-token',
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
  },

  async getCurrentUser(): Promise<User> {
    if (import.meta.env.DEV) console.log('[AuthService] Getting current user');

    const user = await apiClient.get<User>('/auth/me');

    if (import.meta.env.DEV) console.log('[AuthService] Current user retrieved:', user.email);
    return user;
  },

  logout() {
    if (import.meta.env.DEV) console.log('[AuthService] Logging out');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  },
};