import { useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';

dayjs.extend(customParseFormat);

export const useDateTimeParsers = (tipoDato: TipoDatoCampo) => {
  const parseDate = useCallback((val: string): Dayjs | null => {
    if (!val) return null;
    // Intentar parsear formato DD/MM/YYYY (formato visual)
    let d = dayjs(val, 'DD/MM/YYYY', true);
    if (d.isValid()) return d;
    
    // Intentar parsear formato ISO YYYY-MM-DD (formato backend)
    d = dayjs(val); 
    if (d.isValid()) return d;
    
    return null;
  }, []);

  const parseTime = useCallback((val: string): Dayjs | null => {
    if (!val) return null;
    
    // Si viene del backend con fecha completa (ISO 8601)
    // Ej: "2024-01-28T14:30:00" o "2026-02-10T05:10"
    if (val.includes('T')) {
      const timePart = val.split('T')[1]?.split('.')[0]; // "14:30:00" o "05:10"
      if (timePart) {
        // Intento 1: HH:mm:ss
        let d = dayjs(timePart, 'HH:mm:ss', true);
        
        // Intento 2: HH:mm (si no tiene segundos)
        if (!d.isValid()) {
            d = dayjs(timePart, 'HH:mm', true);
        }

        if (d.isValid()) {
          // CLAVE: Asignar la hora a HOY para que TimePicker la muestre correctamente
          return dayjs()
            .hour(d.hour())
            .minute(d.minute())
            .second(d.second() || 0);
        }
      }
    }
    
    // Intentar parsear HH:mm:ss (formato completo solo hora)
    let d = dayjs(val, 'HH:mm:ss', true);
    if (d.isValid()) {
        return dayjs()
            .hour(d.hour())
            .minute(d.minute())
            .second(d.second());
    }
    
    // Intentar parsear HH:mm (sin segundos solo hora)
    d = dayjs(val, 'HH:mm', true);
    if (d.isValid()) {
        return dayjs()
            .hour(d.hour())
            .minute(d.minute())
            .second(0);
    }
    
    return null;
  }, []);

  const formatForBackend = useCallback((val: string): string => {
    if (!val) return '';

    if (tipoDato === TipoDatoCampo.FECHA) {
      const d = parseDate(val);
      if (d && d.isValid()) {
        // FECHA: enviar con hora 00:00:00
        return d.format('YYYY-MM-DDTHH:mm:ss');
      }
    }

    if (tipoDato === TipoDatoCampo.HORA) {
      // HORA: usar fecha ACTUAL + hora seleccionada
      let timeValue: Dayjs | null = null;
      
      // Extraer la hora del valor local (que debería ser HH:mm:ss o HH:mm)
      // Primero intentamos con segundos
      timeValue = dayjs(val, 'HH:mm:ss', true);
      
      // Si falla, intentamos sin segundos
      if (!timeValue.isValid()) {
          timeValue = dayjs(val, 'HH:mm', true);
      }
      
      if (!timeValue || !timeValue.isValid()) return val;
      
      // CLAVE: Combinar fecha de HOY + hora seleccionada
      // Esto satisface al backend que espera LocalDateTime
      const today = dayjs().startOf('day');
      const combined = today
        .hour(timeValue.hour())
        .minute(timeValue.minute())
        .second(timeValue.second());
      
      return combined.format('YYYY-MM-DDTHH:mm:ss');
    }

    // Para otros tipos, se devuelve tal cual
    return val;
  }, [tipoDato, parseDate]);

  return { parseDate, parseTime, formatForBackend };
};
