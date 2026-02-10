import React, { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/context/auth/ProtectedRoute.tsx';
import { PublicRoute } from '@/context/auth/PublicRoute.tsx';
import { ProductionState } from '@/constants/ProductionStates';
import type { LocalProductionFilters } from '@/pages/Producciones/ListadoProtected/ProduccionFilters.tsx';

// Lazy loading de páginas
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage.tsx').then(module => ({ default: module.DashboardPage })));
const LoginPage = lazy(() => import('@/pages/Auth/LoginPage.tsx'));
const NuevaProduccionPage = lazy(() => import('@/pages/Producciones/Nueva/NuevaProduccionPage.tsx').then(module => ({ default: module.NuevaProduccionPage })));
const ProductionsResultPage = lazy(() => import('@/pages/Producciones/ListadoProtected/ProduccionesPage.tsx'));
const DetalleProduccionPublicPage = lazy(() => import('@/pages/Public/Detalle/DetalleProduccionPublicPage.tsx'));
const DetalleProduccionProtectedPage = lazy(() => import('@/pages/Producciones/Detalle/DetalleProduccionProtectedPage.tsx'));
const ListadoProducciones = lazy(() => import('@/pages/Public/ListadoPublic/ListadoProducciones.tsx').then(module => ({ default: module.ListadoProducciones })));
const VersionRecetasPage = lazy(() => import('@/pages/Recetas/Listado/VersionRecetasPage.tsx').then(module => ({ default: module.VersionRecetasPage })));
const RecetasPadrePage = lazy(() => import('@/pages/Recetas/Listado/RecetasPadrePage.tsx').then(module => ({ default: module.RecetasPadrePage })));
const VisualizarRecetaPage = lazy(() => import('@/pages/Recetas/Detalle/VisualizarRecetaPage.tsx').then(module => ({ default: module.VisualizarRecetaPage })));
const RecipeBuilderPage = lazy(() => import('@/pages/Recetas/Builder/RecipeBuilderPage.tsx').then(module => ({ default: module.RecipeBuilderPage })));
const HelpPage = lazy(() => import('@/pages/Help/HelpPage.tsx').then(module => ({ default: module.HelpPage })));

const produccionesActivasFilters: Partial<LocalProductionFilters> = {
  estado: ProductionState.EN_PROCESO,
};
const produccionesFinalizadasFilters: Partial<LocalProductionFilters> = {
  estado: ProductionState.FINALIZADA,
};

export const routes: RouteObject[] = [
  // --- Rutas Públicas ---
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/public/producciones',
    element: (
      <ListadoProducciones />
    ),
  },
  {
    path: '/public/producciones/ver/:codigoProduccion',
    element: (
      <DetalleProduccionPublicPage />
    ),
  },

  // --- Rutas Protegidas ---
  {
    path: '/inicio',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/ayuda',
    element: (
      <ProtectedRoute>
        <HelpPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/producciones/nueva',
    element: (
      <ProtectedRoute>
        <NuevaProduccionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/producciones/editar/:codigoProduccion',
    element: (
      <ProtectedRoute>
        <DetalleProduccionProtectedPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/producciones',
    element: (
      <ProtectedRoute>
        <ProductionsResultPage key="producciones-all" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/producciones/activas',
    element: (
      <ProtectedRoute>
        <ProductionsResultPage
          key="producciones-activas"
          initialFilters={produccionesActivasFilters}
        />
      </ProtectedRoute>
    ),
  },
  {
    path: '/producciones/finalizadas',
    element: (
      <ProtectedRoute>
        <ProductionsResultPage
          key="producciones-finalizadas"
          initialFilters={produccionesFinalizadasFilters}
        />
      </ProtectedRoute>
    ),
  },
  // Rutas de Recetas
  {
    path: '/recetas',
    element: (
      <ProtectedRoute>
        <RecetasPadrePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/recetas/nueva',
    element: (
      <ProtectedRoute>
        <RecipeBuilderPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/recetas/versiones',
    element: (
      <ProtectedRoute>
        <VersionRecetasPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/recetas/ver/:codigoVersion',
    element: (
      <ProtectedRoute>
        <VisualizarRecetaPage />
      </ProtectedRoute>
    ),
  },

  // --- Redirecciones ---
  {
    path: '/',
    element: <Navigate to="/inicio" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/inicio" replace />,
  },
];

export default routes;
