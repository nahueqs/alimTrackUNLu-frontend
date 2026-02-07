import React from 'react';
import { DashboardCard } from './DashboardCard.tsx';
import { Button } from '@/components/ui';
import { Link } from 'react-router-dom';

export const ProductionsCard: React.FC = () => {
  return (
    <DashboardCard
      title="Producciones"
      description="Gestiona las producciones."
    >
      {/* 2. Usamos Link para navegación semántica, pero mantenemos el estilo de botón */}
      <Link to="/producciones/nueva" style={{ textDecoration: 'none' }}>
        <Button style={{ width: '100%' }}>Iniciar producción</Button>
      </Link>

      <Link to="/producciones?estado=EN_PROCESO" style={{ textDecoration: 'none' }}>
        <Button variant={'secondary'} style={{ width: '100%' }}>
          Ver producciones activas
        </Button>
      </Link>

      <Link to="/producciones" style={{ textDecoration: 'none' }}>
        <Button variant={'secondary'} style={{ width: '100%' }}>
          Ver todas las producciones
        </Button>
      </Link>
    </DashboardCard>
  );
};
