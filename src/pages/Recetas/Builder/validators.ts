import type { DraftRecipe } from './types';

export const validateRecipeStructure = (recipe: DraftRecipe): string | null => {
  // 1. Validar unicidad de nombres de secciones y longitud
  const sectionTitles = recipe.sections.map(s => s.titulo.trim());
  const uniqueSectionTitles = new Set(sectionTitles.map(t => t.toLowerCase()));
  
  if (sectionTitles.length !== uniqueSectionTitles.size) {
    return "No puede haber dos secciones con el mismo nombre.";
  }

  for (const title of sectionTitles) {
      if (title.length < 2 || title.length > 255) {
          return `El título de la sección "${title}" debe tener entre 2 y 255 caracteres.`;
      }
  }

  for (const section of recipe.sections) {
    // 2. Validar campos simples
    const fieldNames = section.campos.map(f => f.nombre.trim());
    const uniqueFieldNames = new Set(fieldNames.map(n => n.toLowerCase()));
    
    if (fieldNames.length !== uniqueFieldNames.size) {
      return `En la sección "${section.titulo}", los nombres de los campos simples deben ser únicos.`;
    }
    for (const name of fieldNames) {
        if (name.length < 2 || name.length > 255) {
            return `En la sección "${section.titulo}", el campo "${name}" debe tener entre 2 y 255 caracteres.`;
        }
    }

    // 3. Validar grupos
    const groupTitles = section.grupos.map(g => g.subtitulo.trim());
    const uniqueGroupTitles = new Set(groupTitles.map(t => t.toLowerCase()));
    
    if (groupTitles.length !== uniqueGroupTitles.size) {
      return `En la sección "${section.titulo}", los subtítulos de los grupos deben ser únicos.`;
    }
    for (const title of groupTitles) {
        if (title.length < 2 || title.length > 255) {
            return `En la sección "${section.titulo}", el grupo "${title}" debe tener entre 2 y 255 caracteres.`;
        }
    }

    // 4. Validar tablas
    const tableNames = section.tablas.map(t => t.nombre.trim());
    const uniqueTableNames = new Set(tableNames.map(n => n.toLowerCase()));
    
    if (tableNames.length !== uniqueTableNames.size) {
      return `En la sección "${section.titulo}", los nombres de las tablas deben ser únicos.`;
    }
    for (const name of tableNames) {
        if (name.length < 2 || name.length > 255) {
            return `En la sección "${section.titulo}", la tabla "${name}" debe tener entre 2 y 255 caracteres.`;
        }
    }

    // 5. Validar campos dentro de grupos
    for (const group of section.grupos) {
      const groupFieldNames = group.campos.map(f => f.nombre.trim());
      const uniqueGroupFieldNames = new Set(groupFieldNames.map(n => n.toLowerCase()));
      
      if (groupFieldNames.length !== uniqueGroupFieldNames.size) {
        return `En el grupo "${group.subtitulo}" (Sección "${section.titulo}"), los nombres de los campos deben ser únicos.`;
      }
      for (const name of groupFieldNames) {
          if (name.length < 2 || name.length > 255) {
              return `En el grupo "${group.subtitulo}", el campo "${name}" debe tener entre 2 y 255 caracteres.`;
          }
      }
    }

    // 6. Validar filas y columnas en tablas
    for (const table of section.tablas) {
      // Columnas
      const colNames = table.columnas.map(c => c.nombre.trim());
      const uniqueColNames = new Set(colNames.map(n => n.toLowerCase()));
      
      if (colNames.length !== uniqueColNames.size) {
        return `En la tabla "${table.nombre}" (Sección "${section.titulo}"), los nombres de las columnas deben ser únicos.`;
      }
      for (const name of colNames) {
          if (name.length < 2 || name.length > 255) {
              return `En la tabla "${table.nombre}", la columna "${name}" debe tener entre 2 y 255 caracteres.`;
          }
      }

      // Filas
      const rowNames = table.filas.map(r => r.nombre.trim());
      const uniqueRowNames = new Set(rowNames.map(n => n.toLowerCase()));
      
      if (rowNames.length !== uniqueRowNames.size) {
        return `En la tabla "${table.nombre}" (Sección "${section.titulo}"), los nombres de las filas deben ser únicos.`;
      }
      for (const name of rowNames) {
          if (name.length < 2 || name.length > 255) {
              return `En la tabla "${table.nombre}", la fila "${name}" debe tener entre 2 y 255 caracteres.`;
          }
      }
    }
  }

  return null; // No errors
};
