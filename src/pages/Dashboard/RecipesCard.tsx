import React from 'react';
import { DashboardCard } from './DashboardCard.tsx';
import { Button } from '@/components/ui';
import { Link } from 'react-router-dom';

export const RecetasCard: React.FC = () => {
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
