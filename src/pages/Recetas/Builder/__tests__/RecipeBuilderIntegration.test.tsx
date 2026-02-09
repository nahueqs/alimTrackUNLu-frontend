import { render, screen, fireEvent, waitFor, within } from '@/test/test-utils';
import { RecipeBuilderPage } from '../RecipeBuilderPage';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/context/auth/AuthProvider';

// Mock de los hooks de servicio
vi.mock('@/services/recetas/useRecetaPadreService', () => ({
  useRecetaPadreService: () => ({
    recetas: [
      { codigoReceta: 'REC-PADRE-001', nombre: 'Receta Padre Test' }
    ],
    loading: false,
    getAllRecetas: vi.fn(),
    createReceta: vi.fn(),
  }),
}));

const mockCreateVersion = vi.fn();

vi.mock('@/services/recetas/useVersionRecetaService', () => ({
  useVersionRecetaService: () => ({
    createVersion: mockCreateVersion,
    loading: false,
  }),
}));

// Mock del servicio de Auth
vi.mock('@/services/auth/AuthService', () => ({
  authService: {
    getCurrentUser: vi.fn().mockResolvedValue({ email: 'test@test.com', nombre: 'Test User' }),
    refreshToken: vi.fn(),
  },
}));

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

window.scrollTo = vi.fn() as any;

describe('RecipeBuilderPage - Validaciones de Creación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('authToken', 'fake-token');
  });

  const renderWithAuth = (ui: React.ReactElement) => {
    return render(
      <AuthProvider>
        {ui}
      </AuthProvider>
    );
  };

  const fillMetadata = async (user: any) => {
    const select = screen.getByRole('combobox');
    await user.click(select);

    const option = await screen.findByText('Receta Padre Test (REC-PADRE-001)');
    await user.click(option);

    await user.type(screen.getByPlaceholderText('Ej: Versión Verano 2024'), 'Receta Test');
    await user.type(screen.getByPlaceholderText('Ej: V1.0'), 'REC-001');
  };

  // Helper para encontrar botones de agregar en la sección
  const clickAddButton = async (user: any, index: number) => {
    const addButtons = screen.getAllByRole('button', { name: /agregar/i });
    if (addButtons[index + 1]) {
        await user.click(addButtons[index + 1]);
    } else {
        throw new Error(`No se encontró el botón de agregar índice ${index}`);
    }
  };

  it('No permite guardar sin Metadata (Nombre/Código)', async () => {
    const user = userEvent.setup();
    renderWithAuth(<RecipeBuilderPage />);
    await waitFor(() => expect(screen.queryByText('Verificando sesión...')).not.toBeInTheDocument());

    const saveButton = screen.getByRole('button', { name: /guardar versión/i });
    await user.click(saveButton);

    expect(mockCreateVersion).not.toHaveBeenCalled();
  });

  it('No permite guardar una receta sin estructura (Secciones)', async () => {
    const user = userEvent.setup();
    renderWithAuth(<RecipeBuilderPage />);
    await waitFor(() => expect(screen.queryByText('Verificando sesión...')).not.toBeInTheDocument());

    await fillMetadata(user);
    
    const saveButton = screen.getByRole('button', { name: /guardar versión/i });
    await user.click(saveButton);

    expect(mockCreateVersion).not.toHaveBeenCalled();
  });

  it('Impide dejar un grupo vacío (no borra el último campo) y permite guardar', async () => {
    const user = userEvent.setup();
    renderWithAuth(<RecipeBuilderPage />);
    await waitFor(() => expect(screen.queryByText('Verificando sesión...')).not.toBeInTheDocument());

    await fillMetadata(user);

    // Agregar Sección
    await user.click(screen.getByRole('button', { name: /agregar sección/i }));
    
    const inputs = screen.getAllByRole('textbox');
    const sectionInput = inputs.find(i => (i as HTMLInputElement).value === '');
    if (sectionInput) await user.type(sectionInput, 'Sección 1');

    // Agregar Grupo (Índice 1 = Grupos)
    await clickAddButton(user, 1);
    
    const inputsAfterGroup = screen.getAllByRole('textbox');
    const groupInput = inputsAfterGroup.find(i => (i as HTMLInputElement).value === '');
    if (groupInput) await user.type(groupInput, 'Grupo Válido');

    // Intentar eliminar el único campo del grupo
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    if (deleteButtons.length > 0) {
        await user.click(deleteButtons[deleteButtons.length - 1]);
    }

    // Guardar
    const saveButton = screen.getByRole('button', { name: /guardar versión/i });
    await user.click(saveButton);

    // DEBE llamarse, porque el campo no se borró y la receta es válida
    expect(mockCreateVersion).toHaveBeenCalled();
  });

  it('No permite guardar tablas sin columnas o sin filas', async () => {
    const user = userEvent.setup();
    renderWithAuth(<RecipeBuilderPage />);
    await waitFor(() => expect(screen.queryByText('Verificando sesión...')).not.toBeInTheDocument());

    await fillMetadata(user);
    await user.click(screen.getByRole('button', { name: /agregar sección/i }));
    
    const inputs = screen.getAllByRole('textbox');
    const sectionInput = inputs.find(i => (i as HTMLInputElement).value === '');
    if (sectionInput) await user.type(sectionInput, 'Sección 1');

    // Agregar Tabla (Índice 2 = Tablas)
    await clickAddButton(user, 2);
    
    const inputsAfterTable = screen.getAllByRole('textbox');
    const tableInput = inputsAfterTable.find(i => (i as HTMLInputElement).value === '');
    if (tableInput) await user.type(tableInput, 'Tabla Incompleta');

    // Guardar (Tabla vacía)
    const saveButton = screen.getByRole('button', { name: /guardar versión/i });
    await user.click(saveButton);
    expect(mockCreateVersion).not.toHaveBeenCalled();
  });
});
