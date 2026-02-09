import React from 'react';
import { Card, Input, Button, Space, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, CopyOutlined } from '@ant-design/icons';
import type { DraftGroup } from './types';
import { TipoDatoCampo } from '../types/TipoDatoCampo';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useRecipeBuilderContext } from './RecipeBuilderContext';

interface GroupEditorProps {
  group: DraftGroup;
  sectionId: string;
}

export const GroupEditor: React.FC<GroupEditorProps> = ({ group, sectionId }) => {
  const isMobile = useIsMobile();
  const { actions, recipe } = useRecipeBuilderContext();
  
  // Encontrar el índice del grupo para habilitar/deshabilitar botones de movimiento
  const section = recipe.sections.find(s => s.id === sectionId);
  const index = section?.grupos.findIndex(g => g.id === group.id) ?? 0;
  const totalGroups = section?.grupos.length ?? 0;

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '2px', paddingTop: '8px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
            <Button size="small" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => actions.moveGroup(sectionId, group.id, 'up')} />
            <Button size="small" icon={<ArrowDownOutlined />} disabled={index === totalGroups - 1} onClick={() => actions.moveGroup(sectionId, group.id, 'down')} />
        </div>
        <div style={{ flex: 1, width: '100%' }}>
            <Card
              size="small"
              type="inner"
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <Typography.Text>Grupo:</Typography.Text>
                  <Input
                    value={group.subtitulo}
                    onChange={(e) => actions.updateGroup(sectionId, group.id, { subtitulo: e.target.value })}
                    placeholder="Ingrese el nombre del grupo"
                    style={{ fontWeight: 500, width: isMobile ? '100%' : '250px' }}
                  />
                </div>
              }
              extra={
                <Space>
                    <Button icon={<CopyOutlined />} onClick={() => actions.duplicateGroup(sectionId, group.id)}>{!isMobile && 'Duplicar'}</Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => actions.removeGroup(sectionId, group.id)}>{!isMobile && 'Eliminar Grupo'}</Button>
                </Space>
              }
              style={{ marginBottom: '8px', background: '#f9f9f9', border: '1px solid #d9d9d9' }}
              bodyStyle={{ padding: isMobile ? '8px' : '24px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Typography.Text strong style={{ fontSize: '13px' }}>Campos del Grupo</Typography.Text>
                  <Button size="small" type="primary" ghost icon={<PlusOutlined />} onClick={() => actions.addFieldToGroup(sectionId, group.id)}>
                    {isMobile ? 'Agregar' : 'Agregar Campo al Grupo'}
                  </Button>
                </div>

                {group.campos.length > 0 ? (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {group.campos.map((campo, idx) => (
                      <div key={campo.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px', background: '#fff', border: '1px solid #eee', borderRadius: '4px', flexDirection: isMobile ? 'column' : 'row' }}>
                        <div style={{ display: 'flex', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-start', alignItems: 'center' }}>
                            <Space size={2}>
                                <Button size="small" type="text" icon={<ArrowUpOutlined />} disabled={idx === 0} onClick={() => actions.moveGroupField(sectionId, group.id, campo.id, 'up')} />
                                <Button size="small" type="text" icon={<ArrowDownOutlined />} disabled={idx === group.campos.length - 1} onClick={() => actions.moveGroupField(sectionId, group.id, campo.id, 'down')} />
                            </Space>
                            {isMobile && (
                                <Space size={2}>
                                    <Button size="small" icon={<CopyOutlined />} onClick={() => actions.duplicateGroupField(sectionId, group.id, campo.id)} />
                                    <Button 
                                        size="small" 
                                        danger 
                                        icon={<DeleteOutlined />} 
                                        onClick={() => actions.removeGroupField(sectionId, group.id, campo.id)} 
                                        disabled={group.campos.length <= 1} // Deshabilitar si es el último
                                    />
                                </Space>
                            )}
                        </div>
                        
                        <Input
                          addonBefore={!isMobile && "Nombre:"}
                          size="small"
                          value={campo.nombre}
                          onChange={(e) => actions.updateGroupField(sectionId, group.id, campo.id, { nombre: e.target.value })}
                          placeholder="Nombre campo"
                          style={{ flex: 2, width: '100%' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: isMobile ? '100%' : 'auto' }}>
                            <Typography.Text type="secondary" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>Tipo:</Typography.Text>
                            <select
                              value={campo.tipoDato}
                              onChange={(e) => actions.updateGroupField(sectionId, group.id, campo.id, { tipoDato: e.target.value as TipoDatoCampo })}
                              style={{ padding: '2px', borderRadius: '4px', border: '1px solid #d9d9d9', fontSize: '12px', height: '24px', flex: 1, width: isMobile ? '100%' : 'auto' }}
                            >
                              {Object.values(TipoDatoCampo).map((tipo) => (
                                <option key={tipo} value={tipo}>
                                  {tipo}
                                </option>
                              ))}
                            </select>
                        </div>
                        {!isMobile && (
                            <Space size={2}>
                                <Button size="small" icon={<CopyOutlined />} onClick={() => actions.duplicateGroupField(sectionId, group.id, campo.id)} />
                                <Button 
                                    size="small" 
                                    danger 
                                    icon={<DeleteOutlined />} 
                                    onClick={() => actions.removeGroupField(sectionId, group.id, campo.id)} 
                                    disabled={group.campos.length <= 1} // Deshabilitar si es el último
                                />
                            </Space>
                        )}
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
        </div>
    </div>
  );
};
