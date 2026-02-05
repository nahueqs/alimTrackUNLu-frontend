let onUnauthorized: (() => void) | null = null;
let tokenRefreshHandler: (() => Promise<string | null>) | null = null;

export const setOnUnauthorizedHandler = (callback: () => void) => {
  onUnauthorized = callback;
};

export const setTokenRefreshHandler = (handler: () => Promise<string | null>) => {
  tokenRefreshHandler = handler;
};

interface ApiError extends Error {
  response?: {
    status: number;
    data: any;
  };
}

// URL base por defecto: usa la variable de entorno si existe, sino la de producción
const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://alimtrackunlu.onrender.com/api/v1';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = DEFAULT_BASE_URL) {
    this.baseURL = baseURL;
  }

  async get<T>(endpoint: string, params?: Record<string, any>, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params, ...options });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { params?: Record<string, any> }
  ): Promise<T> {
    const token = localStorage.getItem('authToken');
    let url = `${this.baseURL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;

    if (options.method === 'GET' && options.params) {
      const queryString = this.buildQueryString(options.params);
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const headers: HeadersInit = new Headers({
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    });

    // Solo agregamos el token si no viene ya un Authorization en los headers (para permitir override en refresh)
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = { ...options, headers, credentials: 'include' };

    try {
      const response = await fetch(url, config);

      if (response.status === 204) return {} as T;

      const responseText = await response.text();
      let data: any;

      try {
        // Intentamos parsear JSON siempre, independientemente del Content-Type
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        // Si falla el parseo JSON
        if (response.ok) {
             // Si la respuesta fue exitosa (2xx) pero no es JSON
             // Intentamos ver si es un string plano válido que no es JSON (ej: "OK")
             // Si es HTML, probablemente sea un error de proxy o fallback
             if (responseText.trim().startsWith('<')) {
                 console.warn('[ApiClient] Respuesta 200 OK pero es HTML (posible fallback):', responseText.substring(0, 100));
                 const error = new Error('El servidor devolvió HTML en lugar de JSON. Verifica la URL de la API.') as ApiError;
                 error.response = { status: response.status, data: responseText };
                 throw error;
             }
             
             // Si no es HTML, asumimos que es una respuesta de texto plano válida
             // Devolvemos el texto tal cual si T es string, o un objeto con el mensaje
             // Para mayor seguridad, devolvemos un objeto vacío o el texto en una propiedad si no podemos inferir
             // Pero dado que esperamos T, y falló JSON.parse, es arriesgado.
             // Mejor estrategia: Si el texto no es vacío, lo devolvemos como si fuera parte de la data
             if (responseText.trim().length > 0) {
                 // Hack: si T es string, esto funcionaría, pero T suele ser objeto.
                 // Asumimos que si no es JSON, es un error o un mensaje simple.
                 // Vamos a devolver un objeto con una propiedad 'message' o 'text'
                 data = { message: responseText };
             } else {
                 data = {};
             }
        } else {
             // Si es error (4xx, 5xx), usamos el texto como mensaje
             const msg = responseText.length > 200 ? responseText.substring(0, 200) + '...' : responseText;
             data = { message: msg || `Error ${response.status}` };
        }
      }

      if (!response.ok) {
        const error = new Error(data.message || `Error ${response.status}`) as ApiError;
        error.response = { status: response.status, data };
        throw error;
      }

      return data;
    } catch (error: any) {
      // MODIFICACIÓN: Tratamos 403 igual que 401 si tenemos handler de refresh
      const isUnauthorizedOrForbidden = 
        error.response && (error.response.status === 401 || error.response.status === 403);

      if (isUnauthorizedOrForbidden && tokenRefreshHandler) {
        // Silencioso para el log general, se maneja abajo
      } else {
        console.groupCollapsed(`[ApiClient] Error Capturado`);
        console.error(error);
      }

      let friendlyError: Error;

      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('[ApiClient] Interpretado como: Error de Red.');
        friendlyError = new Error('Error de Conexión: No se pudo comunicar con el servidor.');
      } else if (error.response) {
        const status = error.response.status;
        const apiMessage = error.message;

        switch (status) {
          case 400:
            friendlyError = new Error(
              apiMessage || 'La solicitud es incorrecta. Revisa los datos enviados.'
            );
            break;
          case 401:
          case 403: // Unificamos lógica para 401 y 403
            // Evitar loop infinito: No intentar refrescar si el error viene del login, registro, refresh o verificación inicial
            const isAuthRequest =
              endpoint.includes('/auth/login') ||
              endpoint.includes('/auth/register') ||
              endpoint.includes('/auth/refresh-token') ||
              endpoint.includes('/auth/me');

            if (tokenRefreshHandler && !isAuthRequest) {
              console.log(`[ApiClient] ${status} detectado en:`, endpoint);
              console.log('[ApiClient] Intentando recuperar sesión...');
              try {
                const newToken = await tokenRefreshHandler();
                console.log('[ApiClient] Resultado refresh:', newToken ? 'Éxito' : 'Falló/Cancelado');
                
                if (newToken) {
                  console.log('[ApiClient] Reintentando petición original...');
                  
                  // Reconstruir headers asegurando que Authorization sea el nuevo
                  // Usamos un objeto plano para evitar problemas con Headers iterables
                  const newHeaders: Record<string, string> = {};
                  
                  // Copiar headers originales (si existen)
                  if (options.headers) {
                      const originalHeaders = new Headers(options.headers);
                      originalHeaders.forEach((value, key) => {
                          // Ignorar cualquier Authorization previo
                          if (key.toLowerCase() !== 'authorization') {
                              newHeaders[key] = value;
                          }
                      });
                  }
                  
                  // Asegurar Content-Type si no estaba
                  if (!newHeaders['Content-Type']) {
                      newHeaders['Content-Type'] = 'application/json';
                  }

                  // Poner el nuevo token
                  newHeaders['Authorization'] = `Bearer ${newToken}`;

                  return await this.request<T>(endpoint, {
                    ...options,
                    headers: newHeaders,
                  });
                }
              } catch (refreshError) {
                console.error('[ApiClient] Falló la recuperación de sesión (Excepción).', refreshError);
              }
            } else {
                console.log(`[ApiClient] ${status} sin intento de refresh. Handler:`, !!tokenRefreshHandler, 'IsAuth:', isAuthRequest);
            }
            
            // Si llegamos aquí es porque falló el refresh o no había handler
            console.log(`[ApiClient] Interpretado como: Error HTTP ${status}. Ejecutando logout.`);
            friendlyError = new Error(
              apiMessage || 'Sesión expirada o sin permisos. Por favor, inicie sesión de nuevo.'
            );
            if (onUnauthorized) onUnauthorized();
            break;
          case 404:
            console.log(`[ApiClient] Interpretado como: Error HTTP ${status}.`);
            friendlyError = new Error(apiMessage || 'El recurso solicitado no fue encontrado.');
            break;
          case 409:
            console.log(`[ApiClient] Interpretado como: Error HTTP ${status}.`);
            friendlyError = new Error(
              apiMessage || 'Conflicto: El recurso ya existe o hay un conflicto de datos.'
            );
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            console.log(`[ApiClient] Interpretado como: Error HTTP ${status}.`);
            friendlyError = new Error(
              'Error del Servidor: Problema inesperado. Intente más tarde.'
            );
            break;
          default:
            console.log(`[ApiClient] Interpretado como: Error HTTP ${status}.`);
            friendlyError = error;
            break;
        }
      } else if (error instanceof SyntaxError) {
        console.log('[ApiClient] Interpretado como: Error de parseo JSON.');
        friendlyError = new Error(
          'Error de Respuesta: El formato de la respuesta del servidor no es válido.'
        );
      } else {
        friendlyError = error;
      }

      // Ajustamos la condición de cierre de grupo para incluir 403
      if (
        !(error.response && (error.response.status === 401 || error.response.status === 403) && tokenRefreshHandler)
      ) {
          console.groupEnd();
      }
      
      throw friendlyError;
    }
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((item) => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    return searchParams.toString();
  }
}

export const apiClient = new ApiClient();
