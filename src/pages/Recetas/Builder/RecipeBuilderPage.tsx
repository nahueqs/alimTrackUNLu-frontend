import React, { useEffect } from 'react';
import { Button, Layout, Space, Typography, message, Spin } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useRecipeBuilder } from './useRecipeBuilder';
import { MetadataEditor } from './MetadataEditor';
import { SectionEditor } from './SectionEditor';
import { AppHeader } from '@/components/AppHeader/AppHeader';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/context/auth/AuthProvider';
import { mapDraftToDTO } from './mapper';
import { useVersionRecetaService } from '@/services/recetas/useVersionRecetaService';
import { useRecetaPadreService } from '@/services/recetas/useRecetaPadreService';

const { Content } = Layout;
const { Title } = Typography;

export const RecipeBuilderPage: React.FC = () => {
  usePageTitle('Nueva Receta');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recipe, actions, validateRecipe } = useRecipeBuilder();
  const { createVersion, loading: loadingSave } = useVersionRecetaService();
  const { recetas, loading: loadingRecetas, getAllRecetas, createReceta } = useRecetaPadreService();

  useEffect(() => {
    getAllRecetas();
  }, [getAllRecetas]);

  const handleSave = async () => {
    // 1. Validaciones básicas de metadatos
    if (!recipe.metadata.codigoRecetaPadre) {
      message.error('Debe seleccionar una receta padre');
      return;
    }
    if (!recipe.metadata.nombre || !recipe.metadata.codigoVersion) {
      message.error('Por favor complete el nombre y el código de versión');
      return;
    }

    // 2. Validaciones de estructura (unicidad, etc.)
    const validationError = validateRecipe();
    if (validationError) {
      message.error(validationError);
      return;
    }

    // 3. Transformación a DTO
    if (!user?.email) {
        message.error('No se pudo identificar al usuario creador.');
        return;
    }

    const dto = mapDraftToDTO(recipe, user.email);

    // 4. Envío al backend
    try {
      if (import.meta.env.DEV) {
        console.log('Enviando DTO:', dto);
      }
      await createVersion(dto);
      message.success('Versión de receta creada exitosamente');
      navigate('/recetas/versiones');
    } catch (error: any) {
      console.error('Error al crear receta:', error);
      message.error(error.message || 'Error al crear la receta');
    }
  };

  if (loadingRecetas && recetas.length === 0) {
      return (
          <Layout style={{ minHeight: '100vh' }}>
              <AppHeader title="AlimTrack" />
              <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                  <Spin size="large" tip="Cargando recetas..." />
              </Content>
          </Layout>
      );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader title="AlimTrack" />
      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/recetas/versiones')}>
              Volver
            </Button>
            <Title level={2} style={{ margin: 0 }}>Nueva Versión de Receta</Title>
          </Space>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave} 
            size="large"
            loading={loadingSave}
          >
            Guardar Versión
          </Button>
        </div>

        <MetadataEditor 
          metadata={recipe.metadata} 
          onChange={actions.updateMetadata}
          recetasPadre={recetas}
          onCreateRecetaPadre={createReceta}
          currentUserEmail={user?.email || ''}
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
            {recipe.sections.map((section, index) => (
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
                        disabled={index === recipe.sections.length - 1} 
                        onClick={() => actions.moveSection(section.id, 'down')} 
                      />
                  </div>
                  <div style={{ flex: 1 }}>
                      <SectionEditor
                        section={section}
                        onUpdate={(updates) => actions.updateSection(section.id, updates)}
                        onDelete={() => actions.removeSection(section.id)}
                        onMove={(direction) => actions.moveSection(section.id, direction)}
                        
                        // Fields
                        onAddField={() => actions.addFieldToSection(section.id)}
                        onUpdateField={(fieldId, updates) => actions.updateField(section.id, fieldId, updates)}
                        onRemoveField={(fieldId) => actions.removeField(section.id, fieldId)}
                        onMoveField={(fieldId, direction) => actions.moveField(section.id, fieldId, direction)}
                        
                        // Groups
                        onAddGroup={() => actions.addGroupToSection(section.id)}
                        onUpdateGroup={(groupId, updates) => actions.updateGroup(section.id, groupId, updates)}
                        onRemoveGroup={(groupId) => actions.removeGroup(section.id, groupId)}
                        onMoveGroup={(groupId, direction) => actions.moveGroup(section.id, groupId, direction)}
                        onAddFieldToGroup={(groupId) => actions.addFieldToGroup(section.id, groupId)}
                        onUpdateGroupField={(groupId, fieldId, updates) => actions.updateGroupField(section.id, groupId, fieldId, updates)}
                        onRemoveGroupField={(groupId, fieldId) => actions.removeGroupField(section.id, groupId, fieldId)}
                        onMoveGroupField={(groupId, fieldId, direction) => actions.moveGroupField(section.id, groupId, fieldId, direction)}

                        // Tables
                        onAddTable={() => actions.addTableToSection(section.id)}
                        onUpdateTable={(tableId, updates) => actions.updateTable(section.id, tableId, updates)}
                        onRemoveTable={(tableId) => actions.removeTable(section.id, tableId)}
                        onMoveTable={(tableId, direction) => actions.moveTable(section.id, tableId, direction)}
                        onAddColumnToTable={(tableId) => actions.addColumnToTable(section.id, tableId)}
                        onUpdateColumn={(tableId, colId, updates) => actions.updateColumn(section.id, tableId, colId, updates)}
                        onRemoveColumn={(tableId, colId) => actions.removeColumn(section.id, tableId, colId)}
                        onAddRowToTable={(tableId) => actions.addRowToTable(section.id, tableId)}
                        onUpdateRow={(tableId, rowId, updates) => actions.updateRow(section.id, tableId, rowId, updates)}
                        onRemoveRow={(tableId, rowId) => actions.removeRow(section.id, tableId, rowId)}
                      />
                  </div>
              </div>
            ))}
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default RecipeBuilderPage;
