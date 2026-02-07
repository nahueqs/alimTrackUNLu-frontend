import React from 'react';
import { Button, Layout, Space, Typography, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useRecipeBuilder } from './useRecipeBuilder';
import { MetadataEditor } from './MetadataEditor';
import { SectionEditor } from './SectionEditor';
import { AppHeader } from '@/components/AppHeader/AppHeader';
import { usePageTitle } from '@/hooks/usePageTitle';

const { Content } = Layout;
const { Title } = Typography;

export const RecipeBuilderPage: React.FC = () => {
  usePageTitle('Nueva Receta');
  const navigate = useNavigate();
  const { recipe, actions } = useRecipeBuilder();

  const handleSave = async () => {
    // Aquí iría la lógica de validación y transformación a DTO para enviar al backend
    console.log('Guardando receta:', recipe);
    if (!recipe.metadata.nombre || !recipe.metadata.codigoVersion) {
      message.error('Por favor complete el nombre y el código de versión');
      return;
    }
    message.success('Receta guardada (simulado)');
    // navigate('/recetas/versiones');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader title="AlimTrack" />
      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/recetas/versiones')}>
              Volver
            </Button>
            <Title level={2} style={{ margin: 0 }}>Nueva Receta</Title>
          </Space>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} size="large">
            Guardar Receta
          </Button>
        </div>

        <MetadataEditor 
          metadata={recipe.metadata} 
          onChange={actions.updateMetadata} 
        />

        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>Secciones</Title>
          <Button type="dashed" icon={<PlusOutlined />} onClick={actions.addSection}>
            Agregar Sección
          </Button>
        </div>

        {recipe.sections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '8px', border: '1px dashed #d9d9d9' }}>
            <Typography.Text type="secondary">No hay secciones definidas. Agregue una para comenzar.</Typography.Text>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recipe.sections.map((section) => (
              <SectionEditor
                key={section.id}
                section={section}
                onUpdate={(updates) => actions.updateSection(section.id, updates)}
                onDelete={() => actions.removeSection(section.id)}
                
                // Fields
                onAddField={() => actions.addFieldToSection(section.id)}
                onUpdateField={(fieldId, updates) => actions.updateField(section.id, fieldId, updates)}
                onRemoveField={(fieldId) => actions.removeField(section.id, fieldId)}
                
                // Groups
                onAddGroup={() => actions.addGroupToSection(section.id)}
                onUpdateGroup={(groupId, updates) => actions.updateGroup(section.id, groupId, updates)}
                onRemoveGroup={(groupId) => actions.removeGroup(section.id, groupId)}
                onAddFieldToGroup={(groupId) => actions.addFieldToGroup(section.id, groupId)}
                onUpdateGroupField={(groupId, fieldId, updates) => actions.updateGroupField(section.id, groupId, fieldId, updates)}
                onRemoveGroupField={(groupId, fieldId) => actions.removeGroupField(section.id, groupId, fieldId)}

                // Tables
                onAddTable={() => actions.addTableToSection(section.id)}
                onUpdateTable={(tableId, updates) => actions.updateTable(section.id, tableId, updates)}
                onRemoveTable={(tableId) => actions.removeTable(section.id, tableId)}
                onAddColumnToTable={(tableId) => actions.addColumnToTable(section.id, tableId)}
                onUpdateColumn={(tableId, colId, updates) => actions.updateColumn(section.id, tableId, colId, updates)}
                onRemoveColumn={(tableId, colId) => actions.removeColumn(section.id, tableId, colId)}
                onAddRowToTable={(tableId) => actions.addRowToTable(section.id, tableId)}
                onUpdateRow={(tableId, rowId, updates) => actions.updateRow(section.id, tableId, rowId, updates)}
                onRemoveRow={(tableId, rowId) => actions.removeRow(section.id, tableId, rowId)}
              />
            ))}
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default RecipeBuilderPage;
