import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { ManualSaveInput } from '../ManualSaveInput';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import { vi } from 'vitest';
import dayjs from 'dayjs';

// Mock para evitar problemas con el scroll en los Pickers de AntD
window.scrollTo = vi.fn() as any;

describe('ManualSaveInput - Tipos de Datos', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- 1. TEXTO ---
  it('Tipo TEXTO: Escribe, guarda y mantiene el valor', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ManualSaveInput 
        value="Hola" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.TEXTO} 
      />
    );

    const input = screen.getByDisplayValue('Hola');
    
    // 1. Modificar
    await user.clear(input);
    await user.type(input, 'Mundo');
    
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    
    // 2. Guardar
    await user.click(saveButton);

    // 3. Verificar envío
    expect(mockOnChange).toHaveBeenCalledWith('Mundo');

    // 4. Simular actualización del padre
    rerender(
      <ManualSaveInput 
        value="Mundo" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.TEXTO} 
      />
    );

    // 5. Verificar persistencia visual
    expect(input).toHaveValue('Mundo');
    
    // IMPORTANTE: Quitar el foco para que el botón desaparezca
    // El botón se muestra si isFocused es true, aunque ya se haya guardado
    fireEvent.blur(input);
    
    // Esperar a que el blur se procese (ManualSaveInput tiene un timeout en el blur)
    await waitFor(() => {
        expect(screen.queryByRole('button', { name: /guardar/i })).not.toBeInTheDocument();
    });
  });

  // --- 2. ENTERO ---
  it('Tipo ENTERO: Maneja números, ignora letras y guarda', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ManualSaveInput 
        value="10" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.ENTERO} 
      />
    );

    const input = screen.getByRole('spinbutton');
    
    await user.clear(input);
    await user.type(input, '99');

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    expect(mockOnChange).toHaveBeenCalledWith('99');

    // Simular actualización del padre
    rerender(
      <ManualSaveInput 
        value="99" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.ENTERO} 
      />
    );

    expect(input).toHaveValue('99');
  });

  // --- 3. DECIMAL ---
  it('Tipo DECIMAL: Permite puntos decimales y guarda', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ManualSaveInput 
        value="10.5" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.DECIMAL} 
      />
    );

    const input = screen.getByRole('spinbutton');
    
    await user.clear(input);
    await user.type(input, '20.75');

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    expect(mockOnChange).toHaveBeenCalledWith('20.75');

    // Simular actualización del padre
    rerender(
      <ManualSaveInput 
        value="20.75" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.DECIMAL} 
      />
    );

    expect(input).toHaveValue('20.75');
  });

  // --- 4. BOOLEANO ---
  it('Tipo BOOLEANO: Renderiza Checkbox y envía "true"/"false"', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ManualSaveInput 
        value="false" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.BOOLEANO} 
      />
    );

    const checkbox = screen.getByRole('checkbox');
    
    await user.click(checkbox);
    
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    expect(mockOnChange).toHaveBeenCalledWith('true');

    // Simular actualización del padre
    rerender(
      <ManualSaveInput 
        value="true" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.BOOLEANO} 
      />
    );

    expect(checkbox).toBeChecked();
  });

  // --- 5. FECHA ---
  it('Tipo FECHA: Renderiza DatePicker y envía formato ISO', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ManualSaveInput 
        value="2024-01-01T00:00:00" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.FECHA} 
      />
    );

    const input = screen.getByRole('textbox');
    
    fireEvent.mouseDown(input);
    fireEvent.change(input, { target: { value: '31/12/2024' } });
    fireEvent.blur(input);

    await waitFor(() => {
        expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    expect(mockOnChange).toHaveBeenCalledWith(expect.stringContaining('2024-12-31'));
    
    // Simular actualización del padre (el backend devuelve ISO)
    rerender(
      <ManualSaveInput 
        value="2024-12-31T00:00:00" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.FECHA} 
      />
    );

    expect(input).toHaveValue('31/12/2024');
  });

  // --- 6. HORA ---
  it('Tipo HORA: Renderiza TimePicker y combina con fecha actual', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ManualSaveInput 
        value="14:30:00" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.HORA} 
      />
    );

    const input = screen.getByRole('textbox');
    
    fireEvent.mouseDown(input);
    fireEvent.change(input, { target: { value: '18:45:00' } });
    fireEvent.blur(input);

    await waitFor(() => {
        expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    const today = dayjs().format('YYYY-MM-DD');
    expect(mockOnChange).toHaveBeenCalledWith(expect.stringContaining(`${today}T18:45:00`));
    
    // Simular actualización del padre
    rerender(
      <ManualSaveInput 
        value={`${today}T18:45:00`} 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.HORA} 
      />
    );

    expect(input).toHaveValue('18:45:00');
  });
});
