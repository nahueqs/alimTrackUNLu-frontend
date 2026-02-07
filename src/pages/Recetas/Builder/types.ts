import { TipoDatoCampo } from '../types/TipoDatoCampo';

// Tipos para el Builder (Frontend Only)
// Usamos string para IDs temporales (UUIDs generados en cliente)

export interface DraftRecipe {
  metadata: DraftMetadata;
  sections: DraftSection[];
}

export interface DraftMetadata {
  nombre: string;
  descripcion: string;
  codigoRecetaPadre: string; // Si es nueva versión
  codigoVersion: string;     // Identificador de la versión
}

export interface DraftSection {
  id: string; // UUID temporal
  titulo: string;
  orden: number;
  campos: DraftField[];
  grupos: DraftGroup[];
  tablas: DraftTable[];
}

export interface DraftGroup {
  id: string;
  subtitulo: string;
  orden: number;
  campos: DraftField[];
}

export interface DraftField {
  id: string;
  nombre: string;
  tipoDato: TipoDatoCampo;
  orden: number;
  // Propiedades futuras: requerido, valorPorDefecto, etc.
}

export interface DraftTable {
  id: string;
  nombre: string;
  orden: number;
  columnas: DraftColumn[];
  filas: DraftRow[];
}

export interface DraftColumn {
  id: string;
  nombre: string;
  tipoDato: TipoDatoCampo;
  orden: number;
}

export interface DraftRow {
  id: string;
  nombre: string;
  orden: number;
}
