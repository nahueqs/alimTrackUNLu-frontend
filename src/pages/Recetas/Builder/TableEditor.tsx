import React from 'react';
import { Card, Input, Button, Space, Table } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { DraftTable } from './types';
import { TipoDatoCampo } from '../types/TipoDatoCampo';

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
  // Definición de columnas para la tabla de Ant Design que muestra la estructura
  const columns = [
    {
      title: 'Concepto / Filas',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Input
            size="small"
            value={text}
            onChange={(e) => onUpdateRow(record.id, { nombre: e.target.value })}
            placeholder="Nombre Fila"
          />
          <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => onRemoveRow(record.id)} />
        </div>
      )
    },
    ...table.columnas.map((col) => ({
      title: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Input
              size="small"
              value={col.nombre}
              onChange={(e) => onUpdateColumn(col.id, { nombre: e.target.value })}
              placeholder="Columna"
            />
            <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => onRemoveColumn(col.id)} />
          </div>
          <select
            value={col.tipoDato}
            onChange={(e) => onUpdateColumn(col.id, { tipoDato: e.target.value as TipoDatoCampo })}
            style={{ width: '100%', fontSize: '11px', border: '1px solid #d9d9d9', borderRadius: '2px' }}
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
      render: () => <Input disabled size="small" placeholder="-" style={{ background: '#f5f5f5' }} />
    }))
  ];

  return (
    <Card
      size="small"
      type="inner"
      title={
        <Input
          value={table.nombre}
          onChange={(e) => onUpdate({ nombre: e.target.value })}
          placeholder="Nombre de la Tabla"
          bordered={false}
          style={{ fontWeight: 500 }}
        />
      }
      extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={onDelete} />}
      style={{ marginBottom: '8px', background: '#fff', border: '1px solid #d9d9d9' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={onAddColumn}>
            Agregar Columna
          </Button>
          <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={onAddRow}>
            Agregar Fila
          </Button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table
            dataSource={table.filas}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            locale={{ emptyText: 'Agregue filas y columnas para definir la tabla' }}
          />
        </div>
      </Space>
    </Card>
  );
};
