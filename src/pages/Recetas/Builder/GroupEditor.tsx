import React from 'react';
import { Card, Input, Button, Space, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined, DragOutlined } from '@ant-design/icons';
import type { DraftGroup } from './types';
import { TipoDatoCampo } from '../types/TipoDatoCampo';

interface GroupEditorProps {
  group: DraftGroup;
  onUpdate: (updates: Partial<DraftGroup>) => void;
  onDelete: () => void;
  onAddField: () => void;
  onUpdateField: (fieldId: string, updates: any) => void;
  onRemoveField: (fieldId: string) => void;
}

export const GroupEditor: React.FC<GroupEditorProps> = ({
  group,
  onUpdate,
  onDelete,
  onAddField,
  onUpdateField,
  onRemoveField
}) => {
  return (
    <Card
      size="small"
      type="inner"
      title={
        <Input
          value={group.subtitulo}
          onChange={(e) => onUpdate({ subtitulo: e.target.value })}
          placeholder="Subtítulo del Grupo"
          bordered={false}
          style={{ fontWeight: 500 }}
        />
      }
      extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={onDelete} />}
      style={{ marginBottom: '8px', background: '#f9f9f9' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>Campos del Grupo</Typography.Text>
          <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={onAddField}>
            Campo
          </Button>
        </div>

        {group.campos.length > 0 ? (
          <div style={{ display: 'grid', gap: '8px' }}>
            {group.campos.map((campo) => (
              <div key={campo.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '4px', background: '#fff', border: '1px solid #eee', borderRadius: '4px' }}>
                <DragOutlined style={{ color: '#ccc', cursor: 'move', fontSize: '12px' }} />
                <Input
                  size="small"
                  value={campo.nombre}
                  onChange={(e) => onUpdateField(campo.id, { nombre: e.target.value })}
                  placeholder="Nombre campo"
                  style={{ flex: 2 }}
                />
                <select
                  value={campo.tipoDato}
                  onChange={(e) => onUpdateField(campo.id, { tipoDato: e.target.value as TipoDatoCampo })}
                  style={{ padding: '2px', borderRadius: '4px', border: '1px solid #d9d9d9', flex: 1, fontSize: '12px' }}
                >
                  {Object.values(TipoDatoCampo).map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
                <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => onRemoveField(campo.id)} />
              </div>
            ))}
          </div>
        ) : (
          <Typography.Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
            Sin campos en este grupo.
          </Typography.Text>
        )}
      </Space>
    </Card>
  );
};
