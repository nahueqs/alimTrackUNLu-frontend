import React from 'react';
import { Button, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { SectionEditor } from '../SectionEditor';
import type { DraftSection } from '../types';
import type { UseRecipeBuilderReturn } from '../useRecipeBuilder';

interface SectionListProps {
  sections: DraftSection[];
  actions: UseRecipeBuilderReturn['actions'];
}

export const SectionList: React.FC<SectionListProps> = ({ sections, actions }) => {
  if (sections.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '8px', border: '1px dashed #d9d9d9' }}>
        <Typography.Text type="secondary">No hay secciones definidas. Agregue una para comenzar.</Typography.Text>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {sections.map((section, index) => (
        <div key={section.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '8px' }}>
            <Button 
              size="small" 
              icon={<ArrowUpOutlined />} 
              disabled={index === 0} 
              onClick={() => actions.moveSection(section.id, 'up')} 
            />
            <Button 
              size="small" 
              icon={<ArrowDownOutlined />} 
              disabled={index === sections.length - 1} 
              onClick={() => actions.moveSection(section.id, 'down')} 
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <SectionEditor section={section} />
          </div>
        </div>
      ))}
    </div>
  );
};
