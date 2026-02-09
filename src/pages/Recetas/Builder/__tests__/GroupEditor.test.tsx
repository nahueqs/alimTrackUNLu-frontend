import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import { vi } from 'vitest';
import { GroupEditor } from '../GroupEditor';
import type { DraftGroup } from '../types';
import type { UseRecipeBuilderReturn } from '../useRecipeBuilder';

// Mock parcial del contexto
const mockActions = {
  updateGroup: vi.fn(),
  removeGroup: vi.fn(),
  moveGroup: vi.fn(),
  addFieldToGroup: vi.fn(),
  removeGroupField: vi.fn(),
  moveGroupField: vi.fn(),
  updateGroupField: vi.fn(),
};

const mockRecipe = {
  sections: [
    {
      id: 'section-1',
      grupos: [
        { id: 'group-1', subtitulo: 'Grupo Inicial', campos: [] }
      ]
    }
  ]
};

const mockContextValue = {
  actions: mockActions,
  recipe: mockRecipe,
} as unknown as UseRecipeBuilderReturn;

// Mock del hook que usa el componente
vi.mock('../RecipeBuilderContext', () => ({
  useRecipeBuilderContext: () => mockContextValue,
}));

describe('GroupEditor', () => {
  const mockGroup: DraftGroup = {
    id: 'group-1',
    subtitulo: 'Grupo Inicial',
    orden: 0,
    campos: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el título del grupo en un Input', () => {
    render(
      <GroupEditor group={mockGroup} sectionId="section-1" />
    );
    
    const input = screen.getByDisplayValue('Grupo Inicial');
    expect(input).toBeInTheDocument();
  });

  it('llama a updateGroup cuando se edita el título', async () => {
    render(
      <GroupEditor group={mockGroup} sectionId="section-1" />
    );

    const input = screen.getByDisplayValue('Grupo Inicial');
    
    // Usamos fireEvent.change para simular un cambio atómico
    // Esto evita problemas con componentes controlados en tests unitarios sin estado
    fireEvent.change(input, { target: { value: 'Nuevo Título' } });

    // Verificar que la acción fue llamada con los datos correctos
    expect(mockActions.updateGroup).toHaveBeenCalledWith(
      'section-1',
      'group-1',
      { subtitulo: 'Nuevo Título' }
    );
  });
});
