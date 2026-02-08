import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { DraftMetadata } from './types';
import type { RecetaMetadataResponseDTO, RecetaCreateDTO } from '@/types/production/RecetaPadreDTOs';

interface MetadataEditorProps {
  metadata: DraftMetadata;
  onChange: (field: keyof DraftMetadata, value: string) => void;
  recetasPadre: RecetaMetadataResponseDTO[];
  onCreateRecetaPadre: (data: RecetaCreateDTO) => Promise<RecetaMetadataResponseDTO>;
  currentUserEmail: string;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({ 
  metadata, 
  onChange, 
  recetasPadre, 
  onCreateRecetaPadre,
  currentUserEmail
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setCreating(true);
      const newReceta = await onCreateRecetaPadre({
        ...values,
        emailCreador: currentUserEmail
      });
      message.success('Receta padre creada exitosamente');
      onChange('codigoRecetaPadre', newReceta.codigoReceta);
      // Si el nombre de la versión está vacío, podríamos sugerir uno, pero mejor no tocar
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      // Error manejado por el servicio o validación de form
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card title="Información General" style={{ marginBottom: '1rem' }}>
      <Form layout="vertical">
        <Form.Item label="Receta Padre" required>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Select
              value={metadata.codigoRecetaPadre || undefined}
              onChange={(value) => onChange('codigoRecetaPadre', value)}
              placeholder="Seleccione una receta padre"
              style={{ flex: 1 }}
              showSearch
              optionFilterProp="children"
            >
              {recetasPadre.map(r => (
                <Select.Option key={r.codigoReceta} value={r.codigoReceta}>
                  {r.nombre} ({r.codigoReceta})
                </Select.Option>
              ))}
            </Select>
            <Button icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
              Nueva
            </Button>
          </div>
        </Form.Item>

        <Form.Item label="Nombre de la Versión" required>
          <Input 
            value={metadata.nombre} 
            onChange={(e) => onChange('nombre', e.target.value)} 
            placeholder="Ej: Versión Verano 2024"
          />
        </Form.Item>
        
        <Form.Item label="Código de Versión" required>
          <Input 
            value={metadata.codigoVersion} 
            onChange={(e) => onChange('codigoVersion', e.target.value)} 
            placeholder="Ej: V1.0"
          />
        </Form.Item>
        
        <Form.Item label="Descripción de la Versión">
          <Input.TextArea 
            value={metadata.descripcion} 
            onChange={(e) => onChange('descripcion', e.target.value)} 
            rows={3}
          />
        </Form.Item>
      </Form>

      <Modal
        title="Crear Nueva Receta Padre"
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
    </Card>
  );
};
