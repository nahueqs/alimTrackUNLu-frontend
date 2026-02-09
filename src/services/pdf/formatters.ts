import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import dayjs from 'dayjs';
import { PDF_CONFIG } from './config';

/**
 * Envuelve texto largo insertando saltos de línea cada N caracteres.
 * Prioriza cortar en espacios cuando existen, evitando partir palabras.
 * 
 * @param text - Texto a envolver
 * @param maxCharsPerLine - Máximo de caracteres por línea antes de insertar salto
 * @returns Texto con saltos de línea insertados
 */
function wrapLongText(text: string, maxCharsPerLine: number = PDF_CONFIG.layout.maxCharsBeforeBreak): string {
  if (!text || text.length <= maxCharsPerLine) return text;
  
  const result: string[] = [];
  let remaining = text;
  
  while (remaining.length > 0) {
    // Si lo que queda es menor al límite, agregarlo y terminar
    if (remaining.length <= maxCharsPerLine) {
      result.push(remaining);
      break;
    }
    
    // Tomar un chunk del tamaño máximo
    const chunk = remaining.substring(0, maxCharsPerLine);
    const lastSpaceIndex = chunk.lastIndexOf(' ');
    
    // Si hay un espacio en la segunda mitad del chunk, cortar ahí para no partir palabras
    if (lastSpaceIndex > maxCharsPerLine * 0.5) {
      result.push(remaining.substring(0, lastSpaceIndex));
      remaining = remaining.substring(lastSpaceIndex + 1);
    } else {
      // Si no hay espacios cercanos, cortar forzosamente en el límite
      result.push(chunk);
      remaining = remaining.substring(maxCharsPerLine);
    }
  }
  
  // Unir con saltos de línea reales que pdfmake respeta
  return result.join('\n');
}

export class ValueFormatter {
  static format(valor: string, tipoDato: TipoDatoCampo): string {
    if (valor === '-' || !valor) return '-';

    const formatters: Record<TipoDatoCampo, (v: string) => string> = {
      [TipoDatoCampo.BOOLEANO]: this.formatBoolean,
      [TipoDatoCampo.DECIMAL]: this.formatDecimal,
      [TipoDatoCampo.ENTERO]: this.formatInteger,
      [TipoDatoCampo.FECHA]: this.formatDate,
      [TipoDatoCampo.HORA]: this.formatTime,
      [TipoDatoCampo.TEXTO]: this.formatText,
    };

    return formatters[tipoDato]?.(valor) ?? valor;
  }

  private static formatBoolean(valor: string): string {
    return valor === 'true' ? 'Sí' : valor === 'false' ? 'No' : '-';
  }

  private static formatDecimal(valor: string): string {
    const num = parseFloat(valor);
    return isNaN(num) ? valor : num.toFixed(2);
  }

  private static formatInteger(valor: string): string {
    const num = parseFloat(valor);
    return isNaN(num) ? valor : Math.floor(num).toString();
  }

  private static formatDate(valor: string): string {
    return dayjs(valor).format('DD/MM/YYYY');
  }

  private static formatTime(valor: string): string {
    if (valor.includes('T') || valor.includes('-')) {
      return dayjs(valor).format('HH:mm:ss');
    }
    return valor;
  }

  private static formatText(valor: string): string {
    // Usar wrapLongText en lugar de insertSoftBreaks
    return wrapLongText(valor);
  }
}
