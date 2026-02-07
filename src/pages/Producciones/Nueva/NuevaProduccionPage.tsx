import React, { useEffect, useState } from 'react';
import type { ProduccionCreateRequestDTO } from '@/types/production';
import { NuevaProduccionForm } from './NuevaProduccionForm.tsx';
import { message, Spin } from 'antd';
import { useAuth } from '@/context/auth/AuthProvider.tsx';
import { useProductionService } from '@/services/production/useProductionService.ts';
import { useVersionRecetaService } from '@/services/recetas/useVersionRecetaService.ts';
import { AppHeader } from '@/components/AppHeader/AppHeader.tsx';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui';
import { usePageTitle } from '@/hooks/usePageTitle.ts';

export const NuevaProduccionPage: React.FC = () => {
  usePageTitle('Nueva Producción');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const { user } = useAuth();
  const { createProduction } = useProductionService();
  const navigate = useNavigate();

  const {
    loading: loadingVersions,
    versiones: recipeVersions,
    error: versionsError,
    getAllVersiones: refetchVersions,
  } = useVersionRecetaService();

  const hasVersionsError = !!versionsError;

  useEffect(() => {
    refetchVersions();
  }, [refetchVersions]);

  const handleSubmit = async (data: ProduccionCreateRequestDTO) => {
    setLoadingSubmit(true);
    try {
      const dataWithCreator: ProduccionCreateRequestDTO = {
        ...data,
        emailCreador: user?.email || 'desconocido',
      };

      if (import.meta.env.DEV) {
        console.log('[NuevaProduccionPage] Datos a enviar:', dataWithCreator);
      }

      const newProduction = await createProduction(dataWithCreator);
      message.success('Producción creada exitosamente');
      
      if (import.meta.env.DEV) {
        console.log('Producción creada:', newProduction);
      }
      
      // Navegación robusta: usar replace para evitar volver al formulario con "Atrás"
      navigate(`/producciones/ver/${newProduction.codigoProduccion}`, { replace: true });
      
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error al crear la producción:', error);
      }
      
      // Manejo específico de errores comunes
      if (error.message && error.message.includes('Conflicto')) {
         message.error('Ya existe una producción con ese código. Por favor, elige otro.');
      } else if (error.message) {
         message.error(`Error al crear la producción: ${error.message}`);
      } else {
         message.error('Ocurrió un error inesperado al crear la producción.');
      }
      
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (!user) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#ff4d4f', fontSize: '16px' }}>
        No hay usuario logueado. Por favor, inicia sesión.
      </div>
    );
  }

  return (
    <div className="dashboard">
      <AppHeader title="AlimTrack" />
      <main className="dashboard__main container">
        <div className="productions-list__header">
          <Button icon={<ArrowLeftIcon />} onClick={handleBack} variant={'secondary'}>
            Volver al Dashboard
          </Button>
        </div>
        {loadingVersions ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" tip="Cargando versiones de recetas..." />
          </div>
        ) : (
          <NuevaProduccionForm
            onSubmit={handleSubmit}
            loading={loadingSubmit}
            currentUser={user.nombre}
            recipeVersions={recipeVersions}
            hasVersionsError={hasVersionsError}
            refetchVersions={refetchVersions}
          />
        )}
      </main>
    </div>
  );
};
