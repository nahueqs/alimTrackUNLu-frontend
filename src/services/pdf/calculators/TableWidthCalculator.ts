import type { TablaResponseDTO } from '@/types/production';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import { PDF_CONFIG } from '../config';

export class TableWidthCalculator {
  constructor(private config: typeof PDF_CONFIG) {}

  calculate(tabla: TablaResponseDTO, numColumnas: number, fontSize: number): any[] {
    const espacioDisponible = this.getAvailableSpace(numColumnas);
    const conceptWidth = this.calculateConceptWidth(tabla, fontSize);
    
    return this.distributeWidths(tabla, conceptWidth, espacioDisponible, fontSize);
  }

  private getAvailableSpace(numColumnas: number): number {
    return numColumnas > this.config.layout.columnsThreshold 
      ? this.config.table.pageWidths.landscape 
      : this.config.table.pageWidths.portrait;
  }

  private calculateConceptWidth(tabla: TablaResponseDTO, fontSize: number): number {
    if (!tabla.filas || tabla.filas.length === 0) return 80;
    
    const maxLength = Math.max(...tabla.filas.map(f => f.nombre.length));
    const puntosPerChar = fontSize * 0.6;
    const estimatedWidth = Math.ceil(maxLength * puntosPerChar);
    
    return Math.min(Math.max(estimatedWidth, 60), 150);
  }

  private distributeWidths(tabla: TablaResponseDTO, conceptWidth: number, espacioDisponible: number, fontSize: number): any[] {
    const widths: any[] = [];
    
    // Factor de escala basado en fontSize (base 9)
    const factorEscala = fontSize / 9;
    
    // Anchos fijos escalados
    const ANCHO_ENTERO = Math.ceil(this.config.table.columnWidths.entero * factorEscala);
    const ANCHO_DECIMAL = Math.ceil(this.config.table.columnWidths.decimal * factorEscala);
    const ANCHO_FECHA = Math.ceil(this.config.table.columnWidths.fecha * factorEscala);
    const ANCHO_HORA = Math.ceil(this.config.table.columnWidths.hora * factorEscala);
    const ANCHO_BOOLEANO = Math.ceil(this.config.table.columnWidths.booleano * factorEscala);

    // Primera columna (Concepto)
    widths.push(conceptWidth);
    let espacioUsado = conceptWidth;
    
    const columnasTexto: number[] = [];
    
    tabla.columnas?.forEach((col, index) => {
        const tipo = col.tipoDato;

        if (tipo === TipoDatoCampo.ENTERO) {
            widths.push(ANCHO_ENTERO);
            espacioUsado += ANCHO_ENTERO;
        } else if (tipo === TipoDatoCampo.DECIMAL) {
            widths.push(ANCHO_DECIMAL);
            espacioUsado += ANCHO_DECIMAL;
        } else if (tipo === TipoDatoCampo.FECHA) {
            widths.push(ANCHO_FECHA);
            espacioUsado += ANCHO_FECHA;
        } else if (tipo === TipoDatoCampo.HORA) {
            widths.push(ANCHO_HORA);
            espacioUsado += ANCHO_HORA;
        } else if (tipo === TipoDatoCampo.BOOLEANO) {
            widths.push(ANCHO_BOOLEANO);
            espacioUsado += ANCHO_BOOLEANO;
        } else {
            // TipoDatoCampo.TEXTO - calcular después
            columnasTexto.push(index + 1); // +1 porque la primera es "Concepto"
            widths.push(null); // Placeholder
        }
    });
    
    // Distribuir espacio restante entre columnas de texto
    const espacioRestante = espacioDisponible - espacioUsado;
    const numColumnasTexto = columnasTexto.length;
    
    if (numColumnasTexto > 0) {
        // Ajustar ancho mínimo según fontSize
        const anchoMinimo = fontSize === 7 ? 60 : (fontSize === 8 ? 70 : 80);
        const anchoPorColumnaTexto = Math.max(anchoMinimo, Math.floor(espacioRestante / numColumnasTexto));
        columnasTexto.forEach(colIndex => {
            widths[colIndex] = anchoPorColumnaTexto;
        });
    }

    return widths;
  }
}
