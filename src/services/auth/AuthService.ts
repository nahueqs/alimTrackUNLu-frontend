import { apiClient } from '../ApiClient.ts';
import type { AuthResponse, LoginRequest, RegisterRequest } from './Auth.ts';
import type { User } from './User.ts';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      if (!response.access_token || !response.user) {
        throw new Error('Respuesta de login inválida desde el servidor.');
      }
      return response;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error en el login:', error);
      }
      throw error;
    }
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      if (!response.access_token || !response.user) {
        throw new Error('Respuesta de registro inválida desde el servidor.');
      }
      return response;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error en el registro:', error);
      }
      throw error;
    }
  },

  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      // Enviamos el refresh token en el header Authorization
      return await apiClient.post<AuthResponse>(
        '/auth/refresh-token',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error al refrescar token:', error);
      }
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      // Obtenemos el token explícitamente para asegurar que se envíe
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const user = await apiClient.get<User>('/auth/me', {}, { headers });
      return user;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error obteniendo el usuario actual:', error);
      }
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken'); // Limpiamos también el refresh token
    localStorage.removeItem('userData');
  },
};
