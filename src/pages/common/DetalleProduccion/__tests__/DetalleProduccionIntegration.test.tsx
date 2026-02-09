import { render, screen, waitFor } from '@/test/test-utils';
import { DetalleProduccionPage } from '../DetalleProduccionPage';
import { mockEstructura, mockRespuestas } from '../types/mockData';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock necesario para componentes de Ant Design que usan scroll
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});

describe('DetalleProduccionPage Integración', () => {
  const mockOnCampoChange = vi.fn();
  const mockOnTablaChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza correctamente la estructura y respuestas iniciales', async () => {
    render(
      <DetalleProduccionPage
        estructura={mockEstructura}
        respuestas={mockRespuestas}
        isEditable={true}
        onCampoChange={mockOnCampoChange}
        onTablaChange={mockOnTablaChange}
      />
    );

    // Verificar título de sección
    expect(screen.getByText('Recepción de Materia Prima')).toBeInTheDocument();
    
    // Verificar valor de un campo cargado (Proveedor)
    expect(screen.getByDisplayValue('Granja La Pradera')).toBeInTheDocument();
    
    // Verificar que la tabla se renderizó buscando una fila conocida
    // "Inicio Calentamiento" es una fila en el mockData
    await waitFor(() => {
        expect(screen.getByText('Inicio Calentamiento')).toBeInTheDocument();
    });
  });

  it('permite editar un campo y dispara onCampoChange', async () => {
    const user = userEvent.setup();
    render(
      <DetalleProduccionPage
        estructura={mockEstructura}
        respuestas={mockRespuestas}
        isEditable={true}
        onCampoChange={mockOnCampoChange}
      />
    );

    const input = screen.getByDisplayValue('Granja La Pradera');
    
    await user.clear(input);
    await user.type(input, 'Nuevo Proveedor');
    
    // Esperar a que aparezca el botón y hacer click
    const saveButton = await screen.findByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    expect(mockOnCampoChange).toHaveBeenCalledWith(
      101, 
      'Nuevo Proveedor', 
      TipoDatoCampo.TEXTO
    );
  });

  it('renderiza en modo solo lectura correctamente', () => {
    render(
      <DetalleProduccionPage
        estructura={mockEstructura}
        respuestas={mockRespuestas}
        isEditable={false}
      />
    );

    const input = screen.getByDisplayValue('Granja La Pradera');
    expect(input).toBeDisabled();
    
    expect(screen.queryByRole('button', { name: /guardar/i })).not.toBeInTheDocument();
  });
});
