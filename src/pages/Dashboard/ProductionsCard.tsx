import React from 'react';
import { DashboardCard } from './DashboardCard.tsx';
import { Button } from '@/components/ui';
import { Link } from 'react-router-dom';
import { ExperimentOutlined } from '@ant-design/icons';

export const ProductionsCard: React.FC = () => {
  return (
    <DashboardCard
      title="Producciones"
      description="Gestiona las producciones en curso y el historial."
      icon={<ExperimentOutlined style={{ fontSize: '24px', color: 'var(--primary-500)' }} />}
    >
      <Link to="/producciones/nueva" style={{ textDecoration: 'none', width: '100%' }}>
        <Button style={{ width: '100%' }}>Iniciar producción</Button>
      </Link>

      <Link to="/producciones/activas" style={{ textDecoration: 'none', width: '100%' }}>
        <Button variant={'secondary'} style={{ width: '100%' }}>
          Ver producciones activas
        </Button>
      </Link>

      <Link to="/producciones" style={{ textDecoration: 'none', width: '100%' }}>
        <Button variant={'secondary'} style={{ width: '100%' }}>
          Ver todas las producciones
        </Button>
      </Link>
    </DashboardCard>
  );
};
