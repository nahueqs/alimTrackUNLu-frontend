import type { DraftRecipe, DraftSection, DraftGroup, DraftTable, DraftField } from './types';
import type {
  VersionRecetaLlenaCreateDTO,
  SeccionCreateDTO,
  CampoSimpleCreateDTO,
  GrupoCamposCreateDTO,
  TablaCreateDTO
} from '@/types/production/RecipeDTOs';

export const mapDraftToDTO = (draft: DraftRecipe, emailCreador: string): VersionRecetaLlenaCreateDTO => {
  return {
    codigoRecetaPadre: draft.metadata.codigoRecetaPadre,
    codigoVersionReceta: draft.metadata.codigoVersion,
    nombre: draft.metadata.nombre,
    descripcion: draft.metadata.descripcion,
    emailCreador: emailCreador,
    // Pasamos index + 1 para que el orden empiece en 1
    secciones: draft.sections.map((section, index) => mapSectionToDTO(section, index + 1, draft.metadata.codigoVersion, emailCreador)),
  };
};

const mapSectionToDTO = (
  section: DraftSection, 
  orden: number, 
  codigoVersionPadre: string, 
  emailCreador: string
): SeccionCreateDTO => {
  return {
    codigoVersionRecetaPadre: codigoVersionPadre,
    emailCreador: emailCreador,
    titulo: section.titulo,
    orden: orden, // Usamos el orden recibido directamente (ya es 1-based)
    camposSimples: section.campos.map((field, idx) => mapFieldToDTO(field, idx + 1, null)),
    gruposCampos: section.grupos.map((group, idx) => mapGroupToDTO(group, idx + 1)), // Pasamos orden 1-based
    tablas: section.tablas.map((table, idx) => mapTableToDTO(table, idx + 1)),
  };
};

const mapFieldToDTO = (field: DraftField, orden: number, idGrupo: number | null): CampoSimpleCreateDTO => {
  return {
    nombre: field.nombre,
    tipoDato: field.tipoDato,
    idGrupo: idGrupo,
    orden: orden, // Usamos el orden recibido directamente
  };
};

const mapGroupToDTO = (group: DraftGroup, orden: number): GrupoCamposCreateDTO => {
  return {
    subtitulo: group.subtitulo,
    orden: orden, // Asignamos el orden
    camposSimples: group.campos.map((field, idx) => mapFieldToDTO(field, idx + 1, 0)), // idGrupo 0 o null
  };
};

const mapTableToDTO = (table: DraftTable, orden: number): TablaCreateDTO => {
  return {
    nombre: table.nombre,
    descripcion: table.descripcion || "",
    orden: orden, // Usamos el orden recibido directamente
    filas: table.filas.map((row, idx) => ({
      nombre: row.nombre,
      orden: idx + 1,
    })),
    columnas: table.columnas.map((col, idx) => ({
      nombre: col.nombre,
      tipoDato: col.tipoDato,
      orden: idx + 1,
    })),
  };
};
