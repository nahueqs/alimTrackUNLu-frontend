import React from 'react';
import { Card, Input, Button, Space, Table, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { DraftTable } from './types';
import { TipoDatoCampo } from '../types/TipoDatoCampo';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useRecipeBuilderContext } from './RecipeBuilderContext';

interface TableEditorProps {
  table: DraftTable;
  sectionId: string;
}

export const TableEditor: React.FC<TableEditorProps> = ({ table, sectionId }) => {
  const isMobile = useIsMobile();
  const { actions, recipe } = useRecipeBuilderContext();

  // Encontrar el índice de la tabla
  const section = recipe.sections.find(s => s.id === sectionId);
  const index = section?.tablas.findIndex(t => t.id === table.id) ?? 0;
  const totalTables = section?.tablas.length ?? 0;

  // Definición de columnas para la tabla de Ant Design que muestra la estructura
  const columns = [
    {
      title: 'Concepto / Filas',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 150,
      // fixed: 'left' as const, // Eliminado para permitir scroll fluido
      render: (text: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Input
            size="small"
            value={text}
            onChange={(e) => actions.updateRow(sectionId, table.id, record.id, { nombre: e.target.value })}
            placeholder="Nombre Fila"
            style={{ minWidth: '100px' }}
          />
          <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => actions.removeRow(sectionId, table.id, record.id)} />
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
              onChange={(e) => actions.updateColumn(sectionId, table.id, col.id, { nombre: e.target.value })}
              placeholder="Columna"
              style={{ fontWeight: 500 }}
            />
            <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => actions.removeColumn(sectionId, table.id, col.id)} />
          </div>
          <select
            value={col.tipoDato}
            onChange={(e) => actions.updateColumn(sectionId, table.id, col.id, { tipoDato: e.target.value as TipoDatoCampo })}
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
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '2px', paddingTop: '8px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
            <Button size="small" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => actions.moveTable(sectionId, table.id, 'up')} />
            <Button size="small" icon={<ArrowDownOutlined />} disabled={index === totalTables - 1} onClick={() => actions.moveTable(sectionId, table.id, 'down')} />
        </div>
        <div style={{ flex: 1, width: '100%' }}>
            <Card
              size="small"
              type="inner"
              title={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Typography.Text>Tabla:</Typography.Text>
                    <Input
                      value={table.nombre}
                      onChange={(e) => actions.updateTable(sectionId, table.id, { nombre: e.target.value })}
                      placeholder="Ingrese el nombre de la tabla"
                      style={{ fontWeight: 500, width: isMobile ? '100%' : '300px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                     <Typography.Text type="secondary" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>Descripción:</Typography.Text>
                     <Input
                        size="small"
                        value={table.descripcion}
                        onChange={(e) => actions.updateTable(sectionId, table.id, { descripcion: e.target.value })}
                        placeholder="Descripción opcional de la tabla"
                        style={{ fontSize: '12px', width: isMobile ? '100%' : 'auto', flex: 1 }}
                      />
                  </div>
                </div>
              }
              extra={<Button danger icon={<DeleteOutlined />} onClick={() => actions.removeTable(sectionId, table.id)}>{!isMobile && 'Eliminar Tabla'}</Button>}
              style={{ marginBottom: '8px', background: '#fff', border: '1px solid #d9d9d9' }}
              bodyStyle={{ padding: isMobile ? '8px' : '24px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <Button size="small" type="primary" ghost icon={<PlusOutlined />} onClick={() => actions.addColumnToTable(sectionId, table.id)} style={{ flex: isMobile ? 1 : 'none' }}>
                    Agregar Columna
                  </Button>
                  <Button size="small" type="primary" ghost icon={<PlusOutlined />} onClick={() => actions.addRowToTable(sectionId, table.id)} style={{ flex: isMobile ? 1 : 'none' }}>
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
        </div>
    </div>
  );
};
