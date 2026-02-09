import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider.tsx';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, initialLoading } = useAuth();

  // Mientras el AuthProvider está validando el token, no renderizamos nada.
  // El AuthProvider ya está mostrando un spinner de pantalla completa.
  if (initialLoading) {
    return null;
  }

  // Si la carga inicial terminó y el usuario ya está autenticado, redirige al dashboard.
  if (isAuthenticated) {
    return <Navigate to="/inicio" replace />;
  }

  // Si la carga inicial terminó y el usuario no está autenticado, muestra la página pública (ej. Login).
  return <>{children}</>;
};
