import React from 'react';
import { DashboardCard } from './DashboardCard.tsx';
import { Button } from '@/components/ui';

// 1. Las props ahora describen eventos, no acciones de navegación.
interface RecetasCardProps {
  onAddNew: () => void;
  onViewAll: () => void;
}

export const RecetasCard: React.FC<RecetasCardProps> = ({ onAddNew, onViewAll }) => {
  return (
    <DashboardCard
      title="Recetas"
      description="Administra las recetas y sus versiones. Crea nuevas recetas o modifica las existentes."
      variant="default"
      hoverEffect={true}
    >
      {/* 2. Cada botón llama a su propio evento semántico. */}
      <Button onClick={onAddNew}>Crear Receta</Button>

      <Button variant={'secondary'} onClick={onViewAll}>
        Ver Listado de recetas
      </Button>
    </DashboardCard>
  );
};
