import { ProductionState } from '@/constants/ProductionStates';

export interface FieldUpdatePayload {
  idCampo: number;
  valor: string;
  timestamp: string;
}

export interface TableCellUpdatePayload {
  idTabla: number;
  idFila: number;
  idColumna: number;
  valor: string;
  timestamp: string;
}

export interface ProductionStateUpdatePayload {
  estado: ProductionState;
  fechaFin?: string | null;
  timestamp: string;
}

export interface ProductionMetadataCreatedPayload {
  codigoVersion?: string;
  lote?: string | null;
  fechaInicio?: string;
  fechaFin?: string | null;
}

export interface ProductionMetadataUpdatedPayload {
  codigoProduccion: string;
  lote: string;
  encargado: string;
  observaciones: string;
}

export interface ProductionDeletedPayload {
  codigoProduccion: string;
  timestamp: string;
}
