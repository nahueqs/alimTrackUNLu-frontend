import React from 'react';
import { Card, Input, Button, Space, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { DraftGroup } from './types';
import { TipoDatoCampo } from '../types/TipoDatoCampo';

interface GroupEditorProps {
  group: DraftGroup;
  onUpdate: (updates: Partial<DraftGroup>) => void;
  onDelete: () => void;
  onAddField: () => void;
  onUpdateField: (fieldId: string, updates: any) => void;
  onRemoveField: (fieldId: string) => void;
  onMoveField: (fieldId: string, direction: 'up' | 'down') => void;
}

export const GroupEditor: React.FC<GroupEditorProps> = ({
  group,
  onUpdate,
  onDelete,
  onAddField,
  onUpdateField,
  onRemoveField,
  onMoveField
}) => {
  return (
    <Card
      size="small"
      type="inner"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography.Text>Grupo:</Typography.Text>
          <Input
            value={group.subtitulo}
            onChange={(e) => onUpdate({ subtitulo: e.target.value })}
            placeholder="Ingrese el nombre del grupo"
            style={{ fontWeight: 500, width: '250px' }}
          />
        </div>
      }
      extra={<Button danger icon={<DeleteOutlined />} onClick={onDelete}>Eliminar Grupo</Button>}
      style={{ marginBottom: '8px', background: '#f9f9f9', border: '1px solid #d9d9d9' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <Typography.Text strong style={{ fontSize: '13px' }}>Campos del Grupo</Typography.Text>
          <Button size="small" type="primary" ghost icon={<PlusOutlined />} onClick={onAddField}>
            Agregar Campo al Grupo
          </Button>
        </div>

        {group.campos.length > 0 ? (
          <div style={{ display: 'grid', gap: '8px' }}>
            {group.campos.map((campo, index) => (
              <div key={campo.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px', background: '#fff', border: '1px solid #eee', borderRadius: '4px' }}>
                <Space size={2}>
                    <Button size="small" type="text" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => onMoveField(campo.id, 'up')} />
                    <Button size="small" type="text" icon={<ArrowDownOutlined />} disabled={index === group.campos.length - 1} onClick={() => onMoveField(campo.id, 'down')} />
                </Space>
                <Input
                  addonBefore="Nombre:"
                  size="small"
                  value={campo.nombre}
                  onChange={(e) => onUpdateField(campo.id, { nombre: e.target.value })}
                  placeholder="Nombre campo"
                  style={{ flex: 2 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Typography.Text type="secondary" style={{ fontSize: '11px' }}>Tipo:</Typography.Text>
                    <select
                      value={campo.tipoDato}
                      onChange={(e) => onUpdateField(campo.id, { tipoDato: e.target.value as TipoDatoCampo })}
                      style={{ padding: '2px', borderRadius: '4px', border: '1px solid #d9d9d9', fontSize: '12px', height: '24px' }}
                    >
                      {Object.values(TipoDatoCampo).map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                </div>
                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onRemoveField(campo.id)} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '12px', textAlign: 'center', background: '#fff', border: '1px dashed #eee', borderRadius: '4px' }}>
            <Typography.Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
              Sin campos en este grupo. Agregue uno para comenzar.
            </Typography.Text>
          </div>
        )}
      </Space>
    </Card>
  );
};
