import type { EstructuraProduccionDTO } from '@/types/production';
import type { DraftRecipe, DraftSection, DraftField, DraftGroup, DraftTable, DraftColumn, DraftRow } from '../types';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';

// Generador de ID simple (duplicado de useRecipeBuilder para no exportar/importar dependencias circulares)
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const mapEstructuraToDraft = (estructura: EstructuraProduccionDTO): DraftRecipe => {
  const { metadata, estructura: secciones } = estructura;

  const draftSections: DraftSection[] = secciones.map((seccion) => {
    // Mapear Campos Simples
    const campos: DraftField[] = seccion.camposSimples.map((campo) => ({
      id: generateId(), // Nuevo ID
      nombre: campo.nombre,
      tipoDato: campo.tipoDato,
      orden: campo.orden,
    }));

    // Mapear Grupos
    const grupos: DraftGroup[] = seccion.gruposCampos.map((grupo) => ({
      id: generateId(), // Nuevo ID
      subtitulo: grupo.subtitulo,
      orden: grupo.orden,
      campos: grupo.campos.map((campo) => ({
        id: generateId(), // Nuevo ID
        nombre: campo.nombre,
        tipoDato: campo.tipoDato,
        orden: campo.orden,
      })),
    }));

    // Mapear Tablas
    const tablas: DraftTable[] = seccion.tablas.map((tabla) => ({
      id: generateId(), // Nuevo ID
      nombre: tabla.nombre,
      descripcion: tabla.descripcion || '',
      orden: tabla.orden,
      columnas: (tabla.columnas || []).map((col) => ({
        id: generateId(), // Nuevo ID
        nombre: col.nombre,
        tipoDato: col.tipoDato,
        orden: col.orden,
      })),
      filas: (tabla.filas || []).map((fila) => ({
        id: generateId(), // Nuevo ID
        nombre: fila.nombre,
        orden: fila.orden,
      })),
    }));

    return {
      id: generateId(), // Nuevo ID
      titulo: seccion.titulo,
      orden: seccion.orden,
      campos,
      grupos,
      tablas,
    };
  });

  return {
    metadata: {
      nombre: `Copia de ${metadata.nombre}`,
      descripcion: metadata.descripcion || '',
      codigoRecetaPadre: metadata.codigoRecetaPadre, // Mantenemos la receta padre
      codigoVersion: '', // Limpiamos el código de versión para obligar a uno nuevo
    },
    sections: draftSections,
  };
};
