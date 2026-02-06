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

    this.stompClient = new Client({
      brokerURL: '_', // SockJS overrides this
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      // debug: (str) => { if (import.meta.env.DEV) console.log(str); }, // Solo loguear en desarrollo si es necesario
      onConnect: () => {
        if (this.onConnectCallback) {
          this.onConnectCallback();
        }
      },
      onDisconnect: () => {
        this.onConnectCallback = null;
      },
      onStompError: (frame) => {
        // Solo loguear errores críticos
        console.error('Broker reported error: ' + frame.headers['message']);
      },
      webSocketFactory: () => new SockJS(this.websocketEndpoint),
    });
  }

  public connect(onConnect?: () => void): void {
    if (onConnect) {
      this.onConnectCallback = onConnect;
    }
    if (this.stompClient && !this.stompClient.active) {
      this.stompClient.activate();
    } else if (this.stompClient && this.stompClient.connected && onConnect) {
      onConnect();
    }
  }

  public disconnect(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
    }
    this.onConnectCallback = null;
  }

  public subscribeToAutoSave(
    codigoProduccion: string,
    callback: (message: any) => void
  ): () => void {
    const destination = `/topic/produccion/${codigoProduccion}`;
    if (this.stompClient && this.stompClient.connected) {
      const subscription = this.stompClient.subscribe(destination, (message: IMessage) => {
        try {
          callback(JSON.parse(message.body));
        } catch (e) {
          console.error('[NotificationService] Error parsing message:', e);
        }
      });
      return () => subscription.unsubscribe();
    }
    // Silenciamos el warning si no está conectado, ya que puede ser normal en el ciclo de vida de React
    return () => {};
  }

  public subscribeToProductionCreated(callback: (message: any) => void): () => void {
    const destination = `/topic/produccion/created`;
    if (this.stompClient && this.stompClient.connected) {
      const subscription = this.stompClient.subscribe(destination, (message: IMessage) => {
        try {
          callback(JSON.parse(message.body));
        } catch (e) {
          console.error('[NotificationService] Error parsing message:', e);
        }
      });
      return () => subscription.unsubscribe();
    }
    return () => {};
  }

  public subscribeToProductionStateChanges(callback: (message: any) => void): () => void {
    const destination = `/topic/producciones/state-changed`;
    if (this.stompClient && this.stompClient.connected) {
      const subscription = this.stompClient.subscribe(destination, (message: IMessage) => {
        try {
          callback(JSON.parse(message.body));
        } catch (e) {
          console.error('[NotificationService] Error parsing message:', e);
        }
      });
      return () => subscription.unsubscribe();
    }
    return () => {};
  }

  public subscribeToProduccionFinalizada(callback: (message: any) => void): () => void {
    const destination = `/topic/produccion/finished`;
    if (this.stompClient && this.stompClient.connected) {
      const subscription = this.stompClient.subscribe(destination, (message: IMessage) => {
        try {
          callback(JSON.parse(message.body));
        } catch (e) {
          console.error('[NotificationService] Error parsing message:', e);
        }
      });
      return () => subscription.unsubscribe();
    }
    return () => {};
  }

  public subscribeToProduccionCancelada(callback: (message: any) => void): () => void {
    const destination = `/topic/produccion/cancelled`;
    if (this.stompClient && this.stompClient.connected) {
      const subscription = this.stompClient.subscribe(destination, (message: IMessage) => {
        try {
          callback(JSON.parse(message.body));
        } catch (e) {
          console.error('[NotificationService] Error parsing message:', e);
        }
      });
      return () => subscription.unsubscribe();
    }
    return () => {};
  }
}

export const notificationService = new NotificationService();
