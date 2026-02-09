import { useCallback, useState } from 'react';
import { recetaService } from './RecetaService';
import type { RecetaCreateDTO, RecetaMetadataResponseDTO } from '@/types/production/RecetaPadreDTOs';

export const useRecetaPadreService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recetas, setRecetas] = useState<RecetaMetadataResponseDTO[]>([]);

  const getAllRecetas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await recetaService.getAllRecetas();
      setRecetas(response);
    } catch (err: any) {
      setError(err.message || 'Error al obtener las recetas.');
      setRecetas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createReceta = useCallback(async (data: RecetaCreateDTO) => {
    setLoading(true);
    setError(null);
    try {
      const response = await recetaService.createReceta(data);
      setRecetas(prev => [...prev, response]);
      return response;
    } catch (err: any) {
      setError(err.message || 'Error al crear la receta.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReceta = useCallback(async (codigoReceta: string) => {
    setLoading(true);
    setError(null);
    try {
      await recetaService.deleteReceta(codigoReceta);
      setRecetas(prev => prev.filter(r => r.codigoReceta !== codigoReceta));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la receta.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    recetas,
    getAllRecetas,
    createReceta,
    deleteReceta
  };
};
