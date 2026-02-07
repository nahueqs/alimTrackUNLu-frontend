import React from 'react';
import { Card, Input, Button, Space, Typography, Divider } from 'antd';
import { DeleteOutlined, PlusOutlined, DragOutlined } from '@ant-design/icons';
import type { DraftSection } from './types';
import { TipoDatoCampo } from '../types/TipoDatoCampo';
import { GroupEditor } from './GroupEditor';
import { TableEditor } from './TableEditor';

interface SectionEditorProps {
  section: DraftSection;
  onUpdate: (updates: Partial<DraftSection>) => void;
  onDelete: () => void;
  
  // Fields
  onAddField: () => void;
  onUpdateField: (fieldId: string, updates: any) => void;
  onRemoveField: (fieldId: string) => void;
  
  // Groups
  onAddGroup: () => void;
  onUpdateGroup: (groupId: string, updates: any) => void;
  onRemoveGroup: (groupId: string) => void;
  onAddFieldToGroup: (groupId: string) => void;
  onUpdateGroupField: (groupId: string, fieldId: string, updates: any) => void;
  onRemoveGroupField: (groupId: string, fieldId: string) => void;

  // Tables
  onAddTable: () => void;
  onUpdateTable: (tableId: string, updates: any) => void;
  onRemoveTable: (tableId: string) => void;
  onAddColumnToTable: (tableId: string) => void;
  onUpdateColumn: (tableId: string, colId: string, updates: any) => void;
  onRemoveColumn: (tableId: string, colId: string) => void;
  onAddRowToTable: (tableId: string) => void;
  onUpdateRow: (tableId: string, rowId: string, updates: any) => void;
  onRemoveRow: (tableId: string, rowId: string) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onUpdate,
  onDelete,
  onAddField,
  onUpdateField,
  onRemoveField,
  onAddGroup,
  onUpdateGroup,
  onRemoveGroup,
  onAddFieldToGroup,
  onUpdateGroupField,
  onRemoveGroupField,
  onAddTable,
  onUpdateTable,
  onRemoveTable,
  onAddColumnToTable,
  onUpdateColumn,
  onRemoveColumn,
  onAddRowToTable,
  onUpdateRow,
  onRemoveRow
}) => {
  return (
    <Card 
      size="small"
      title={
        <Input 
          value={section.titulo} 
          onChange={(e) => onUpdate({ titulo: e.target.value })}
          style={{ width: '300px', fontWeight: 'bold' }}
          bordered={false}
          placeholder="Título de la Sección"
        />
      }
      extra={
        <Button type="text" danger icon={<DeleteOutlined />} onClick={onDelete} />
      }
      style={{ marginBottom: '1rem', borderLeft: '4px solid #1890ff' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        
        {/* Campos Simples */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Text strong>Campos Simples</Typography.Text>
            <Button size="small" icon={<PlusOutlined />} onClick={onAddField}>Agregar Campo</Button>
        </div>
        
        {section.campos.length > 0 ? (
            <div style={{ display: 'grid', gap: '8px' }}>
                {section.campos.map(campo => (
                    <div key={campo.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px', background: '#fafafa', borderRadius: '4px' }}>
                        <DragOutlined style={{ color: '#999', cursor: 'move' }} />
                        <Input 
                            value={campo.nombre} 
                            onChange={(e) => onUpdateField(campo.id, { nombre: e.target.value })}
                            placeholder="Nombre del campo"
                            style={{ flex: 2 }}
                        />
                        <select 
                            value={campo.tipoDato}
                            onChange={(e) => onUpdateField(campo.id, { tipoDato: e.target.value as TipoDatoCampo })}
                            style={{ padding: '4px', borderRadius: '4px', border: '1px solid #d9d9d9', flex: 1 }}
                        >
                            {Object.values(TipoDatoCampo).map(tipo => (
                                <option key={tipo} value={tipo}>{tipo}</option>
                            ))}
                        </select>
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onRemoveField(campo.id)} />
                    </div>
                ))}
            </div>
        ) : (
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>No hay campos simples.</Typography.Text>
        )}

        <Divider style={{ margin: '12px 0' }} />

        {/* Grupos */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Text strong>Grupos de Campos</Typography.Text>
            <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={onAddGroup}>Agregar Grupo</Button>
        </div>
        
        {section.grupos.map(group => (
            <GroupEditor 
                key={group.id}
                group={group}
                onUpdate={(updates) => onUpdateGroup(group.id, updates)}
                onDelete={() => onRemoveGroup(group.id)}
                onAddField={() => onAddFieldToGroup(group.id)}
                onUpdateField={(fieldId, updates) => onUpdateGroupField(group.id, fieldId, updates)}
                onRemoveField={(fieldId) => onRemoveGroupField(group.id, fieldId)}
            />
        ))}

        <Divider style={{ margin: '12px 0' }} />

        {/* Tablas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Text strong>Tablas</Typography.Text>
            <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={onAddTable}>Agregar Tabla</Button>
        </div>

        {section.tablas.map(table => (
            <TableEditor
                key={table.id}
                table={table}
                onUpdate={(updates) => onUpdateTable(table.id, updates)}
                onDelete={() => onRemoveTable(table.id)}
                onAddColumn={() => onAddColumnToTable(table.id)}
                onUpdateColumn={(colId, updates) => onUpdateColumn(table.id, colId, updates)}
                onRemoveColumn={(colId) => onRemoveColumn(table.id, colId)}
                onAddRow={() => onAddRowToTable(table.id)}
                onUpdateRow={(rowId, updates) => onUpdateRow(table.id, rowId, updates)}
                onRemoveRow={(rowId) => onRemoveRow(table.id, rowId)}
            />
        ))}

      </Space>
    </Card>
  );
};
