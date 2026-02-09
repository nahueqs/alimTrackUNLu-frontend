import { render, screen, waitFor, fireEvent } from '@/test/test-utils';
import { TemplateSelector } from '../TemplateSelector';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock del servicio
const mockGetAllVersiones = vi.fn();
const mockGetEstructuraCompleta = vi.fn();

vi.mock('@/services/recetas/useVersionRecetaService', () => ({
  useVersionRecetaService: () => ({
    versiones: [
      { codigoVersionReceta: 'V1', nombre: 'Receta Base', codigoRecetaPadre: 'P1' },
      { codigoVersionReceta: 'V2', nombre: 'Receta Avanzada', codigoRecetaPadre: 'P1' }
    ],
    getAllVersiones: mockGetAllVersiones,
    getEstructuraCompleta: mockGetEstructuraCompleta,
    loading: false
  }),
}));

// Mock del mapper para verificar que se llama
vi.mock('../../utils/mapEstructuraToDraft', () => ({
  mapEstructuraToDraft: vi.fn().mockReturnValue({ 
    metadata: { nombre: 'Draft Mapeado' }, 
    sections: [] 
  }),
}));

describe('TemplateSelector', () => {
  const mockOnLoadTemplate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Abre el modal y carga las versiones al hacer click', async () => {
    const user = userEvent.setup();
    render(<TemplateSelector onLoadTemplate={mockOnLoadTemplate} />);

    // 1. Click en el botón principal
    await user.click(screen.getByRole('button', { name: /copiar de plantilla/i }));

    // 2. Verificar que se abre el modal
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/seleccione una versión existente/i)).toBeInTheDocument();

    // 3. Verificar que se llamó al servicio para listar versiones
    expect(mockGetAllVersiones).toHaveBeenCalled();
  });

  it('Selecciona una versión y carga la plantilla', async () => {
    const user = userEvent.setup();
    
    // Mockear respuesta de estructura
    mockGetEstructuraCompleta.mockResolvedValue({
      metadata: { nombre: 'Original' },
      estructura: []
    });

    render(<TemplateSelector onLoadTemplate={mockOnLoadTemplate} />);

    // 1. Abrir modal
    await user.click(screen.getByRole('button', { name: /copiar de plantilla/i }));

    // 2. Abrir el Select (AntD)
    const select = screen.getByRole('combobox');
    await user.click(select);

    // 3. Seleccionar opción "Receta Base (V1)"
    const option = await screen.findByText('Receta Base (V1)');
    await user.click(option);

    // 4. Click en "Cargar" (botón del modal)
    const loadButton = screen.getByRole('button', { name: /cargar/i });
    await user.click(loadButton);

    // 5. Verificar flujo
    expect(mockGetEstructuraCompleta).toHaveBeenCalledWith('V1');
    await waitFor(() => {
        expect(mockOnLoadTemplate).toHaveBeenCalledWith(expect.objectContaining({
            metadata: { nombre: 'Draft Mapeado' }
        }));
    });
    
    // 6. El modal debe cerrarse (desaparecer del DOM o no ser visible)
    await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
