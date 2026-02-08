export interface VersionRecetaLlenaCreateDTO {
  codigoRecetaPadre: string;
  codigoVersionReceta: string;
  nombre: string;
  descripcion: string;
  emailCreador: string;
  secciones: SeccionCreateDTO[];
}

export interface SeccionCreateDTO {
  codigoVersionRecetaPadre: string;
  emailCreador: string;
  titulo: string;
  tipo: string;
  orden: number;
  camposSimples: CampoSimpleCreateDTO[];
  gruposCampos: GrupoCamposCreateDTO[];
  tablas: TablaCreateDTO[];
}

export interface CampoSimpleCreateDTO {
  nombre: string;
  tipoDato: string;
  idGrupo: number | null;
  orden: number;
}

export interface GrupoCamposCreateDTO {
  subtitulo: string;
  camposSimples: CampoSimpleCreateDTO[];
}

export interface TablaCreateDTO {
  nombre: string;
  descripcion: string;
  orden: number;
  filas: FilaTablaCreateDTO[];
  columnas: ColumnaTablaCreateDTO[];
}

export interface FilaTablaCreateDTO {
  nombre: string;
  orden: number;
}

export interface ColumnaTablaCreateDTO {
  nombre: string;
  tipoDato: string;
  orden: number;
}
