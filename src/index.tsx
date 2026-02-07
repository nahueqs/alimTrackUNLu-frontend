import { Navigate, type RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/context/auth/ProtectedRoute.tsx';
import { PublicRoute } from '@/context/auth/PublicRoute.tsx';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage.tsx';
import LoginPage from '@/pages/Auth/LoginPage.tsx';
import { NuevaProduccionPage } from '@/pages/Producciones/Nueva/NuevaProduccionPage.tsx';
import ProductionsResultPage from '@/pages/Producciones/ListadoProtected/ProduccionesPage.tsx';
import DetalleProduccionPublicPage from '@/pages/Public/Detalle/DetalleProduccionPublicPage.tsx';
import DetalleProduccionProtectedPage from '@/pages/Producciones/Detalle/DetalleProduccionProtectedPage.tsx';
import { ListadoProducciones } from '@/pages/Public/ListadoPublic/ListadoProducciones.tsx';
import { VersionRecetasPage } from '@/pages/Recetas/Listado/VersionRecetasPage.tsx';
import { VisualizarRecetaPage } from '@/pages/Recetas/Detalle/VisualizarRecetaPage.tsx';
import { RecipeBuilderPage } from '@/pages/Recetas/Builder/RecipeBuilderPage.tsx';
import { ProductionState } from '@/constants/ProductionStates';
import type { LocalProductionFilters } from '@/pages/Producciones/ListadoProtected/ProduccionFilters.tsx';

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
        {' '}
        {/* This PublicRoute is correct for login, redirects if authenticated */}
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/public/producciones',
    element: (
      // Removed PublicRoute wrapper to allow authenticated users to view this page
      <ListadoProducciones />
    ),
  },
  {
    path: '/public/producciones/ver/:codigoProduccion',
    element: (
      // Removed PublicRoute wrapper to allow authenticated users to view this page
      <DetalleProduccionPublicPage />
    ),
  },

  // --- Rutas Protegidas ---
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
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
    path: '/producciones/ver/:codigoProduccion', // Nueva ruta protegida
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
  {
    path: '/recetas/nueva',
    element: (
      <ProtectedRoute>
        <RecipeBuilderPage />
      </ProtectedRoute>
    ),
  },

  // --- Redirecciones ---
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];

export default routes;
