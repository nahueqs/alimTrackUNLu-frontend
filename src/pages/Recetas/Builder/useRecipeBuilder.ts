import { useState, useCallback } from 'react';
import { DraftRecipe, DraftSection, DraftField, DraftGroup, DraftTable, DraftColumn, DraftRow } from './types';
import { TipoDatoCampo } from '../types/TipoDatoCampo';

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

export const useRecipeBuilder = (initialState: DraftRecipe = INITIAL_RECIPE) => {
  const [recipe, setRecipe] = useState<DraftRecipe>(initialState);

  // --- Metadata Actions ---
  const updateMetadata = useCallback((field: keyof DraftRecipe['metadata'], value: string) => {
    setRecipe(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value }
    }));
  }, []);

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

  // --- Group Actions ---
  const addGroupToSection = useCallback((sectionId: string) => {
    setRecipe(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        const newGroup: DraftGroup = {
          id: generateId(),
          subtitulo: 'Nuevo Grupo',
          orden: s.grupos.length,
          campos: []
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
            return { ...g, campos: g.campos.filter(f => f.id !== fieldId) };
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
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s;
        return { ...s, tablas: s.tablas.filter(t => t.id !== tableId) };
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
    actions: {
      updateMetadata,
      addSection,
      updateSection,
      removeSection,
      addFieldToSection,
      updateField,
      removeField,
      addGroupToSection,
      updateGroup,
      removeGroup,
      addFieldToGroup,
      updateGroupField,
      removeGroupField,
      addTableToSection,
      updateTable,
      removeTable,
      addColumnToTable,
      updateColumn,
      removeColumn,
      addRowToTable,
      updateRow,
      removeRow
    }
  };
};
