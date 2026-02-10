import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import dayjs from 'dayjs';
import { PDF_CONFIG } from './config';

function wrapLongText(text: string, maxCharsPerLine: number = PDF_CONFIG.layout.maxCharsBeforeBreak): string {
  if (!text || text.length <= maxCharsPerLine) return text;
  
  const result: string[] = [];
  let remaining = text;
  
  while (remaining.length > 0) {
    if (remaining.length <= maxCharsPerLine) {
      result.push(remaining);
      break;
    }
    
    const chunk = remaining.substring(0, maxCharsPerLine);
    const lastSpaceIndex = chunk.lastIndexOf(' ');
    
    if (lastSpaceIndex > maxCharsPerLine * 0.5) {
      result.push(remaining.substring(0, lastSpaceIndex));
      remaining = remaining.substring(lastSpaceIndex + 1);
    } else {
      result.push(chunk);
      remaining = remaining.substring(maxCharsPerLine);
    }
  }
  
  return result.join('\n');
}

export class ValueFormatter {
  static format(valor: string, tipoDato: TipoDatoCampo, maxChars?: number): string {
    if (valor === '-' || !valor) return '-';

    const formatters: Record<TipoDatoCampo, (v: string) => string> = {
      [TipoDatoCampo.BOOLEANO]: this.formatBoolean,
      [TipoDatoCampo.DECIMAL]: this.formatDecimal,
      [TipoDatoCampo.ENTERO]: this.formatInteger,
      [TipoDatoCampo.FECHA]: this.formatDate,
      [TipoDatoCampo.HORA]: this.formatTime,
      [TipoDatoCampo.TEXTO]: (v) => this.formatText(v, maxChars),
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

  private static formatText(valor: string, maxChars?: number): string {
    return wrapLongText(valor, maxChars);
  }
}
