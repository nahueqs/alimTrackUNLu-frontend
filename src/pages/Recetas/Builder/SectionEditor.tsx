import React from 'react';
import { Card, Input, Button, Space, Typography, Divider } from 'antd';
import { DeleteOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, CopyOutlined } from '@ant-design/icons';
import type { DraftSection } from './types';
import { TipoDatoCampo } from '../types/TipoDatoCampo';
import { GroupEditor } from './GroupEditor';
import { TableEditor } from './TableEditor';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useRecipeBuilderContext } from './RecipeBuilderContext';

interface SectionEditorProps {
  section: DraftSection;
  // Ya no necesitamos pasar todas las acciones por props
}

export const SectionEditor: React.FC<SectionEditorProps> = ({ section }) => {
  const isMobile = useIsMobile();
  const { actions } = useRecipeBuilderContext();

  return (
    <Card 
      size="small"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Typography.Text strong>Sección:</Typography.Text>
          <Input 
            value={section.titulo} 
            onChange={(e) => actions.updateSection(section.id, { titulo: e.target.value })}
            style={{ width: isMobile ? '100%' : '300px', fontWeight: 'bold' }}
            placeholder="Ingrese el título de la sección"
          />
        </div>
      }
      extra={
        <Space size={isMobile ? 4 : 8}>
            <Button icon={<ArrowUpOutlined />} onClick={() => actions.moveSection(section.id, 'up')} />
            <Button icon={<ArrowDownOutlined />} onClick={() => actions.moveSection(section.id, 'down')} />
            <Button icon={<CopyOutlined />} onClick={() => actions.duplicateSection(section.id)}>{!isMobile && 'Duplicar'}</Button>
            <Button danger icon={<DeleteOutlined />} onClick={() => actions.removeSection(section.id)}>{!isMobile && 'Eliminar'}</Button>
        </Space>
      }
      style={{ marginBottom: '1rem', borderLeft: '4px solid #1890ff' }}
      bodyStyle={{ padding: isMobile ? '8px' : '24px' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        
        {/* Campos Simples */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f2f5', padding: '8px', borderRadius: '4px' }}>
            <Typography.Text strong>Campos Simples</Typography.Text>
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => actions.addFieldToSection(section.id)}>{isMobile ? 'Agregar' : 'Agregar Campo'}</Button>
        </div>
        
        {section.campos.length > 0 ? (
            <div style={{ display: 'grid', gap: '8px', padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                {section.campos.map((campo, index) => (
                    <div key={campo.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: '4px', flexDirection: isMobile ? 'column' : 'row' }}>
                        <div style={{ display: 'flex', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-start', alignItems: 'center' }}>
                            <Space size={2}>
                                <Button size="small" type="text" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => actions.moveField(section.id, campo.id, 'up')} />
                                <Button size="small" type="text" icon={<ArrowDownOutlined />} disabled={index === section.campos.length - 1} onClick={() => actions.moveField(section.id, campo.id, 'down')} />
                            </Space>
                            {isMobile && (
                                <Space size={2}>
                                    <Button size="small" icon={<CopyOutlined />} onClick={() => actions.duplicateField(section.id, campo.id)} />
                                    <Button danger icon={<DeleteOutlined />} onClick={() => actions.removeField(section.id, campo.id)} />
                                </Space>
                            )}
                        </div>
                        
                        <Input 
                            addonBefore={!isMobile && "Nombre:"}
                            value={campo.nombre} 
                            onChange={(e) => actions.updateField(section.id, campo.id, { nombre: e.target.value })}
                            placeholder="Nombre del campo"
                            style={{ flex: 2, width: '100%' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: isMobile ? '100%' : 'auto' }}>
                            <Typography.Text type="secondary" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>Tipo:</Typography.Text>
                            <select 
                                value={campo.tipoDato}
                                onChange={(e) => actions.updateField(section.id, campo.id, { tipoDato: e.target.value as TipoDatoCampo })}
                                style={{ padding: '4px', borderRadius: '4px', border: '1px solid #d9d9d9', height: '32px', flex: 1, width: isMobile ? '100%' : 'auto' }}
                            >
                                {Object.values(TipoDatoCampo).map(tipo => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                        </div>
                        {!isMobile && (
                            <Space size={2}>
                                <Button icon={<CopyOutlined />} onClick={() => actions.duplicateField(section.id, campo.id)} />
                                <Button danger icon={<DeleteOutlined />} onClick={() => actions.removeField(section.id, campo.id)} />
                            </Space>
                        )}
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
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => actions.addGroupToSection(section.id)}>{isMobile ? 'Agregar' : 'Agregar Grupo'}</Button>
        </div>
        
        {section.grupos.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {section.grupos.map((group) => (
                    <GroupEditor 
                        key={group.id}
                        group={group}
                        sectionId={section.id}
                    />
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
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => actions.addTableToSection(section.id)}>{isMobile ? 'Agregar' : 'Agregar Tabla'}</Button>
        </div>

        {section.tablas.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {section.tablas.map((table) => (
                    <TableEditor
                        key={table.id}
                        table={table}
                        sectionId={section.id}
                    />
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
