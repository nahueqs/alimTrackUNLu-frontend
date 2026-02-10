import React, { useEffect, useState } from 'react';
import { AppHeader } from '@/components/AppHeader/AppHeader.tsx';
import { CustomTable } from '@/components/ui/CustomTable/CustomTable.tsx';
import { getColumns } from './ListadoVersionRecetaColumnas.tsx';
import { useNavigate } from 'react-router-dom';
import { useVersionRecetaService } from '@/services/recetas/useVersionRecetaService.ts';
import { useIsMobile } from '@/hooks/useIsMobile.ts';
import { usePageTitle } from '@/hooks/usePageTitle.ts';
import { Button } from '@/components/ui';
import { ArrowLeftIcon, PlusIcon } from 'lucide-react';
import { message, Modal } from 'antd';
import './VersionRecetasPage.css';

export const VersionRecetasPage: React.FC = () => {
  usePageTitle('Versiones de Recetas');
  const { versiones, loading, error, getAllVersiones, deleteVersion } = useVersionRecetaService();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getAllVersiones();
  }, [getAllVersiones]);

  const handleDelete = (codigoVersion: string) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta versión?',
      content: `Se eliminará la versión con código: ${codigoVersion}. Esta acción no se puede deshacer.`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await deleteVersion(codigoVersion);
          message.success(`Versión ${codigoVersion} eliminada exitosamente`);
        } catch (err: any) {
          console.error('Error al eliminar versión:', err);
          message.error(err.message || 'Error al eliminar la versión');
        }
      },
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleBack = () => {
    navigate('/inicio');
  };

  const handleCreate = () => {
    navigate('/recetas/nueva');
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
            Volver al Inicio
          </Button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 className="productions-list__title">Versiones de Recetas</h1>
            <Button icon={<PlusIcon />} onClick={handleCreate}>
              Crear Receta
            </Button>
          </div>
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
