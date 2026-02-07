import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Helper para obtener la URL base del WebSocket
const getWebSocketUrl = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://alimtrackunlu.onrender.com/api/v1';
  // Eliminamos '/api/v1' o '/api' del final para obtener la raíz
  const rootUrl = apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
  // Aseguramos que no termine en slash
  const cleanRoot = rootUrl.replace(/\/$/, '');
  return `${cleanRoot}/ws`;
};

class NotificationService {
  private stompClient: Client | null = null;
  private readonly websocketEndpoint: string;
  private onConnectCallback: (() => void) | null = null;

  constructor() {
    this.websocketEndpoint = getWebSocketUrl();
    this.initializeClient();
  }

  private initializeClient() {
    this.stompClient = new Client({
      brokerURL: '_', // SockJS overrides this
      reconnectDelay: 5000, // Esperar 5 segundos antes de reconectar
      heartbeatIncoming: 20000, // Aumentado a 20s para ser más tolerante con redes lentas
      heartbeatOutgoing: 20000,
      // debug: (str) => { if (import.meta.env.DEV) console.log(str); }, 
      onConnect: () => {
        console.log('[NotificationService] Conectado exitosamente');
        // this.connectionAttempts = 0; // Removed unused variable usage
        if (this.onConnectCallback) {
          this.onConnectCallback();
        }
      },
      onDisconnect: () => {
        console.log('[NotificationService] Desconectado');
        // No limpiamos el callback aquí para permitir reconexión automática y resuscripción
      },
      onStompError: (frame) => {
        console.error('[NotificationService] Broker reported error: ' + frame.headers['message']);
        console.error('[NotificationService] Additional details: ' + frame.body);
      },
      onWebSocketClose: () => {
        console.log('[NotificationService] WebSocket cerrado');
        // La reconexión es manejada automáticamente por stompjs si reconnectDelay > 0
      },
      webSocketFactory: () => new SockJS(this.websocketEndpoint),
      
      // Hook para manejar expiración de token si fuera necesario en el futuro
      // beforeConnect: () => { ... } 
    });
  }

  public connect(onConnect?: () => void): void {
    if (onConnect) {
      this.onConnectCallback = onConnect;
    }
    
    if (this.stompClient && !this.stompClient.active) {
      console.log('[NotificationService] Iniciando conexión...');
      this.stompClient.activate();
    } else if (this.stompClient && this.stompClient.connected && onConnect) {
      // Si ya está conectado, ejecutar callback inmediatamente
      onConnect();
    }
  }

  public disconnect(): void {
    if (this.stompClient && this.stompClient.active) {
      console.log('[NotificationService] Desconectando manualmente...');
      this.stompClient.deactivate();
    }
    this.onConnectCallback = null;
  }

  // Método genérico para suscripciones con manejo de errores
  private subscribe(destination: string, callback: (message: any) => void): () => void {
    if (!this.stompClient) return () => {};

    // Si no está conectado, intentamos conectar (la suscripción se encolará si stompjs lo soporta, 
    // pero es mejor asegurar conexión)
    if (!this.stompClient.active) {
        this.connect();
    }

    // Nota: StompJS maneja la resuscripción automática en reconexión si se usa correctamente.
    // Sin embargo, aquí estamos devolviendo una función de limpieza directa.
    // Si la conexión se cae y vuelve, StompJS debería restaurar las suscripciones activas.
    
    // Verificamos si podemos suscribirnos inmediatamente
    if (this.stompClient.connected) {
        try {
            const subscription = this.stompClient.subscribe(destination, (message: IMessage) => {
                try {
                    callback(JSON.parse(message.body));
                } catch (e) {
                    console.error('[NotificationService] Error parsing message:', e);
                }
            });
            return () => subscription.unsubscribe();
        } catch (e) {
            console.error(`[NotificationService] Error al suscribirse a ${destination}:`, e);
            return () => {};
        }
    } else {
        // Si no está conectado, esperamos al evento onConnect
        // Esto es un patrón simple, para algo más robusto se podría usar una cola de suscripciones pendientes
        console.log(`[NotificationService] Cola de suscripción para ${destination} (esperando conexión)`);
        
        // Guardamos la referencia original del callback de conexión
        const originalOnConnect = this.onConnectCallback;
        
        // Encadenamos la suscripción
        this.onConnectCallback = () => {
            if (originalOnConnect) originalOnConnect();
            // Intentar suscribir ahora que estamos conectados
            this.stompClient?.subscribe(destination, (message: IMessage) => {
                try {
                    callback(JSON.parse(message.body));
                } catch (e) {
                    console.error('[NotificationService] Error parsing message:', e);
                }
            });
        };
        
        // No podemos devolver una función de unsubscribe real aquí fácilmente sin una gestión de estado más compleja
        // Devolvemos una función vacía por ahora, asumiendo que el componente se desmontará y desconectará todo si es necesario
        return () => {}; 
    }
  }

  public subscribeToAutoSave(
    codigoProduccion: string,
    callback: (message: any) => void
  ): () => void {
    return this.subscribe(`/topic/produccion/${codigoProduccion}`, callback);
  }

  public subscribeToProductionCreated(callback: (message: any) => void): () => void {
    return this.subscribe(`/topic/produccion/created`, callback);
  }

  public subscribeToProductionStateChanges(callback: (message: any) => void): () => void {
    return this.subscribe(`/topic/producciones/state-changed`, callback);
  }

  public subscribeToProduccionFinalizada(callback: (message: any) => void): () => void {
    return this.subscribe(`/topic/produccion/finished`, callback);
  }

  public subscribeToProduccionCancelada(callback: (message: any) => void): () => void {
    return this.subscribe(`/topic/produccion/cancelled`, callback);
  }
}

export const notificationService = new NotificationService();
