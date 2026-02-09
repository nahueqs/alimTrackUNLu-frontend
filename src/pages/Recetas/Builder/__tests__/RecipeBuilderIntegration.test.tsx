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
const mockGetEstructuraCompleta = vi.fn();

vi.mock('@/services/recetas/useVersionRecetaService', () => ({
  useVersionRecetaService: () => ({
    createVersion: mockCreateVersion,
    versiones: [
      { codigoVersionReceta: 'V1', nombre: 'Receta Plantilla', codigoRecetaPadre: 'P1' }
    ],
    getAllVersiones: vi.fn(),
    getEstructuraCompleta: mockGetEstructuraCompleta,
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

describe('RecipeBuilderPage - Integración y Flujos', () => {
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

  it('Carga una plantilla y llena el formulario', async () => {
    const user = userEvent.setup();
    
    // Mock de la estructura que devolverá el servicio
    mockGetEstructuraCompleta.mockResolvedValue({
      metadata: { 
        nombre: 'Receta Plantilla', 
        codigoRecetaPadre: 'REC-PADRE-001',
        codigoVersionReceta: 'V1',
        nombreRecetaPadre: 'Receta Padre Test',
        descripcion: 'Desc original'
      },
      estructura: [
        { 
          id: 1, 
          titulo: 'Sección de Plantilla', 
          orden: 1,
          camposSimples: [{ id: 101, nombre: 'Campo de Plantilla', tipoDato: 'texto', orden: 1 }], 
          gruposCampos: [], 
          tablas: [] 
        }
      ]
    });

    renderWithAuth(<RecipeBuilderPage />);
    await waitFor(() => expect(screen.queryByText('Verificando sesión...')).not.toBeInTheDocument());

    // 1. Abrir el modal de plantillas
    await user.click(screen.getByRole('button', { name: /copiar de plantilla/i }));
    
    // 2. Seleccionar la plantilla dentro del modal
    const modal = await screen.findByRole('dialog');
    const select = within(modal).getByRole('combobox');
    
    // AntD Select interaction: click to open, then click option
    await user.click(select);
    
    // La opción se renderiza en un portal (fuera del modal en el DOM), así que usamos screen global
    // El texto en el Select es `${v.nombre} ({v.codigoVersionReceta})`
    const option = await screen.findByText('Receta Plantilla (V1)');
    await user.click(option);

    // 3. Cargar la plantilla
    const loadButton = within(modal).getByRole('button', { name: /cargar/i });
    await user.click(loadButton);

    // 4. Verificar que el formulario se llenó
    await waitFor(() => {
      // Metadata
      expect(screen.getByPlaceholderText('Ej: Versión Verano 2024')).toHaveValue('Copia de Receta Plantilla');
      // Código de versión debe estar vacío
      expect(screen.getByPlaceholderText('Ej: V1.0')).toHaveValue('');
      
      // Estructura
      expect(screen.getByDisplayValue('Sección de Plantilla')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Campo de Plantilla')).toBeInTheDocument();
    });
  });

  it('Permite duplicar una sección', async () => {
    const user = userEvent.setup();
    renderWithAuth(<RecipeBuilderPage />);
    await waitFor(() => expect(screen.queryByText('Verificando sesión...')).not.toBeInTheDocument());

    // Agregar una sección
    await user.click(screen.getByRole('button', { name: /agregar sección/i }));
    
    // Escribir nombre en la sección
    const sectionInput = screen.getByPlaceholderText('Ingrese el título de la sección');
    await user.clear(sectionInput);
    await user.type(sectionInput, 'Sección Original');

    // Duplicar la sección (botón con icono CopyOutlined)
    // Buscamos el botón dentro del card de la sección
    const duplicateButtons = screen.getAllByRole('button', { name: /duplicar/i });
    // El primero debería ser el de la sección (si no hay otros elementos duplicables aún)
    await user.click(duplicateButtons[0]);

    // Verificar que aparece la copia
    await waitFor(() => {
      expect(screen.getByDisplayValue('Sección Original (Copia)')).toBeInTheDocument();
    });
  });
});
