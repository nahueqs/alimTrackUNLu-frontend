import React from 'react';
import { Card, Input, Button, Space, Typography, Divider } from 'antd';
import { DeleteOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { DraftSection } from './types';
import { TipoDatoCampo } from '../types/TipoDatoCampo';
import { GroupEditor } from './GroupEditor';
import { TableEditor } from './TableEditor';
import { useIsMobile } from '@/hooks/useIsMobile';

interface SectionEditorProps {
  section: DraftSection;
  onUpdate: (updates: Partial<DraftSection>) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  
  // Fields
  onAddField: () => void;
  onUpdateField: (fieldId: string, updates: any) => void;
  onRemoveField: (fieldId: string) => void;
  onMoveField: (fieldId: string, direction: 'up' | 'down') => void;
  
  // Groups
  onAddGroup: () => void;
  onUpdateGroup: (groupId: string, updates: any) => void;
  onRemoveGroup: (groupId: string) => void;
  onMoveGroup: (groupId: string, direction: 'up' | 'down') => void;
  onAddFieldToGroup: (groupId: string) => void;
  onUpdateGroupField: (groupId: string, fieldId: string, updates: any) => void;
  onRemoveGroupField: (groupId: string, fieldId: string) => void;
  onMoveGroupField: (groupId: string, fieldId: string, direction: 'up' | 'down') => void;

  // Tables
  onAddTable: () => void;
  onUpdateTable: (tableId: string, updates: any) => void;
  onRemoveTable: (tableId: string) => void;
  onMoveTable: (tableId: string, direction: 'up' | 'down') => void;
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
  onMove,
  onAddField,
  onUpdateField,
  onRemoveField,
  onMoveField,
  onAddGroup,
  onUpdateGroup,
  onRemoveGroup,
  onMoveGroup,
  onAddFieldToGroup,
  onUpdateGroupField,
  onRemoveGroupField,
  onMoveGroupField,
  onAddTable,
  onUpdateTable,
  onRemoveTable,
  onMoveTable,
  onAddColumnToTable,
  onUpdateColumn,
  onRemoveColumn,
  onAddRowToTable,
  onUpdateRow,
  onRemoveRow
}) => {
  const isMobile = useIsMobile();

  return (
    <Card 
      size="small"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Typography.Text strong>Sección:</Typography.Text>
          <Input 
            value={section.titulo} 
            onChange={(e) => onUpdate({ titulo: e.target.value })}
            style={{ width: isMobile ? '100%' : '300px', fontWeight: 'bold' }}
            placeholder="Ingrese el título de la sección"
          />
        </div>
      }
      extra={
        <Space size={isMobile ? 4 : 8}>
            <Button icon={<ArrowUpOutlined />} onClick={() => onMove('up')} />
            <Button icon={<ArrowDownOutlined />} onClick={() => onMove('down')} />
            <Button danger icon={<DeleteOutlined />} onClick={onDelete}>{!isMobile && 'Eliminar'}</Button>
        </Space>
      }
      style={{ marginBottom: '1rem', borderLeft: '4px solid #1890ff' }}
      bodyStyle={{ padding: isMobile ? '8px' : '24px' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        
        {/* Campos Simples */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f2f5', padding: '8px', borderRadius: '4px' }}>
            <Typography.Text strong>Campos Simples</Typography.Text>
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={onAddField}>{isMobile ? 'Agregar' : 'Agregar Campo'}</Button>
        </div>
        
        {section.campos.length > 0 ? (
            <div style={{ display: 'grid', gap: '8px', padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                {section.campos.map((campo, index) => (
                    <div key={campo.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: '4px', flexDirection: isMobile ? 'column' : 'row' }}>
                        <div style={{ display: 'flex', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-start', alignItems: 'center' }}>
                            <Space size={2}>
                                <Button size="small" type="text" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => onMoveField(campo.id, 'up')} />
                                <Button size="small" type="text" icon={<ArrowDownOutlined />} disabled={index === section.campos.length - 1} onClick={() => onMoveField(campo.id, 'down')} />
                            </Space>
                            {isMobile && <Button danger icon={<DeleteOutlined />} onClick={() => onRemoveField(campo.id)} />}
                        </div>
                        
                        <Input 
                            addonBefore={!isMobile && "Nombre:"}
                            value={campo.nombre} 
                            onChange={(e) => onUpdateField(campo.id, { nombre: e.target.value })}
                            placeholder="Nombre del campo"
                            style={{ flex: 2, width: '100%' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: isMobile ? '100%' : 'auto' }}>
                            <Typography.Text type="secondary" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>Tipo:</Typography.Text>
                            <select 
                                value={campo.tipoDato}
                                onChange={(e) => onUpdateField(campo.id, { tipoDato: e.target.value as TipoDatoCampo })}
                                style={{ padding: '4px', borderRadius: '4px', border: '1px solid #d9d9d9', height: '32px', flex: 1, width: isMobile ? '100%' : 'auto' }}
                            >
                                {Object.values(TipoDatoCampo).map(tipo => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                        </div>
                        {!isMobile && <Button danger icon={<DeleteOutlined />} onClick={() => onRemoveField(campo.id)} />}
                    </div>
                ))}
            </div>
        ) : (
            <div style={{ padding: '16px', textAlign: 'center', border: '1px dashed #d9d9d9', borderRadius: '4px' }}>
                <Typography.Text type="secondary">No hay campos simples en esta sección.</Typography.Text>
            </div>
        )}

        <Divider style={{ margin: '12px 0' }} />

        {/* Grupos */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f2f5', padding: '8px', borderRadius: '4px' }}>
            <Typography.Text strong>Grupos de Campos</Typography.Text>
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={onAddGroup}>{isMobile ? 'Agregar' : 'Agregar Grupo'}</Button>
        </div>
        
        {section.grupos.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {section.grupos.map((group, index) => (
                    <div key={group.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '2px', paddingTop: '8px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
                            <Button size="small" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => onMoveGroup(group.id, 'up')} />
                            <Button size="small" icon={<ArrowDownOutlined />} disabled={index === section.grupos.length - 1} onClick={() => onMoveGroup(group.id, 'down')} />
                        </div>
                        <div style={{ flex: 1, width: '100%' }}>
                            <GroupEditor 
                                group={group}
                                onUpdate={(updates) => onUpdateGroup(group.id, updates)}
                                onDelete={() => onRemoveGroup(group.id)}
                                onAddField={() => onAddFieldToGroup(group.id)}
                                onUpdateField={(fieldId, updates) => onUpdateGroupField(group.id, fieldId, updates)}
                                onRemoveField={(fieldId) => onRemoveGroupField(group.id, fieldId)}
                                onMoveField={(fieldId, direction) => onMoveGroupField(group.id, fieldId, direction)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div style={{ padding: '16px', textAlign: 'center', border: '1px dashed #d9d9d9', borderRadius: '4px' }}>
                <Typography.Text type="secondary">No hay grupos de campos en esta sección.</Typography.Text>
            </div>
        )}

        <Divider style={{ margin: '12px 0' }} />

        {/* Tablas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f2f5', padding: '8px', borderRadius: '4px' }}>
            <Typography.Text strong>Tablas</Typography.Text>
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={onAddTable}>{isMobile ? 'Agregar' : 'Agregar Tabla'}</Button>
        </div>

        {section.tablas.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {section.tablas.map((table, index) => (
                    <div key={table.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '2px', paddingTop: '8px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
                            <Button size="small" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => onMoveTable(table.id, 'up')} />
                            <Button size="small" icon={<ArrowDownOutlined />} disabled={index === section.tablas.length - 1} onClick={() => onMoveTable(table.id, 'down')} />
                        </div>
                        <div style={{ flex: 1, width: '100%' }}>
                            <TableEditor
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
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div style={{ padding: '16px', textAlign: 'center', border: '1px dashed #d9d9d9', borderRadius: '4px' }}>
                <Typography.Text type="secondary">No hay tablas en esta sección.</Typography.Text>
            </div>
        )}

      </Space>
    </Card>
  );
};
