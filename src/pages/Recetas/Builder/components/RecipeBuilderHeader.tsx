import React from 'react';
import { Button, Space, Typography } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useIsMobile';
import { TemplateSelector } from './TemplateSelector';
import type { DraftRecipe } from '../types';

const { Title } = Typography;

interface RecipeBuilderHeaderProps {
  onSave: () => void;
  loading: boolean;
  onLoadTemplate: (draft: DraftRecipe) => void;
}

export const RecipeBuilderHeader: React.FC<RecipeBuilderHeaderProps> = ({ onSave, loading, onLoadTemplate }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div style={{ 
        marginBottom: '16px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0'
    }}>
      <Space align="center" wrap>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/recetas/versiones')}>
          Volver
        </Button>
        <Title level={isMobile ? 4 : 2} style={{ margin: 0 }}>
          Nueva Versión de Receta
        </Title>
      </Space>
      
      <Space wrap>
        <TemplateSelector onLoadTemplate={onLoadTemplate} />
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={onSave} 
          size="large"
          loading={loading}
          style={{ width: isMobile ? '100%' : 'auto' }}
        >
          Guardar Versión
        </Button>
      </Space>
    </div>
  );
};
