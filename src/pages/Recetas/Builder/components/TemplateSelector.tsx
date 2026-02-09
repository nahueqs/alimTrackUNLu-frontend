import React, { useEffect, useState } from 'react';
import { Modal, Select, Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useVersionRecetaService } from '@/services/recetas/useVersionRecetaService';
import { mapEstructuraToDraft } from '../utils/mapEstructuraToDraft';
import type { DraftRecipe } from '../types';

interface TemplateSelectorProps {
  onLoadTemplate: (draft: DraftRecipe) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onLoadTemplate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const { versiones, getAllVersiones, getEstructuraCompleta, loading } = useVersionRecetaService();
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      getAllVersiones();
    }
  }, [isModalOpen, getAllVersiones]);

  const handleLoad = async () => {
    if (!selectedVersion) return;

    setLoadingTemplate(true);
    try {
      const estructura = await getEstructuraCompleta(selectedVersion);
      if (estructura) {
        const draft = mapEstructuraToDraft(estructura);
        onLoadTemplate(draft);
        message.success('Plantilla cargada exitosamente');
        setIsModalOpen(false);
      }
    } catch (error) {
      message.error('Error al cargar la plantilla');
    } finally {
      setLoadingTemplate(false);
    }
  };

  return (
    <>
      <Button 
        icon={<CopyOutlined />} 
        onClick={() => setIsModalOpen(true)}
      >
        Copiar de Plantilla
      </Button>

      <Modal
        title="Copiar Estructura de Receta Existente"
        open={isModalOpen}
        onOk={handleLoad}
        onCancel={() => setIsModalOpen(false)}
        okText="Cargar"
        cancelText="Cancelar"
        confirmLoading={loadingTemplate}
        okButtonProps={{ disabled: !selectedVersion }}
      >
        <p>Seleccione una versión existente para usar como base. Se copiarán todas las secciones, grupos y tablas.</p>
        <Select
          showSearch
          style={{ width: '100%' }}
          placeholder="Buscar receta..."
          optionFilterProp="children"
          onChange={setSelectedVersion}
          loading={loading}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={versiones.map(v => ({
            value: v.codigoVersionReceta,
            label: `${v.nombre} (${v.codigoVersionReceta})`
          }))}
        />
      </Modal>
    </>
  );
};
