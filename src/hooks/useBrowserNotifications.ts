import { useCallback, useEffect, useRef } from 'react';

export const useBrowserNotifications = () => {
  const isPageVisible = useRef(true);

  // Detectar visibilidad de la página
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisible.current = document.visibilityState === 'visible';
      if (import.meta.env.DEV) {
        console.log(
          '[Notifications] Visibilidad cambiada:',
          isPageVisible.current ? 'VISIBLE' : 'OCULTO'
        );
      }
    };
    // Inicializar valor correcto
    isPageVisible.current = document.visibilityState === 'visible';

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Solicitar permisos de notificación si no se tienen
  useEffect(() => {
    if (!('Notification' in window)) {
      console.warn('[Notifications] Este navegador no soporta notificaciones de escritorio');
    } else if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (import.meta.env.DEV) console.log('[Notifications] Permiso de notificaciones:', permission);
      });
    } else {
      if (import.meta.env.DEV) console.log('[Notifications] Estado de permisos de notificación:', Notification.permission);
    }
  }, []);

  const showNotification = useCallback((title: string, body: string, tag?: string) => {
    // Solo mostrar notificación si la página NO está visible y tenemos permiso
    if (!isPageVisible.current && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          tag: tag || 'alimtrack-notification',
          icon: '/vite.svg', // Opcional: icono de la app
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (e) {
        console.error('[Notifications] Error al crear notificación:', e);
      }
    } else {
        if (import.meta.env.DEV) {
            console.log('[Notifications] Notificación omitida (página visible o sin permisos):', {
                visible: isPageVisible.current,
                permission: Notification.permission,
                title
            });
        }
    }
  }, []);

  return { showNotification, isPageVisible };
};
