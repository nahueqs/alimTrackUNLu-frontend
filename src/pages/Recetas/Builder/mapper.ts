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
    secciones: draft.sections.map((section, index) => mapSectionToDTO(section, index, draft.metadata.codigoVersion, emailCreador)),
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
    orden: orden, // Backend suele usar 1-based index
    camposSimples: section.campos.map((field, idx) => mapFieldToDTO(field, idx, null)),
    gruposCampos: section.grupos.map((group) => mapGroupToDTO(group)),
    tablas: section.tablas.map((table, idx) => mapTableToDTO(table, idx)),
  };
};

const mapFieldToDTO = (field: DraftField, orden: number, idGrupo: number | null): CampoSimpleCreateDTO => {
  return {
    nombre: field.nombre,
    tipoDato: field.tipoDato,
    idGrupo: idGrupo,
    orden: orden + 1,
  };
};

const mapGroupToDTO = (group: DraftGroup): GrupoCamposCreateDTO => {
  return {
    subtitulo: group.subtitulo,
    camposSimples: group.campos.map((field, idx) => mapFieldToDTO(field, idx, 0)), // idGrupo 0 o null ya que es jerárquico
  };
};

const mapTableToDTO = (table: DraftTable, orden: number): TablaCreateDTO => {
  return {
    nombre: table.nombre,
    descripcion: table.descripcion || "",
    orden: orden + 1,
    filas: table.filas.map((row, idx) => ({
      nombre: row.nombre,
      orden: idx,
    })),
    columnas: table.columnas.map((col, idx) => ({
      nombre: col.nombre,
      tipoDato: col.tipoDato,
      orden: idx,
    })),
  };
};
