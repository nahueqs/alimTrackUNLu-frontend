import React from 'react';
import { Card, Form, Input } from 'antd';
import { DraftMetadata } from './types';

interface MetadataEditorProps {
  metadata: DraftMetadata;
  onChange: (field: keyof DraftMetadata, value: string) => void;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({ metadata, onChange }) => {
  return (
    <Card title="Información General" style={{ marginBottom: '1rem' }}>
      <Form layout="vertical">
        <Form.Item label="Nombre de la Receta" required>
          <Input 
            value={metadata.nombre} 
            onChange={(e) => onChange('nombre', e.target.value)} 
            placeholder="Ej: Dulce de Leche"
          />
        </Form.Item>
        <Form.Item label="Código de Versión" required>
          <Input 
            value={metadata.codigoVersion} 
            onChange={(e) => onChange('codigoVersion', e.target.value)} 
            placeholder="Ej: V1.0"
          />
        </Form.Item>
        <Form.Item label="Descripción">
          <Input.TextArea 
            value={metadata.descripcion} 
            onChange={(e) => onChange('descripcion', e.target.value)} 
            rows={3}
          />
        </Form.Item>
      </Form>
    </Card>
  );
};
