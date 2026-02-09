import React, { useEffect, useState } from 'react';
import { AppHeader } from '@/components/AppHeader/AppHeader.tsx';
import { CustomTable } from '@/components/ui/CustomTable/CustomTable.tsx';
import { getRecetasPadreColumns } from './RecetasPadreColumns.tsx';
import { useNavigate } from 'react-router-dom';
import { useRecetaPadreService } from '@/services/recetas/useRecetaPadreService.ts';
import { useIsMobile } from '@/hooks/useIsMobile.ts';
import { usePageTitle } from '@/hooks/usePageTitle.ts';
import { Button } from '@/components/ui';
import { ArrowLeftIcon, PlusIcon } from 'lucide-react';
import { message, Modal, Form, Input } from 'antd';
import { useAuth } from '@/context/auth/AuthProvider';

export const RecetasPadrePage: React.FC = () => {
  usePageTitle('Recetas');
  const { recetas, loading, error, getAllRecetas, createReceta, deleteReceta } = useRecetaPadreService();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    getAllRecetas();
  }, [getAllRecetas]);

  const handleDelete = (codigoReceta: string) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta receta base?',
      content: `Se eliminará la receta con código: ${codigoReceta}. Esta acción no se puede deshacer y podría afectar a versiones existentes.`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await deleteReceta(codigoReceta);
          message.success(`Receta ${codigoReceta} eliminada exitosamente`);
        } catch (err: any) {
          console.error('Error al eliminar receta:', err);
          // El hook ya maneja el error en el estado, pero mostramos mensaje si es necesario
        }
      },
    });
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setCreating(true);
      await createReceta({
        ...values,
        emailCreador: user?.email || 'desconocido'
      });
      message.success('Receta creada exitosamente');
      setIsModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      console.error('Error al crear receta:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleBack = () => {
    navigate('/inicio');
  };

  const filteredRecetas = recetas.filter(
    (r) =>
      r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.codigoReceta.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = getRecetasPadreColumns({
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
            <h1 className="productions-list__title">Recetas Base</h1>
            <Button icon={<PlusIcon />} onClick={() => setIsModalOpen(true)}>
              Nueva Receta Base
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
            dataSource={filteredRecetas}
            loading={loading}
            rowKey="codigoReceta"
            locale={{
              emptyText: error ? 'Error al cargar las recetas' : 'No se encontraron recetas',
            }}
          />
        </div>

        <Modal
            title="Crear Nueva Receta Base"
            open={isModalOpen}
            onOk={handleCreate}
            onCancel={() => setIsModalOpen(false)}
            confirmLoading={creating}
            okText="Crear"
            cancelText="Cancelar"
        >
            <Form form={form} layout="vertical">
            <Form.Item
                name="codigoReceta"
                label="Código de Receta"
                rules={[
                { required: true, message: 'El código es obligatorio' },
                { min: 2, max: 255, message: 'Debe tener entre 2 y 255 caracteres' }
                ]}
            >
                <Input placeholder="Ej: REC-DL-001" />
            </Form.Item>
            <Form.Item
                name="nombre"
                label="Nombre"
                rules={[
                { required: true, message: 'El nombre es obligatorio' },
                { min: 2, max: 255, message: 'Debe tener entre 2 y 255 caracteres' }
                ]}
            >
                <Input placeholder="Ej: Dulce de Leche" />
            </Form.Item>
            <Form.Item
                name="descripcion"
                label="Descripción"
                rules={[{ max: 255, message: 'Máximo 255 caracteres' }]}
            >
                <Input.TextArea rows={3} />
            </Form.Item>
            </Form>
        </Modal>
      </main>
    </div>
  );
};
