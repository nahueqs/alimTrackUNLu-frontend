import React from 'react';
import { DashboardCard } from './DashboardCard.tsx';
import { Button } from '@/components/ui';

// 1. Las props ahora describen eventos, no acciones.
interface ProductionsCardProps {
  onAddNew: () => void;
  onViewActive: () => void;
  onViewAll: () => void;
}

export const ProductionsCard: React.FC<ProductionsCardProps> = ({
  onAddNew,
  onViewActive,
  onViewAll,
}) => {
  return (
    <DashboardCard
      title="Producciones"
      description="Gestiona las producciones."
    >
      {/* 2. Cada botón llama a su propio evento semántico. */}
      <Button onClick={onAddNew}>Iniciar producción</Button>

      <Button variant={'secondary'} onClick={onViewActive}>
        Ver producciones activas
      </Button>

      <Button variant={'secondary'} onClick={onViewAll}>
        Ver todas las producciones
      </Button>
    </DashboardCard>
  );
};
