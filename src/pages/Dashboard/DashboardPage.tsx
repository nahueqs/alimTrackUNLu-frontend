import React from 'react';
import { useAuth } from '@/context/auth/AuthProvider.tsx';
import { useNavigate } from 'react-router-dom';
import { ProductionsCard } from './ProductionsCard.tsx';
import { RecetasCard } from './RecipesCard.tsx';
import { AppHeader } from '@/components/AppHeader/AppHeader.tsx';
import { usePageTitle } from '@/hooks/usePageTitle.ts';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. El componente padre ahora define la lógica de navegación.
  const handleNavigateToNewProduction = () => navigate('/producciones/nueva');
  const handleNavigateToActiveProductions = () => navigate('/producciones/activas');
  const handleNavigateToAllProductions = () => navigate('/producciones');

  // Lógica para la tarjeta de recetas
  const handleNavigateToNewRecipe = () => navigate('/recetas/nueva');
  const handleNavigateToAllRecipes = () => navigate('/recetas/versiones');

  return (
    <div className="dashboard">
      <AppHeader title="AlimTrack" />

      <main className="dashboard__main container">
        <div className="dashboard__welcome">
          <h1 className="dashboard__welcome-title">¡Bienvenido, {user?.nombre}!</h1>
          <p className="dashboard__welcome-subtitle">
            Sistema de gestión de producciones alimenticias
          </p>

          <div className="dashboard__grid">
            {/* 2. Pasamos las funciones como props a los componentes hijos. */}
            <ProductionsCard
              onAddNew={handleNavigateToNewProduction}
              onViewActive={handleNavigateToActiveProductions}
              onViewAll={handleNavigateToAllProductions}
            />
            <RecetasCard
              onAddNew={handleNavigateToNewRecipe}
              onViewAll={handleNavigateToAllRecipes}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
