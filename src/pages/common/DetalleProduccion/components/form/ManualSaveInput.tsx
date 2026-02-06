import React, { useEffect, useReducer, useRef, useState } from 'react';
import type { InputProps } from 'antd';
import { Button, Checkbox, DatePicker, Input, InputNumber, TimePicker, Tooltip } from 'antd';
import { ExclamationCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import { useIsMobile } from '@/hooks/useIsMobile';
import { initialState, inputReducer } from './inputReducer';
import { useDateTimeParsers } from './useDateTimeParsers';
import { useValidation } from './useValidation';
import type { Dayjs } from 'dayjs';

interface ManualSaveInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => Promise<void> | void;
  tipoDato?: TipoDatoCampo;
}

export const ManualSaveInput: React.FC<ManualSaveInputProps> = ({
  value: globalValue,
  onChange: onGlobalChange,
  tipoDato = TipoDatoCampo.TEXTO,
  placeholder,
  ...rest
}) => {
  const [state, dispatch] = useReducer(inputReducer, initialState(globalValue));
  const inputRef = useRef<any>(null);
  const isMobile = useIsMobile();
  
  const { parseDate, parseTime, formatForBackend } = useDateTimeParsers(tipoDato);
  const { validate } = useValidation(tipoDato);

  // Estado local SOLO para TimePicker (soluciona el bug de Ant Design de reversión de valor)
  const [timePickerValue, setTimePickerValue] = useState<Dayjs | null>(
    tipoDato === TipoDatoCampo.HORA ? parseTime(globalValue) : null
  );

  // Sincronizar TimePicker cuando cambia el valor local (ej: carga inicial o update externo)
  useEffect(() => {
    if (tipoDato === TipoDatoCampo.HORA) {
      const parsed = parseTime(state.localValue);
      setTimePickerValue(parsed);
    }
  }, [tipoDato, state.localValue, parseTime]);

  // Sincronización con valor externo
  useEffect(() => {
    if (globalValue !== state.localValue && !state.hasChanged) {
      dispatch({ type: 'SYNC_EXTERNAL', payload: globalValue });
    }
  }, [globalValue, state.localValue, state.hasChanged]);

  const handleSave = async () => {
    const validationError = validate(state.localValue);
    if (validationError) {
      dispatch({ type: 'SET_ERROR', payload: validationError });
      inputRef.current?.focus();
      return;
    }

    dispatch({ type: 'SAVE_START' });
    try {
      const valueToSend = formatForBackend(state.localValue);
      await onGlobalChange(valueToSend);
      dispatch({ type: 'SAVE_SUCCESS' });
    } catch (e: any) {
      console.error('Error al guardar input:', e);
      dispatch({ type: 'SAVE_ERROR', payload: e.message || 'Error al guardar' });
      // Mejora UX: Enfocar y seleccionar texto al fallar
      if (inputRef.current) {
        inputRef.current.focus();
        if (inputRef.current.select) {
          inputRef.current.select();
        }
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    dispatch({ type: 'FOCUS' });
    // Mejora UX: Seleccionar todo el texto al enfocar
    if (e.target && e.target.select) {
      e.target.select();
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      dispatch({ type: 'BLUR' });
    }, 200);
  };

  const commonProps = {
    onFocus: handleFocus,
    onBlur: handleBlur,
    status: state.error ? ('error' as const) : undefined,
    disabled: state.isSaving || rest.disabled,
    style: { width: '100%', color: 'var(--text-primary)' },
    ref: inputRef,
    'aria-invalid': !!state.error,
    'aria-describedby': state.error ? 'input-error-message' : undefined,
  };

  const getPlaceholder = () => {
    const basePlaceholder = placeholder || 'Ingrese valor';
    if (
      tipoDato === TipoDatoCampo.FECHA ||
      tipoDato === TipoDatoCampo.HORA ||
      tipoDato === TipoDatoCampo.BOOLEANO
    ) {
      return basePlaceholder;
    }
    
    let typeLabel = '';
    switch (tipoDato) {
      case TipoDatoCampo.ENTERO: typeLabel = 'Entero'; break;
      case TipoDatoCampo.DECIMAL: typeLabel = 'Decimal'; break;
      case TipoDatoCampo.TEXTO: typeLabel = 'Texto'; break;
    }
    
    return typeLabel ? `${basePlaceholder} (${typeLabel})` : basePlaceholder;
  };

  const renderInput = () => {
    const finalPlaceholder = getPlaceholder();

    switch (tipoDato) {
      case TipoDatoCampo.ENTERO:
        return (
          <InputNumber
            value={state.localValue}
            onChange={(val) => {
              const newValue = val === null ? '' : val.toString();
              dispatch({ type: 'VALUE_CHANGED', payload: newValue });
            }}
            stringMode
            precision={0}
            placeholder={finalPlaceholder}
            {...commonProps}
            {...(rest as any)}
          />
        );
      case TipoDatoCampo.DECIMAL:
        return (
          <InputNumber
            value={state.localValue}
            onChange={(val) => {
              const newValue = val === null ? '' : val.toString();
              dispatch({ type: 'VALUE_CHANGED', payload: newValue });
            }}
            stringMode
            step={0.01}
            placeholder={finalPlaceholder}
            {...commonProps}
            {...(rest as any)}
          />
        );
      case TipoDatoCampo.FECHA:
        return (
          <DatePicker
            value={parseDate(state.localValue)}
            onChange={(_date, dateString) => {
              const newValue = typeof dateString === 'string' ? dateString : '';
              dispatch({ type: 'VALUE_CHANGED', payload: newValue });
            }}
            format="DD/MM/YYYY"
            placeholder={placeholder || 'DD/MM/AAAA'}
            {...commonProps}
            {...(rest as any)}
          />
        );
      case TipoDatoCampo.HORA:
        return (
          <TimePicker
            value={timePickerValue} // Usamos el estado local síncrono
            onChange={(time) => {
              // 1. Actualizar estado local INMEDIATAMENTE para evitar reversión visual
              setTimePickerValue(time);
              
              // 2. Actualizar estado global (reducer)
              const newValue = time ? time.format('HH:mm:ss') : '';
              dispatch({ type: 'VALUE_CHANGED', payload: newValue });
            }}
            format="HH:mm:ss"
            placeholder={placeholder || 'HH:mm:ss'}
            showNow={false}
            use12Hours={false}
            allowClear
            needConfirm={false} // UX más fluida
            {...commonProps}
            {...(rest as any)}
          />
        );
      case TipoDatoCampo.BOOLEANO:
        return (
          <Checkbox
            checked={state.localValue === 'true'}
            onChange={(e) => {
              const newValue = e.target.checked ? 'true' : 'false';
              dispatch({ type: 'VALUE_CHANGED', payload: newValue });
            }}
            disabled={state.isSaving || rest.disabled}
          >
            {placeholder || 'Sí/No'}
          </Checkbox>
        );
      case TipoDatoCampo.TEXTO:
      default:
        return (
          <Input
            value={state.localValue}
            onChange={(e) => {
              dispatch({ type: 'VALUE_CHANGED', payload: e.target.value });
            }}
            placeholder={finalPlaceholder}
            {...commonProps}
            {...rest}
          />
        );
    }
  };

  // Si está deshabilitado (modo lectura), renderizamos solo el input sin el botón de guardar
  if (rest.disabled) {
    return (
      <div style={{ width: '100%' }}>
        {renderInput()}
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
        <div style={{ flex: 1 }}>
          {state.error ? (
            <Tooltip title={state.error} color="red" placement="topLeft" open={state.isFocused || !!state.error}>
              {renderInput()}
            </Tooltip>
          ) : (
            renderInput()
          )}
        </div>
        {(state.isFocused || state.hasChanged || state.isSaving) && (
          <Button
            type={state.error ? 'primary' : 'primary'}
            danger={!!state.error}
            icon={state.error ? <ExclamationCircleOutlined /> : <SaveOutlined />}
            onClick={handleSave}
            loading={state.isSaving}
            disabled={!state.hasChanged && !state.error}
            size={isMobile ? 'small' : 'middle'}
            style={{ flexShrink: 0 }}
            onMouseDown={(e) => e.preventDefault()}
            aria-label={state.error ? 'Reintentar guardar' : 'Guardar cambios'}
          >
            {!isMobile && (state.error ? 'Reintentar' : 'Guardar')}
          </Button>
        )}
      </div>
      {state.error && (
        <div 
          id="input-error-message" 
          style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}
          role="alert"
        >
          {state.error}
        </div>
      )}
    </div>
  );
};
