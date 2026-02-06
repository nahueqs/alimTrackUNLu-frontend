import { ProductionState } from '@/constants/ProductionStates';
import type { EstructuraProduccionDTO } from './StructureDTOs';

// --- DTOs de Producción (Público vs. Protegido) ---
export interface ProduccionProtectedResponseDTO {
  codigoProduccion: string;
  codigoVersion: string;
  encargado: string | null;
  emailCreador: string;
  lote: string | null;
  estado: ProductionState;
  fechaInicio: string;
  fechaFin: string | null;
  observaciones: string | null;
  fechaModificacion: string | null;
}

export interface ProduccionPublicMetadataDTO {
  codigoProduccion: string;
  codigoVersion: string;
  lote: string | null;
  encargado: string | null;
  estado: ProductionState;
  fechaInicio: string;
  fechaFin: string | null;
  fechaModificacion: string | null;
}

// --- Tipos Comunes y Anidados ---
export interface RespuestaCampoDTO {
  idRespuesta: number;
  idCampo: number;
  valor: string;
  timestamp: string;
}

export interface RespuestaTablaDTO {
  idTabla: number;
  idFila: number;
  idColumna: number;
  tipoDatoColumna: string;
  nombreFila: string;
  nombreColumna: string;
  valor: string;
  timestampRespuesta: string;
}

export interface ProgresoProduccionResponseDTO {
  totalCampos: number;
  camposRespondidos: number;
  totalCeldasTablas: number;
  celdasRespondidas: number;
  totalElementos: number;
  elementosRespondidos: number;
  porcentajeCompletado: number;
}

// --- DTOs de Respuestas (Público vs. Protegido) ---
export interface RespuestasProduccionPublicDTO {
  produccion: ProduccionPublicMetadataDTO;
  respuestasCampos: RespuestaCampoDTO[];
  respuestasTablas: RespuestaTablaDTO[];
  progreso: ProgresoProduccionResponseDTO;
  timestampConsulta: string;
}

export interface RespuestasProduccionProtectedDTO {
  produccion: ProduccionProtectedResponseDTO;
  respuestasCampos: RespuestaCampoDTO[];
  respuestasTablas: RespuestaTablaDTO[];
  progreso: ProgresoProduccionResponseDTO;
  timestampConsulta: string;
}

// --- DTO de Estado Completo (Solo para endpoint protegido) ---
export interface EstadoActualProduccionResponseDTO {
  produccion: ProduccionProtectedResponseDTO;
  estructura: EstructuraProduccionDTO;
  respuestasCampos: RespuestaCampoDTO[];
  respuestasTablas: RespuestaTablaDTO[];
  progreso: ProgresoProduccionResponseDTO;
  timestampConsulta: string;
}

export interface UltimaModificacionDTO {
  ultimaModificacion: string;
}
