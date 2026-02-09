import React from 'react';
import { message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth/AuthProvider';
import { useVersionRecetaService } from '@/services/recetas/useVersionRecetaService';
import { mapDraftToDTO } from '../mapper';
import type { UseRecipeBuilderReturn } from '../useRecipeBuilder';

export const useRecipeSave = (recipeBuilder: UseRecipeBuilderReturn) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createVersion, loading } = useVersionRecetaService();
  const { recipe, validateRecipe } = recipeBuilder;

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

    // 2. Validaciones de estructura
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
      handleError(error);
    }
  };

  const handleError = (error: any) => {
    if (error.response && error.response.data) {
      const { data, status } = error.response;

      // Errores de validación (400)
      if (status === 400 && data.errors && Array.isArray(data.errors)) {
        Modal.error({
          title: 'Error de Validación',
          content: (
            <ul>
              {data.errors.map((err: string, i: number) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          ),
        });
        return;
      }

      // Conflicto (409)
      if (status === 409) {
        message.error(data.message || 'Ya existe una versión con ese código.');
        return;
      }

      // Mensaje directo
      if (data.message) {
        message.error(data.message);
        return;
      }
    }
    // Fallback
    message.error(error.message || 'Error al crear la receta');
  };

  return { handleSave, loading };
};
