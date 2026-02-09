import React from 'react';
import { DashboardCard } from './DashboardCard.tsx';
import { Button } from '@/components/ui';
import { Link } from 'react-router-dom';
import { FileTextOutlined } from '@ant-design/icons';

export const RecetasCard: React.FC = () => {
  return (
    <DashboardCard
      title="Recetas"
      description="Administra las recetas, versiones y estructuras."
      variant="default"
      hoverEffect={true}
      icon={<FileTextOutlined style={{ fontSize: '24px', color: 'var(--primary-500)' }} />}
    >
      <Link to="/recetas/nueva" style={{ textDecoration: 'none', width: '100%' }}>
        <Button style={{ width: '100%' }}>Crear Versión de Receta</Button>
      </Link>

      <Link to="/recetas" style={{ textDecoration: 'none', width: '100%' }}>
        <Button variant={'secondary'} style={{ width: '100%' }}>
          Ver Recetas Base
        </Button>
      </Link>

      <Link to="/recetas/versiones" style={{ textDecoration: 'none', width: '100%' }}>
        <Button variant={'secondary'} style={{ width: '100%' }}>
          Ver Versiones de Recetas
        </Button>
      </Link>
    </DashboardCard>
  );
};
