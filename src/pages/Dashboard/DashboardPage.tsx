import React from 'react';
import { useAuth } from '@/context/auth/AuthProvider.tsx';
import { ProductionsCard } from './ProductionsCard.tsx';
import { RecetasCard } from './RecipesCard.tsx';
import { AppHeader } from '@/components/AppHeader/AppHeader.tsx';
import { usePageTitle } from '@/hooks/usePageTitle.ts';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  usePageTitle('Dashboard');
  const { user } = useAuth();

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
            <ProductionsCard />
            <RecetasCard />
          </div>
        </div>
      </main>
    </div>
  );
};
