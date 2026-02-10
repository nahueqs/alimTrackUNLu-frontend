import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { message, Modal } from 'antd';
import { debounce } from 'lodash';
import { useAuth } from '@/context/auth/AuthProvider';
import type {
  EstadoActualProduccionResponseDTO,
  EstructuraProduccionDTO,
  FieldUpdatePayload,
  ProduccionCambioEstadoRequestDTO,
  ProduccionMetadataModifyRequestDTO,
  RespuestaCampoRequestDTO,
  RespuestaCeldaTablaRequestDTO,
  TableCellUpdatePayload,
} from '@/types/production';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import { ProductionState } from '@/constants/ProductionStates';

interface UseProductionActionsProps {
  isSaving: boolean;
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
  estadoActual: EstadoActualProduccionResponseDTO | null;
  estructura: EstructuraProduccionDTO | null;
  // Nuevas props para actualización optimista
  updateFieldResponse: (update: FieldUpdatePayload & { timestamp: string }) => void;
  updateTableCellResponse: (update: TableCellUpdatePayload & { timestamp: string }) => void;
}

interface UseProductionActionsReturn {
  isSaving: boolean;
  debouncedCampoChange: (
    idCampo: number,
    valor: string,
    tipoDato: TipoDatoCampo
  ) => Promise<void>;
  debouncedTablaChange: (
    idTabla: number,
    idFila: number,
    idColumna: number,
    valor: string,
    tipoDato: TipoDatoCampo
  ) => Promise<void>;
  debouncedMetadataChange: (data: ProduccionMetadataModifyRequestDTO) => Promise<void>;
  handleCambioEstado: (nuevoEstado: ProductionState) => Promise<void>;
}

// Helper function to build the request data object based on value and type
const buildTypedRequestData = (valor: string, tipoDato: TipoDatoCampo) => {
  const data = {
    valorTexto: null as string | null,
    valorNumerico: null as number | null,
    valorFecha: null as string | null,
    valorBooleano: null as boolean | null,
  };

  // Solo asignamos valor si NO es vacío y NO es nulo/undefined
  if (valor !== '' && valor !== null && valor !== undefined) {
    switch (tipoDato) {
      case TipoDatoCampo.ENTERO:
      case TipoDatoCampo.DECIMAL:
        data.valorNumerico = Number(valor);
        break;
      case TipoDatoCampo.FECHA:
        data.valorFecha = valor.includes('T') ? valor : `${valor}T00:00:00`;
        break;
      case TipoDatoCampo.HORA:
        // Usamos la fecha actual para evitar problemas de zona horaria con 1970
        const today = new Date().toISOString().split('T')[0];
        data.valorFecha = valor.includes('T') ? valor : `${today}T${valor}`;
        break;
      case TipoDatoCampo.BOOLEANO:
        data.valorBooleano = valor === 'true';
        break;
      case TipoDatoCampo.TEXTO:
      default:
        data.valorTexto = valor;
        break;
    }
  }
  return data;
};

export const useProductionActions = ({
  isSaving,
  guardarRespuestaCampo,
  guardarRespuestaCeldaTabla,
  cambiarEstadoProduccion,
  guardarMetadata,
  updateFieldResponse,
  updateTableCellResponse,
}: UseProductionActionsProps): UseProductionActionsReturn => {
  const { codigoProduccion } = useParams<{ codigoProduccion: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const _handleCampoChange = useCallback(
    async (idCampo: number, valor: string, tipoDato: TipoDatoCampo) => {
      if (!codigoProduccion || !user?.email) return;

      // 1. Actualización Optimista
      const optimisticTimestamp = new Date().toISOString();
      updateFieldResponse({
        idCampo,
        valor,
        timestamp: optimisticTimestamp,
      });

      const typedData = buildTypedRequestData(valor, tipoDato);

      const requestData: RespuestaCampoRequestDTO = {
        idCampo,
        emailCreador: user.email,
        ...typedData,
      };

      try {
        await guardarRespuestaCampo(codigoProduccion, idCampo, requestData);
        message.success('Cambio guardado', 0.5);
      } catch (e: any) {
        const errorMsg = e.message || 'Error al guardar el cambio';
        message.error(errorMsg);
        // Aquí podríamos revertir el cambio optimista si tuviéramos el valor anterior
        throw e;
      }
    },
    [codigoProduccion, user?.email, guardarRespuestaCampo, updateFieldResponse]
  );

  const _handleTablaChange = useCallback(
    async (
      idTabla: number,
      idFila: number,
      idColumna: number,
      valor: string,
      tipoDato: TipoDatoCampo
    ) => {
      if (!codigoProduccion || !user?.email) return;

      // 1. Actualización Optimista
      const optimisticTimestamp = new Date().toISOString();
      updateTableCellResponse({
        idTabla,
        idFila,
        idColumna,
        valor,
        timestamp: optimisticTimestamp,
      });

      const typedData = buildTypedRequestData(valor, tipoDato);

      const requestData: RespuestaCeldaTablaRequestDTO = {
        idTabla,
        idFila,
        idColumna,
        emailCreador: user.email,
        ...typedData,
      };

      try {
        await guardarRespuestaCeldaTabla(
          codigoProduccion,
          idTabla,
          idFila,
          idColumna,
          requestData
        );
        message.success('Cambio guardado', 0.5);
      } catch (e: any) {
        const errorMsg = e.message || 'Error al guardar el cambio';
        message.error(errorMsg);
        throw e;
      }
    },
    [codigoProduccion, user?.email, guardarRespuestaCeldaTabla, updateTableCellResponse]
  );

  const _handleMetadataChange = useCallback(
    async (data: ProduccionMetadataModifyRequestDTO) => {
      if (!codigoProduccion) return;
      try {
        await guardarMetadata(codigoProduccion, data);
        // message.success('Metadatos guardados', 0.5); // Ya se muestra en el componente
      } catch (e: any) {
        // Re-lanzar el error para que el componente lo maneje y muestre el mensaje específico
        throw e;
      }
    },
    [codigoProduccion, guardarMetadata]
  );

  const handleCambioEstado = useCallback(
    async (nuevoEstado: ProductionState) => {
      if (!codigoProduccion || !user?.email) {
        return;
      }

      // Si es un cambio de estado directo (no finalización/cancelación que requiere confirmación extra en el hook)
      // Nota: La confirmación visual ya se maneja en InfoProduccionCard para todos los estados.
      // Aquí solo ejecutamos la lógica de negocio.
      
      // Sin embargo, para mantener la lógica existente de redirección en finalización/cancelación:
      const isFinal = nuevoEstado === ProductionState.FINALIZADA;
      const isCancel = nuevoEstado === ProductionState.CANCELADA;

      try {
        await cambiarEstadoProduccion(codigoProduccion, {
          valor: nuevoEstado,
          emailCreador: user.email!,
        });
        
        if (isFinal || isCancel) {
             navigate('/producciones');
        }
      } catch (e: any) {
        throw e;
      }
    },
    [codigoProduccion, user?.email, cambiarEstadoProduccion, navigate]
  );

  // Removed debounce since we now have explicit save actions
  const debouncedCampoChange = _handleCampoChange;
  const debouncedTablaChange = _handleTablaChange;
  const debouncedMetadataChange = _handleMetadataChange; // No debounce for metadata save button

  return {
    isSaving,
    debouncedCampoChange,
    debouncedTablaChange,
    debouncedMetadataChange,
    handleCambioEstado,
  };
};
