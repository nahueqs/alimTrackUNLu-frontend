import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';

export interface DraftCampo {
  tempId: string;
  nombre: string;
  tipoDato: TipoDatoCampo;
  orden: number;
}

export interface DraftGrupo {
  tempId: string;
  subtitulo: string;
  orden: number;
  campos: DraftCampo[];
}

export interface DraftColumna {
  tempId: string;
  nombre: string;
  tipoDato: TipoDatoCampo;
  orden: number;
}

export interface DraftFila {
  tempId: string;
  nombre: string;
  orden: number;
}

export interface DraftTabla {
  tempId: string;
  nombre: string;
  descripcion: string;
  orden: number;
  columnas: DraftColumna[];
  filas: DraftFila[];
}

export interface DraftSeccion {
  tempId: string;
  titulo: string;
  orden: number;
  camposSimples: DraftCampo[];
  gruposCampos: DraftGrupo[];
  tablas: DraftTabla[];
}

export interface DraftReceta {
  nombre: string;
  descripcion: string;
  codigoRecetaPadre: string;
  secciones: DraftSeccion[];
}
