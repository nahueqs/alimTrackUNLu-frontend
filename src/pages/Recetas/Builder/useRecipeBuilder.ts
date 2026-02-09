import { useState, useCallback } from 'react';
import type { DraftRecipe, DraftSection, DraftField, DraftGroup, DraftTable, DraftColumn, DraftRow } from './types';
import { TipoDatoCampo } from '../types/TipoDatoCampo';
import { validateRecipeStructure } from './validators';

// Simple ID generator replacement for uuid
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const INITIAL_RECIPE: DraftRecipe = {
  metadata: {
    nombre: '',
    descripcion: '',
    codigoRecetaPadre: '',
    codigoVersion: '',
  },
  sections: [],
};

// Exportamos el tipo de retorno para usarlo en otros componentes
export type UseRecipeBuilderReturn = ReturnType<typeof useRecipeBuilder>;

export const useRecipeBuilder = (initialState: DraftRecipe = INITIAL_RECIPE) => {
  const [recipe, setRecipe] = useState<DraftRecipe>(initialState);

  // Nueva acción para cargar un borrador completo
  const loadDraft = useCallback((newDraft: DraftRecipe) => {
    setRecipe(newDraft);
  }, []);

  // --- Validation Logic ---
  const validateRecipe = useCallback((): string | null => {
    // Validación adicional para grupos vacíos
    for (const section of recipe.sections) {
      for (const group of section.grupos) {
        if (group.campos.length === 0) {
          return `El grupo "${group.subtitulo}" en la sección "${section.titulo}" debe tener al menos un campo.`;
        }
      }
    }
    return validateRecipeStructure(recipe);
  }, [recipe]);

  // --- Metadata Actions ---
  const updateMetadata = useCallback((field: keyof DraftRecipe['metadata'], value: string) => {
    setRecipe(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value }
    }));
  }, []);

  // --- Helper para mover elementos en un array ---
  const moveItem = <T>(array: T[], index: number, direction: 'up' | 'down'): T[] => {
    if (direction === 'up' && index === 0) return array;
    if (direction === 'down' && index === array.length - 1) return array;
    
    const newArray = [...array];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newArray[index], newArray[targetIndex]] = [newArray[targetIndex], newArray[index]];
    return newArray;
  };

  // --- Section Actions ---
  const addSection = useCallback(() => {
    const newSection: DraftSection = {
      id: generateId(),
      titulo: 'Nueva Sección',
      orden: recipe.sections.length,
      campos: [],
      grupos: [],
      tablas: []
    };
    setRecipe(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
  }, [recipe.sections.length]);

  const updateSection = useCallback((sectionId: string, updates: Partial<DraftSection>) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
    }));
  }, []);

  const removeSection = useCallback((sectionId: string) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  }, []);

  const moveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    setRecipe(prev => {
      const index = prev.sections.findIndex(s => s.id === sectionId);
      if (index === -1) return prev;
      return { ...prev, sections: moveItem(prev.sections, index, direction) };
    });
  }, []);

  // --- Field Actions (Top Level) ---
  const addFieldToSection = useCallback((sectionId: string) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        const newField: DraftField = {
          id: generateId(),
          nombre: 'Nuevo Campo',
          tipoDato: TipoDatoCampo.TEXTO,
          orden: s.campos.length
        };
        return { ...s, campos: [...s.campos, newField] };
      })
    }));
  }, []);

  const updateField = useCallback((sectionId: string, fieldId: string, updates: Partial<DraftField>) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          campos: s.campos.map(f => f.id === fieldId ? { ...f, ...updates } : f)
        };
      })
    }));
  }, []);

  const removeField = useCallback((sectionId: string, fieldId: string) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return { ...s, campos: s.campos.filter(f => f.id !== fieldId) };
      })
    }));
  }, []);

  const moveField = useCallback((sectionId: string, fieldId: string, direction: 'up' | 'down') => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        const index = s.campos.findIndex(f => f.id === fieldId);
        if (index === -1) return s;
        return { ...s, campos: moveItem(s.campos, index, direction) };
      })
    }));
  }, []);

  // --- Group Actions ---
  const addGroupToSection = useCallback((sectionId: string) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        
        // Crear campo por defecto
        const defaultField: DraftField = {
          id: generateId(),
          nombre: 'Campo 1',
          tipoDato: TipoDatoCampo.TEXTO,
          orden: 0
        };

        const newGroup: DraftGroup = {
          id: generateId(),
          subtitulo: 'Nuevo Grupo',
          orden: s.grupos.length,
          campos: [defaultField] // Inicializar con un campo
        };
        return { ...s, grupos: [...s.grupos, newGroup] };
      })
    }));
  }, []);

  const updateGroup = useCallback((sectionId: string, groupId: string, updates: Partial<DraftGroup>) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          grupos: s.grupos.map(g => g.id === groupId ? { ...g, ...updates } : g)
        };
      })
    }));
  }, []);

  const removeGroup = useCallback((sectionId: string, groupId: string) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return { ...s, grupos: s.grupos.filter(g => g.id !== groupId) };
      })
    }));
  }, []);

  const moveGroup = useCallback((sectionId: string, groupId: string, direction: 'up' | 'down') => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        const index = s.grupos.findIndex(g => g.id === groupId);
        if (index === -1) return s;
        return { ...s, grupos: moveItem(s.grupos, index, direction) };
      })
    }));
  }, []);

  // --- Field Actions (Inside Group) ---
  const addFieldToGroup = useCallback((sectionId: string, groupId: string) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          grupos: s.grupos.map(g => {
            if (g.id !== groupId) return g;
            const newField: DraftField = {
              id: generateId(),
              nombre: 'Campo de Grupo',
              tipoDato: TipoDatoCampo.TEXTO,
              orden: g.campos.length
            };
            return { ...g, campos: [...g.campos, newField] };
          })
        };
      })
    }));
  }, []);

  const updateGroupField = useCallback((sectionId: string, groupId: string, fieldId: string, updates: Partial<DraftField>) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          grupos: s.grupos.map(g => {
            if (g.id !== groupId) return g;
            return {
              ...g,
              campos: g.campos.map(f => f.id === fieldId ? { ...f, ...updates } : f)
            };
          })
        };
      })
    }));
  }, []);

  const removeGroupField = useCallback((sectionId: string, groupId: string, fieldId: string) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          grupos: s.grupos.map(g => {
            if (g.id !== groupId) return g;
            // Validar que no sea el último campo
            if (g.campos.length <= 1) {
              return g; // No hacer nada si es el último
            }
            return { ...g, campos: g.campos.filter(f => f.id !== fieldId) };
          })
        };
      })
    }));
  }, []);

  const moveGroupField = useCallback((sectionId: string, groupId: string, fieldId: string, direction: 'up' | 'down') => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          grupos: s.grupos.map(g => {
            if (g.id !== groupId) return g;
            const index = g.campos.findIndex(f => f.id === fieldId);
            if (index === -1) return g;
            return { ...g, campos: moveItem(g.campos, index, direction) };
          })
        };
      })
    }));
  }, []);

  // --- Table Actions ---
  const addTableToSection = useCallback((sectionId: string) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        const newTable: DraftTable = {
          id: generateId(),
          nombre: 'Nueva Tabla',
          descripcion: '',
          orden: s.tablas.length,
          columnas: [],
          filas: []
        };
        return { ...s, tablas: [...s.tablas, newTable] };
      })
    }));
  }, []);

  const updateTable = useCallback((sectionId: string, tableId: string, updates: Partial<DraftTable>) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          tablas: s.tablas.map(t => t.id === tableId ? { ...t, ...updates } : t)
        };
      })
    }));
  }, []);

  const removeTable = useCallback((sectionId: string, tableId: string) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  }, []);

  const moveTable = useCallback((sectionId: string, tableId: string, direction: 'up' | 'down') => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        const index = s.tablas.findIndex(t => t.id === tableId);
        if (index === -1) return s;
        return { ...s, tablas: moveItem(s.tablas, index, direction) };
      })
    }));
  }, []);

  // --- Table Column/Row Actions ---
  const addColumnToTable = useCallback((sectionId: string, tableId: string) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          tablas: s.tablas.map(t => {
            if (t.id !== tableId) return t;
            const newCol: DraftColumn = {
              id: generateId(),
              nombre: 'Columna',
              tipoDato: TipoDatoCampo.TEXTO,
              orden: t.columnas.length
            };
            return { ...t, columnas: [...t.columnas, newCol] };
          })
        };
      })
    }));
  }, []);

  const updateColumn = useCallback((sectionId: string, tableId: string, colId: string, updates: Partial<DraftColumn>) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          tablas: s.tablas.map(t => {
            if (t.id !== tableId) return t;
            return {
              ...t,
              columnas: t.columnas.map(c => c.id === colId ? { ...c, ...updates } : c)
            };
          })
        };
      })
    }));
  }, []);

  const removeColumn = useCallback((sectionId: string, tableId: string, colId: string) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          tablas: s.tablas.map(t => {
            if (t.id !== tableId) return t;
            return { ...t, columnas: t.columnas.filter(c => c.id !== colId) };
          })
        };
      })
    }));
  }, []);

  const addRowToTable = useCallback((sectionId: string, tableId: string) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          tablas: s.tablas.map(t => {
            if (t.id !== tableId) return t;
            const newRow: DraftRow = {
              id: generateId(),
              nombre: 'Fila',
              orden: t.filas.length
            };
            return { ...t, filas: [...t.filas, newRow] };
          })
        };
      })
    }));
  }, []);

  const updateRow = useCallback((sectionId: string, tableId: string, rowId: string, updates: Partial<DraftRow>) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          tablas: s.tablas.map(t => {
            if (t.id !== tableId) return t;
            return {
              ...t,
              filas: t.filas.map(r => r.id === rowId ? { ...r, ...updates } : r)
            };
          })
        };
      })
    }));
  }, []);

  const removeRow = useCallback((sectionId: string, tableId: string, rowId: string) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          tablas: s.tablas.map(t => {
            if (t.id !== tableId) return t;
            return { ...t, filas: t.filas.filter(r => r.id !== rowId) };
          })
        };
      })
    }));
  }, []);

  return {
    recipe,
    validateRecipe,
    loadDraft, // Añadimos la nueva acción
    actions: {
      updateMetadata,
      addSection,
      updateSection,
      removeSection,
      moveSection,
      addFieldToSection,
      updateField,
      removeField,
      moveField,
      addGroupToSection,
      updateGroup,
      removeGroup,
      moveGroup,
      addFieldToGroup,
      updateGroupField,
      removeGroupField,
      moveGroupField,
      addTableToSection,
      updateTable,
      removeTable,
      moveTable,
      addColumnToTable,
      updateColumn,
      removeColumn,
      addRowToTable,
      updateRow,
      removeRow
    }
  };
};
