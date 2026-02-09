import React from 'react';
import { Card, Input, Button, Space, Table, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { DraftTable } from './types';
import { TipoDatoCampo } from '../types/TipoDatoCampo';
import { useIsMobile } from '@/hooks/useIsMobile';

interface TableEditorProps {
  table: DraftTable;
  onUpdate: (updates: Partial<DraftTable>) => void;
  onDelete: () => void;
  onAddColumn: () => void;
  onUpdateColumn: (colId: string, updates: any) => void;
  onRemoveColumn: (colId: string) => void;
  onAddRow: () => void;
  onUpdateRow: (rowId: string, updates: any) => void;
  onRemoveRow: (rowId: string) => void;
}

export const TableEditor: React.FC<TableEditorProps> = ({
  table,
  onUpdate,
  onDelete,
  onAddColumn,
  onUpdateColumn,
  onRemoveColumn,
  onAddRow,
  onUpdateRow,
  onRemoveRow
}) => {
  const isMobile = useIsMobile();

  // Definición de columnas para la tabla de Ant Design que muestra la estructura
  const columns = [
    {
      title: 'Concepto / Filas',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 150,
      render: (text: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Input
            size="small"
            value={text}
            onChange={(e) => onUpdateRow(record.id, { nombre: e.target.value })}
            placeholder="Nombre Fila"
            style={{ minWidth: '100px' }}
          />
          <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => onRemoveRow(record.id)} />
        </div>
      )
    },
    ...table.columnas.map((col) => ({
      title: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px', background: '#fafafa', borderRadius: '4px', minWidth: '140px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Input
              size="small"
              value={col.nombre}
              onChange={(e) => onUpdateColumn(col.id, { nombre: e.target.value })}
              placeholder="Columna"
              style={{ fontWeight: 500 }}
            />
            <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => onRemoveColumn(col.id)} />
          </div>
          <select
            value={col.tipoDato}
            onChange={(e) => onUpdateColumn(col.id, { tipoDato: e.target.value as TipoDatoCampo })}
            style={{ width: '100%', fontSize: '11px', border: '1px solid #d9d9d9', borderRadius: '2px', padding: '2px' }}
          >
            {Object.values(TipoDatoCampo).map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>
      ),
      dataIndex: col.id,
      key: col.id,
      width: 160,
      render: () => <Input disabled size="small" placeholder="-" style={{ background: '#f5f5f5', cursor: 'not-allowed' }} />
    }))
  ];

  return (
    <Card
      size="small"
      type="inner"
      title={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Typography.Text>Tabla:</Typography.Text>
            <Input
              value={table.nombre}
              onChange={(e) => onUpdate({ nombre: e.target.value })}
              placeholder="Ingrese el nombre de la tabla"
              style={{ fontWeight: 500, width: isMobile ? '100%' : '300px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
             <Typography.Text type="secondary" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>Descripción:</Typography.Text>
             <Input
                size="small"
                value={table.descripcion}
                onChange={(e) => onUpdate({ descripcion: e.target.value })}
                placeholder="Descripción opcional de la tabla"
                style={{ fontSize: '12px', width: isMobile ? '100%' : 'auto', flex: 1 }}
              />
          </div>
        </div>
      }
      extra={<Button danger icon={<DeleteOutlined />} onClick={onDelete}>{!isMobile && 'Eliminar Tabla'}</Button>}
      style={{ marginBottom: '8px', background: '#fff', border: '1px solid #d9d9d9' }}
      bodyStyle={{ padding: isMobile ? '8px' : '24px' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <Button size="small" type="primary" ghost icon={<PlusOutlined />} onClick={onAddColumn} style={{ flex: isMobile ? 1 : 'none' }}>
            Agregar Columna
          </Button>
          <Button size="small" type="primary" ghost icon={<PlusOutlined />} onClick={onAddRow} style={{ flex: isMobile ? 1 : 'none' }}>
            Agregar Fila
          </Button>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
          <Table
            dataSource={table.filas}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 'max-content' }} // Permite scroll horizontal fluido
            locale={{ emptyText: 'Agregue filas y columnas para definir la estructura de la tabla' }}
          />
        </div>
      </Space>
    </Card>
  );
};
