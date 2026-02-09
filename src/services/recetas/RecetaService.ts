import { apiClient } from '../ApiClient';
import type { RecetaCreateDTO, RecetaMetadataResponseDTO } from '@/types/production/RecetaPadreDTOs';

// Filtros opcionales para recetas
type RecipeFilterDTO = Record<string, any>;

class RecetaService {
  /**
   * Obtiene todas las recetas padre.
   * Soporta filtros opcionales.
   */
  async getAllRecetas(filters: RecipeFilterDTO = {}): Promise<RecetaMetadataResponseDTO[]> {
    return apiClient.get<RecetaMetadataResponseDTO[]>('/recetas', filters);
  }

  /**
   * Obtiene una única receta por su código.
   */
  async getRecetaByCodigo(codigoReceta: string): Promise<RecetaMetadataResponseDTO> {
    if (!codigoReceta) {
      throw new Error('El código de la receta es requerido.');
    }
    return apiClient.get<RecetaMetadataResponseDTO>(`/recetas/${encodeURIComponent(codigoReceta)}`);
  }

  /**
   * Crea una nueva receta padre.
   */
  async createReceta(data: RecetaCreateDTO): Promise<RecetaMetadataResponseDTO> {
    if (!data) {
      throw new Error('Los datos de la receta son requeridos.');
    }
    return apiClient.post<RecetaMetadataResponseDTO>('/recetas', data);
  }

  /**
   * Actualiza una receta existente.
   */
  async updateReceta(
    codigoReceta: string,
    data: Partial<RecetaCreateDTO>
  ): Promise<RecetaMetadataResponseDTO> {
    if (!codigoReceta || !data) {
      throw new Error('El código de la receta y los datos son requeridos.');
    }
    return apiClient.put<RecetaMetadataResponseDTO>(
      `/recetas/${encodeURIComponent(codigoReceta)}`,
      data
    );
  }

  /**
   * Elimina una receta por su código.
   */
  async deleteReceta(codigoReceta: string): Promise<void> {
    if (!codigoReceta) {
      throw new Error('El código de la receta es requerido.');
    }
    return apiClient.delete<void>(`/recetas/${encodeURIComponent(codigoReceta)}`);
  }
}

export const recetaService = new RecetaService();
