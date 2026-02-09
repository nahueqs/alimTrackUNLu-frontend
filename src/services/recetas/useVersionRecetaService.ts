import { useCallback, useState } from 'react';
import { versionRecetaService } from './VersionRecetaService';
import type {
  EstructuraProduccionDTO,
  VersionRecetaMetadataResponseDTO,
} from '@/types/production';
import type { VersionRecetaLlenaCreateDTO } from '@/types/production/RecipeDTOs';

interface UseVersionRecetaReturn {
  loading: boolean;
  error: string | null;
  versiones: VersionRecetaMetadataResponseDTO[];
  version: VersionRecetaMetadataResponseDTO | null;
  estructura: EstructuraProduccionDTO | null;
  getAllVersiones: () => Promise<void>;
  getByCodigoVersion: (codigoVersion: string) => Promise<void>;
  getEstructuraCompleta: (codigoVersion: string) => Promise<EstructuraProduccionDTO | null>; // Modificado retorno
  createVersion: (data: VersionRecetaLlenaCreateDTO) => Promise<VersionRecetaMetadataResponseDTO>;
  deleteVersion: (codigoVersion: string) => Promise<void>;
}

export const useVersionRecetaService = (): UseVersionRecetaReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versiones, setVersiones] = useState<VersionRecetaMetadataResponseDTO[]>([]);
  const [version, setVersion] = useState<VersionRecetaMetadataResponseDTO | null>(null);
  const [estructura, setEstructura] = useState<EstructuraProduccionDTO | null>(null);

  const getAllVersiones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await versionRecetaService.getAllVersiones();
      setVersiones(response);
    } catch (err: any) {
      setError(err.message || 'Error al obtener las versiones de recetas.');
      setVersiones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getByCodigoVersion = useCallback(async (codigoVersion: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await versionRecetaService.getByCodigoVersion(codigoVersion);
      setVersion(response);
    } catch (err: any) {
      setError(err.message || `Error al obtener la versión ${codigoVersion}.`);
      setVersion(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const getEstructuraCompleta = useCallback(async (codigoVersion: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await versionRecetaService.getEstructuraCompleta(codigoVersion);
      setEstructura(response);
      return response; // Devolvemos la respuesta
    } catch (err: any) {
      setError(err.message || 'Error al obtener la estructura de la receta.');
      setEstructura(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createVersion = useCallback(async (data: VersionRecetaLlenaCreateDTO) => {
    setLoading(true);
    setError(null);
    try {
      const response = await versionRecetaService.createVersion(data);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear la versión de receta.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVersion = useCallback(async (codigoVersion: string) => {
    setLoading(true);
    setError(null);
    try {
      await versionRecetaService.deleteVersion(codigoVersion);
      // Actualizamos el estado local eliminando la versión
      setVersiones((prev) => prev.filter((v) => v.codigoVersionReceta !== codigoVersion));
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar la versión de receta.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    versiones,
    version,
    estructura,
    getAllVersiones,
    getByCodigoVersion,
    getEstructuraCompleta,
    createVersion,
    deleteVersion,
  };
};
