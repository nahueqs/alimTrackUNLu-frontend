import { apiClient } from '../ApiClient';
import type { RecetaCreateDTO, RecetaMetadataResponseDTO } from '@/types/production/RecetaPadreDTOs';

class RecetaPadreService {
  /**
   * Obtiene todas las recetas padre.
   */
  async getAllRecetas(): Promise<RecetaMetadataResponseDTO[]> {
    return apiClient.get<RecetaMetadataResponseDTO[]>('/recetas');
  }

  /**
   * Crea una nueva receta padre.
   */
  async createReceta(data: RecetaCreateDTO): Promise<RecetaMetadataResponseDTO> {
    return apiClient.post<RecetaMetadataResponseDTO>('/recetas', data);
  }
}

export const recetaPadreService = new RecetaPadreService();
