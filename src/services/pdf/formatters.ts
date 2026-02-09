import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import dayjs from 'dayjs';
import { PDF_CONFIG } from './config';

/**
 * Inserta oportunidades de wrapping en texto continuo sin espacios
 * Agrega zero-width space (U+200B) cada N caracteres para permitir line breaks
 */
function insertSoftBreaks(text: string, maxCharsBeforeBreak: number = PDF_CONFIG.layout.maxCharsBeforeBreak): string {
  if (!text || text.length <= maxCharsBeforeBreak) return text;
  
  // Si ya tiene espacios frecuentes, no es necesario
  const avgWordLength = text.split(/\s+/).reduce((acc, word) => acc + word.length, 0) / Math.max(1, text.split(/\s+/).length);
  if (avgWordLength < maxCharsBeforeBreak) return text;
  
  // Insertar zero-width space cada maxCharsBeforeBreak caracteres
  const ZERO_WIDTH_SPACE = '\u200B';
  let result = '';
  let charCount = 0;
  
  for (let i = 0; i < text.length; i++) {
    result += text[i];
    charCount++;
    
    // Insertar break point si:
    // 1. Hemos alcanzado el límite de caracteres
    // 2. No es el último carácter
    // 3. El siguiente carácter no es un espacio (para evitar duplicados)
    if (charCount >= maxCharsBeforeBreak && i < text.length - 1 && text[i + 1] !== ' ') {
      result += ZERO_WIDTH_SPACE;
      charCount = 0;
    }
    
    // Resetear contador en espacios naturales
    if (text[i] === ' ') {
      charCount = 0;
    }
  }
  
  return result;
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
    return insertSoftBreaks(valor);
  }
}
