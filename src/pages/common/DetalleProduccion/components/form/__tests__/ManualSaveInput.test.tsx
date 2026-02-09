import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManualSaveInput } from '../ManualSaveInput';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import { vi } from 'vitest';

describe('ManualSaveInput', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renderiza un input de texto por defecto', () => {
    render(
      <ManualSaveInput 
        value="Test Value" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.TEXTO} 
      />
    );
    
    expect(screen.getByDisplayValue('Test Value')).toBeInTheDocument();
  });

  it('muestra el botón de guardar solo cuando hay cambios', async () => {
    const user = userEvent.setup();
    render(
      <ManualSaveInput 
        value="Inicial" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.TEXTO} 
      />
    );

    // Al inicio no debe estar el botón
    expect(screen.queryByRole('button', { name: /guardar/i })).not.toBeInTheDocument();

    // Escribimos algo
    const input = screen.getByDisplayValue('Inicial');
    await user.type(input, ' Modificado');

    // Ahora debe aparecer
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('llama a onChange con el valor correcto al guardar', async () => {
    const user = userEvent.setup();
    render(
      <ManualSaveInput 
        value="" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.TEXTO} 
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'Nuevo Valor');
    
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    expect(mockOnChange).toHaveBeenCalledWith('Nuevo Valor');
  });

  it('valida entrada numérica para tipo ENTERO', async () => {
    const user = userEvent.setup();
    render(
      <ManualSaveInput 
        value="" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.ENTERO} 
      />
    );

    // Ant Design InputNumber es complejo, buscamos por role spinbutton o textbox
    const input = screen.getByRole('spinbutton');
    
    // Intentamos escribir texto no numérico (InputNumber suele filtrarlo, pero probamos la validación del componente si permite entrada libre)
    // Nota: InputNumber de AntD filtra letras automáticamente, así que probamos con un número válido
    await user.type(input, '123');
    
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    expect(mockOnChange).toHaveBeenCalledWith('123');
  });

  it('sincroniza el valor si cambia externamente (props)', () => {
    const { rerender } = render(
      <ManualSaveInput 
        value="Valor 1" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.TEXTO} 
      />
    );

    expect(screen.getByDisplayValue('Valor 1')).toBeInTheDocument();

    // Simulamos cambio externo (ej: websocket update)
    rerender(
      <ManualSaveInput 
        value="Valor Externo" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.TEXTO} 
      />
    );

    expect(screen.getByDisplayValue('Valor Externo')).toBeInTheDocument();
  });

  it('muestra error y no guarda si la validación falla', async () => {
    // Mockeamos useValidation para forzar un error, o usamos un caso real
    // En este caso, ENTERO no debería permitir decimales si se escriben manualmente
    const user = userEvent.setup();
    render(
      <ManualSaveInput 
        value="" 
        onChange={mockOnChange} 
        tipoDato={TipoDatoCampo.ENTERO} 
      />
    );

    const input = screen.getByRole('spinbutton');
    await user.type(input, '10.5'); // InputNumber stringMode permite escribir esto
    
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    await user.click(saveButton);

    // No debería llamar a onChange
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // Debería mostrar estado de error (el botón cambia a rojo/alerta)
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });
});
