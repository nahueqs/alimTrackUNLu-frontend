import type { TablaResponseDTO } from '@/types/production';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import { PDF_CONFIG } from '../config';

export class TableWidthCalculator {
  constructor(private config: typeof PDF_CONFIG) {}

  calculate(tabla: TablaResponseDTO, numColumnas: number, fontSize: number, pageOrientation: 'portrait' | 'landscape'): any[] {
    const espacioDisponible = this.getAvailableSpace(pageOrientation);
    const conceptWidth = this.calculateConceptWidth(tabla, fontSize);
    
    return this.distributeWidths(tabla, conceptWidth, espacioDisponible, fontSize);
  }

  private getAvailableSpace(pageOrientation: 'portrait' | 'landscape'): number {
    return pageOrientation === 'landscape' 
      ? this.config.table.pageWidths.landscape 
      : this.config.table.pageWidths.portrait;
  }

  // MEJORADO: Lógica adaptativa para el ancho de concepto
  private calculateConceptWidth(tabla: TablaResponseDTO, fontSize: number): number {
    if (!tabla.filas || tabla.filas.length === 0) {
      return this.config.layout.conceptColumnMinWidth;
    }
    
    const maxLength = Math.max(...tabla.filas.map(f => f.nombre.length));
    const puntosPerChar = fontSize * 0.45;
    const estimatedWidth = Math.ceil(maxLength * puntosPerChar);
    
    // Si el texto es muy largo, permitimos extender el ancho hasta el límite extendido
    // para evitar que la fila se haga demasiado alta
    const maxLimit = maxLength > 40 
      ? this.config.layout.conceptColumnMaxExtended 
      : this.config.layout.conceptColumnMaxWidth;

    return Math.min(
      Math.max(estimatedWidth, this.config.layout.conceptColumnMinWidth),
      maxLimit
    );
  }

  private distributeWidths(tabla: TablaResponseDTO, conceptWidth: number, espacioDisponible: number, fontSize: number): any[] {
    const widths: any[] = [];
    const factorEscala = fontSize / 9;
    
    const ANCHO_ENTERO = Math.ceil(this.config.table.columnWidths.entero * factorEscala);
    const ANCHO_DECIMAL = Math.ceil(this.config.table.columnWidths.decimal * factorEscala);
    const ANCHO_FECHA = Math.ceil(this.config.table.columnWidths.fecha * factorEscala);
    const ANCHO_HORA = Math.ceil(this.config.table.columnWidths.hora * factorEscala);
    const ANCHO_BOOLEANO = Math.ceil(this.config.table.columnWidths.booleano * factorEscala);

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
            columnasTexto.push(index + 1);
            widths.push(null);
        }
    });
    
    const espacioRestante = espacioDisponible - espacioUsado;
    const numColumnasTexto = columnasTexto.length;
    
    if (numColumnasTexto > 0) {
        // Si queda poco espacio, forzamos un mínimo para que sea legible
        const anchoMinimo = fontSize === this.config.fontSize.small ? 45 : 55;
        
        // Si el espacio restante es negativo o muy poco, usamos el mínimo
        // (pdfmake ajustará automáticamente si nos pasamos un poco, o cortará)
        const anchoPorColumnaTexto = Math.max(
            anchoMinimo, 
            Math.floor(Math.max(0, espacioRestante) / numColumnasTexto)
        );
        
        columnasTexto.forEach(colIndex => {
            widths[colIndex] = anchoPorColumnaTexto;
        });
    }

    return widths;
  }
}
