import React, { useEffect } from 'react';
import { Button, Layout, Spin, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRecipeBuilder } from './useRecipeBuilder';
import { MetadataEditor } from './MetadataEditor';
import { AppHeader } from '@/components/AppHeader/AppHeader';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/context/auth/AuthProvider';
import { useRecetaPadreService } from '@/services/recetas/useRecetaPadreService';
import { useIsMobile } from '@/hooks/useIsMobile';
import { RecipeBuilderProvider } from './RecipeBuilderContext';
import { useRecipeSave } from './hooks/useRecipeSave.tsx';
import { RecipeBuilderHeader } from './components/RecipeBuilderHeader';
import { SectionList } from './components/SectionList';

const { Content } = Layout;
const { Title } = Typography;

export const RecipeBuilderPage: React.FC = () => {
  usePageTitle('Nueva Receta');
  const { user } = useAuth();
  const recipeBuilder = useRecipeBuilder();
  const { recipe, actions, loadDraft } = recipeBuilder; // Obtenemos loadDraft
  
  const { handleSave, loading: loadingSave } = useRecipeSave(recipeBuilder);
  const { recetas, loading: loadingRecetas, getAllRecetas, createReceta } = useRecetaPadreService();
  const isMobile = useIsMobile();

  useEffect(() => {
    getAllRecetas();
  }, [getAllRecetas]);

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
    <RecipeBuilderProvider value={recipeBuilder}>
      <Layout style={{ minHeight: '100vh' }}>
        <AppHeader title="AlimTrack" />
        <Content style={{ padding: isMobile ? '16px' : '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          
          <RecipeBuilderHeader 
            onSave={handleSave} 
            loading={loadingSave} 
            onLoadTemplate={loadDraft} // Pasamos la acción
          />

          <MetadataEditor 
            metadata={recipe.metadata} 
            onChange={actions.updateMetadata}
            recetasPadre={recetas}
            onCreateRecetaPadre={createReceta}
            currentUserEmail={user?.email || ''}
          />

          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0, fontSize: isMobile ? '1.25rem' : '1.75rem' }}>Secciones</Title>
            <Button type="dashed" icon={<PlusOutlined />} onClick={actions.addSection}>
              Agregar Sección
            </Button>
          </div>

          <SectionList sections={recipe.sections} actions={actions} />

        </Content>
      </Layout>
    </RecipeBuilderProvider>
  );
};

export default RecipeBuilderPage;
