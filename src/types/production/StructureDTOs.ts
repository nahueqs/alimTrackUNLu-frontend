import type { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo.ts';

export interface EstructuraProduccionDTO {
  metadata: VersionRecetaMetadataResponseDTO;
  estructura: SeccionResponseDTO[];
  totalCampos: number;
  totalCeldas: number;
}

export interface VersionRecetaMetadataResponseDTO {
  codigoVersionReceta: string;
  codigoRecetaPadre: string;
  nombreRecetaPadre: string;
  nombre: string;
  descripcion: string | null;
  fechaCreacion: string;
}

export interface SeccionResponseDTO {
  id: number;
  codigoVersion: string;
  titulo: string;
  orden: number;
  camposSimples: CampoSimpleResponseDTO[];
  gruposCampos: GrupoCamposResponseDTO[];
  tablas: TablaResponseDTO[];
}

export interface GrupoCamposResponseDTO {
  id: number;
  idSeccion: number;
  subtitulo: string;
  orden: number;
  campos: CampoSimpleResponseDTO[];
}

export interface CampoSimpleResponseDTO {
  id: number;
  idSeccion: number;
  idGrupo: number | null;
  nombre: string;
  descripcion?: string | null; // Agregado campo descripcion
  tipoDato: TipoDatoCampo;
  orden: number;
}

export interface TablaResponseDTO {
  id: number;
  idSeccion: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  columnas?: ColumnaTablaResponseDTO[];
  filas?: FilaTablaResponseDTO[];
}

export interface ColumnaTablaResponseDTO {
  id: number;
  idTabla: number;
  nombre: string;
  orden: number;
  tipoDato: TipoDatoCampo;
}

export interface FilaTablaResponseDTO {
  id: number;
  idTabla: number;
  nombre: string;
  orden: number;
}
