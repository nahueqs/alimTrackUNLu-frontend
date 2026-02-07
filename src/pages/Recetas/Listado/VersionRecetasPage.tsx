import React, { useEffect, useState } from 'react';
import { AppHeader } from '@/components/AppHeader/AppHeader.tsx';
import { CustomTable } from '@/components/ui/CustomTable/CustomTable.tsx';
import { getColumns } from './ListadoVersionRecetaColumnas.tsx';
import { useNavigate } from 'react-router-dom';
import { useVersionRecetaService } from '@/services/recetas/useVersionRecetaService.ts';
import { useIsMobile } from '@/hooks/useIsMobile.ts';
import { usePageTitle } from '@/hooks/usePageTitle.ts';
import { Button } from '@/components/ui';
import { ArrowLeftIcon } from 'lucide-react';

export const VersionRecetasPage: React.FC = () => {
  usePageTitle('Versiones de Recetas');
  const { versiones, loading, error, getAllVersiones } = useVersionRecetaService();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getAllVersiones();
  }, [getAllVersiones]);

  const handleDelete = (id: string) => {
    console.log('Eliminar versión', id);
    // Implementar lógica de eliminación
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const filteredVersiones = versiones.filter(
    (v) =>
      v.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.codigoVersionReceta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.codigoRecetaPadre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = getColumns({
    onDelete: handleDelete,
    isMobile,
  });

  return (
    <div className="dashboard">
      <AppHeader title="AlimTrack" />
      <main className="dashboard__main container">
        <div className="productions-list__header" style={{ marginTop: '1.5rem', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
          <Button icon={<ArrowLeftIcon />} onClick={handleBack} variant={'secondary'}>
            Volver al Dashboard
          </Button>
          <h1 className="productions-list__title">Versiones de Recetas</h1>
          {/* Aquí podrías agregar un botón de "Nueva Versión" si fuera necesario */}
        </div>

        {/* Barra de búsqueda simple */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={handleSearch}
            style={{
              padding: '0.5rem',
              width: '100%',
              maxWidth: '400px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </div>

        <div className="productions-list__content">
          <CustomTable
            columns={columns}
            dataSource={filteredVersiones}
            loading={loading}
            rowKey="codigoVersionReceta"
            locale={{
              emptyText: error ? 'Error al cargar las versiones' : 'No se encontraron versiones',
            }}
          />
        </div>
      </main>
    </div>
  );
};
