import { useCallback, useState } from 'react';
import { productionService } from './productionService';
import { useProductionState } from '@/hooks/useProductionState';
import type {
  EstadoActualProduccionResponseDTO,
  EstructuraProduccionDTO,
  FieldUpdatePayload,
  ProduccionCambioEstadoRequestDTO,
  ProduccionCreateRequestDTO,
  ProduccionFilterRequestDTO,
  ProduccionMetadataModifyRequestDTO,
  ProduccionProtectedResponseDTO,
  ProductionMetadataUpdatedPayload,
  ProductionStateUpdatePayload,
  RespuestaCampoRequestDTO,
  RespuestaCeldaTablaRequestDTO,
  TableCellUpdatePayload,
} from '@/types/production';

interface UseProductionServiceReturn {
  loading: boolean;
  isSaving: boolean;
  producciones: ProduccionProtectedResponseDTO[];
  estadoActual: EstadoActualProduccionResponseDTO | null;
  error: boolean;
  getProducciones: (filters?: ProduccionFilterRequestDTO) => Promise<void>;
  getProduccionByCodigo: (codigo: string) => Promise<void>;
  createProduction: (
    data: ProduccionCreateRequestDTO
  ) => Promise<ProduccionProtectedResponseDTO>;
  deleteProduction: (codigo: string) => Promise<void>;
  getUltimasRespuestas: (codigo: string) => Promise<void>;
  guardarRespuestaCampo: (
    codigoProduccion: string,
    idCampo: number,
    data: RespuestaCampoRequestDTO
  ) => Promise<void>;
  guardarRespuestaCeldaTabla: (
    codigoProduccion: string,
    idTabla: number,
    idFila: number,
    idColumna: number,
    data: RespuestaCeldaTablaRequestDTO
  ) => Promise<void>;
  cambiarEstadoProduccion: (
    codigoProduccion: string,
    data: ProduccionCambioEstadoRequestDTO
  ) => Promise<void>;
  guardarMetadata: (
    codigoProduccion: string,
    data: ProduccionMetadataModifyRequestDTO
  ) => Promise<void>;
  updateFieldResponse: (update: FieldUpdatePayload & { timestamp: string }) => void;
  updateTableCellResponse: (update: TableCellUpdatePayload & { timestamp: string }) => void;
  updateProductionState: (update: ProductionStateUpdatePayload & { timestamp: string }) => void;
  updateProductionMetadata: (
    update: ProductionMetadataUpdatedPayload & { timestamp: string }
  ) => void;
  setEstructura: (estructura: EstructuraProduccionDTO) => void;
  updateProductionStateInList: (
    codigoProduccion: string,
    update: ProductionStateUpdatePayload & { timestamp: string }
  ) => void;
}

export const useProductionService = (): UseProductionServiceReturn => {
  const [producciones, setProducciones] = useState<ProduccionProtectedResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);

  const {
    state: estadoActual,
    setState: setEstadoActual,
    updateField,
    updateTable,
    updateProductionStatus,
    updateMetadata: updateStateMetadata,
    recalculateProgreso,
  } = useProductionState<EstadoActualProduccionResponseDTO>();

  const getProducciones = useCallback(async (filters: ProduccionFilterRequestDTO = {}) => {
    setLoading(true);
    setError(false);
    try {
      const response = await productionService.getProducciones(filters);
      setProducciones(response || []);
    } catch (err) {
      setError(true);
      setProducciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getProduccionByCodigo = useCallback(async (codigo: string) => {
    setLoading(true);
    setError(false);
    try {
      const response = await productionService.getProduccionByCodigo(codigo);
      setProducciones(response ? [response] : []);
    } catch (err) {
      setError(true);
      setProducciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUltimasRespuestas = useCallback(
    async (codigo: string) => {
      setLoading(true);
      setError(false);
      try {
        const response = await productionService.getUltimasRespuestas(codigo);
        setEstadoActual(response);
      } catch (err) {
        setError(true);
        setEstadoActual(null);
      } finally {
        setLoading(false);
      }
    },
    [setEstadoActual]
  );

  const guardarRespuestaCampo = useCallback(
    async (codigoProduccion: string, idCampo: number, data: RespuestaCampoRequestDTO) => {
      setIsSaving(true);
      // NO reseteamos error global aquí para no afectar la vista general
      try {
        await productionService.guardarRespuestaCampo(codigoProduccion, idCampo, data);
      } catch (err) {
        // NO seteamos error global (setError(true)) porque es un error de validación local
        throw err; // Relanzamos para que el componente lo maneje
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const guardarRespuestaCeldaTabla = useCallback(
    async (
      codigoProduccion: string,
      idTabla: number,
      idFila: number,
      idColumna: number,
      data: RespuestaCeldaTablaRequestDTO
    ) => {
      setIsSaving(true);
      try {
        await productionService.guardarRespuestaCeldaTabla(
          codigoProduccion,
          idTabla,
          idFila,
          idColumna,
          data
        );
      } catch (err) {
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const cambiarEstadoProduccion = useCallback(
    async (codigoProduccion: string, data: ProduccionCambioEstadoRequestDTO) => {
      setIsSaving(true);
      setError(false);
      try {
        await productionService.cambiarEstado(codigoProduccion, data);
      } catch (err) {
        setError(true); // Aquí sí puede ser relevante un error global
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const guardarMetadata = useCallback(
    async (codigoProduccion: string, data: ProduccionMetadataModifyRequestDTO) => {
      setIsSaving(true);
      // Metadata suele ser global, pero si falla, mejor manejarlo localmente en el formulario de metadata
      try {
        await productionService.guardarMetadata(codigoProduccion, data);
      } catch (err) {
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const createProduction = useCallback(async (data: ProduccionCreateRequestDTO) => {
    setLoading(true);
    setError(false);
    try {
      const newProduction = await productionService.createProduction(data);
      return newProduction;
    } catch (err) {
      setError(true);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduction = useCallback(async (codigo: string) => {
    setLoading(true);
    setError(false);
    try {
      await productionService.deleteProduction(codigo);
      // Actualizamos el estado local eliminando la producción
      setProducciones((prev) => prev.filter((p) => p.codigoProduccion !== codigo));
    } catch (err) {
      setError(true);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delegamos las actualizaciones al hook genérico
  const updateFieldResponse = useCallback(
    (update: FieldUpdatePayload & { timestamp: string }) => {
      updateField(update, null);
    },
    [updateField]
  );

  const updateTableCellResponse = useCallback(
    (update: TableCellUpdatePayload & { timestamp: string }) => {
      updateTable(update, null);
    },
    [updateTable]
  );

  const updateProductionState = useCallback(
    (update: ProductionStateUpdatePayload & { timestamp: string }) => {
      updateProductionStatus(update);
    },
    [updateProductionStatus]
  );

  const updateProductionMetadata = useCallback(
    (update: ProductionMetadataUpdatedPayload & { timestamp: string }) => {
      updateStateMetadata(update);
    },
    [updateStateMetadata]
  );

  const setEstructura = useCallback(
    (estructura: EstructuraProduccionDTO) => {
      setEstadoActual((prevEstadoActual) => {
        if (!prevEstadoActual) {
          return null;
        }
        if (
          prevEstadoActual.estructura &&
          prevEstadoActual.estructura.metadata.codigoVersionReceta ===
            estructura.metadata.codigoVersionReceta
        ) {
          return prevEstadoActual;
        }

        const newProgreso = recalculateProgreso(
          estructura,
          prevEstadoActual.respuestasCampos,
          prevEstadoActual.respuestasTablas
        );

        return {
          ...prevEstadoActual,
          estructura: estructura,
          progreso: newProgreso,
          timestampConsulta: new Date().toISOString(),
        };
      });
    },
    [setEstadoActual, recalculateProgreso]
  );

  // Nueva función para actualizar el estado en la lista
  const updateProductionStateInList = useCallback(
    (codigoProduccion: string, update: ProductionStateUpdatePayload & { timestamp: string }) => {
      setProducciones((prev) =>
        prev.map((prod) => {
          if (prod.codigoProduccion === codigoProduccion) {
            return {
              ...prod,
              estado: update.estado,
              // Si hay fechaFin en el update, la actualizamos, si no, mantenemos la que tenía
              fechaFin: update.fechaFin !== undefined ? update.fechaFin : prod.fechaFin,
            };
          }
          return prod;
        })
      );
    },
    []
  );

  return {
    loading,
    isSaving,
    producciones,
    estadoActual,
    error,
    getProducciones,
    getProduccionByCodigo,
    createProduction,
    deleteProduction,
    getUltimasRespuestas,
    guardarRespuestaCampo,
    guardarRespuestaCeldaTabla,
    cambiarEstadoProduccion,
    guardarMetadata,
    updateFieldResponse,
    updateTableCellResponse,
    updateProductionState,
    updateProductionMetadata,
    setEstructura,
    updateProductionStateInList,
  };
};
