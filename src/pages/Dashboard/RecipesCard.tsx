import React from 'react';
import { DashboardCard } from './DashboardCard.tsx';
import { Button } from '@/components/ui';
import { Link } from 'react-router-dom';

// 1. Las props ahora describen eventos, no acciones de navegación.
interface RecetasCardProps {
  onAddNew: () => void;
  onViewAll: () => void;
}

export const RecetasCard: React.FC<RecetasCardProps> = () => {
  return (
    <DashboardCard
      title="Recetas"
      description="Administra las recetas y sus versiones. Crea nuevas recetas o modifica las existentes."
      variant="default"
      hoverEffect={true}
    >
      {/* 2. Usamos Link para navegación semántica */}
      <Link to="/recetas/nueva" style={{ textDecoration: 'none' }}>
        <Button style={{ width: '100%' }}>Crear Receta</Button>
      </Link>

      <Link to="/recetas/versiones" style={{ textDecoration: 'none' }}>
        <Button variant={'secondary'} style={{ width: '100%' }}>
          Ver Listado de recetas
        </Button>
      </Link>
    </DashboardCard>
  );
};
