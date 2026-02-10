import type { TablaResponseDTO } from '@/types/production';
import { PDF_CONFIG } from '../config';
import { ContentAnalyzer, type TableAnalysis } from './ContentAnalyzer';

export class SpaceCalculator {
  constructor(
    private config: typeof PDF_CONFIG,
    private contentAnalyzer: ContentAnalyzer
  ) {}

  isGiantTable(tabla: TablaResponseDTO, respuestasTablas: any[], fontSize: number): boolean {
    const analysis = this.contentAnalyzer.analyzeTable(tabla, respuestasTablas);
    
    if (analysis.numFilas <= this.config.layout.giantTableRowThreshold) return false;
    if (!analysis.hasLongText) return false;
    
    const estimatedHeight = this.estimateTableHeight(tabla, fontSize, analysis);
    if (estimatedHeight < this.config.layout.giantTableMinHeight) return false;
    if (analysis.emptyRatio > 0.5) return false;
    
    return true;
  }

  /**
   * Estima la altura con mayor precisión considerando el wrapping de texto
   */
  estimateTableHeight(tabla: TablaResponseDTO, fontSize: number, analysis?: TableAnalysis): number {
    const numFilas = tabla.filas?.length || 0;
    const headerHeight = this.config.table.headerHeight;
    const padding = this.config.table.paddingPerRow * numFilas;
    
    // Altura base por fila
    const baseRowHeight = this.config.table.rowHeightBase * (fontSize / this.config.fontSize.normal);
    
    // Si no hay análisis detallado, usar estimación simple
    if (!analysis) {
        return headerHeight + (numFilas * baseRowHeight) + padding + 15;
    }

    // CÁLCULO AVANZADO DE LÍNEAS
    // 1. Estimar ancho promedio de columna de texto
    // Asumimos que en portrait tenemos ~500pts disponibles. Restamos concepto (~60pts).
    // Quedan 440pts. Si hay 5 columnas, ~88pts por columna.
    const availableWidth = 440; 
    const numCols = (tabla.columnas?.length || 1);
    const avgColWidth = availableWidth / numCols;
    
    // 2. Caracteres que caben en una línea (aprox)
    // Un caracter promedio mide fontSize * 0.6 puntos
    const charsPerLine = avgColWidth / (fontSize * 0.6);
    
    // 3. Calcular líneas necesarias para el texto más largo
    // maxTextLength viene del ContentAnalyzer
    const maxLines = Math.ceil(analysis.maxTextLength / charsPerLine);
    
    // 4. Determinar altura de fila basada en líneas (mínimo 1 línea)
    // Si maxLines es 1, usa baseRowHeight. Si es mayor, añade altura por línea extra.
    const linesFactor = Math.max(1, maxLines);
    const rowHeight = baseRowHeight + ((linesFactor - 1) * (fontSize + 2)); // +2 de interlineado

    return headerHeight + (numFilas * rowHeight) + padding + 20;
  }

  hasEnoughSpace(currentHeight: number, tableHeight: number, pageOrientation: 'portrait' | 'landscape'): boolean {
    const totalHeight = pageOrientation === 'landscape'
      ? this.config.table.pageHeight.landscape
      : this.config.table.pageHeight.portrait;
    
    const remainingSpace = totalHeight - currentHeight;
    
    return remainingSpace >= (tableHeight + 20);
  }

  shouldMoveToNewPage(currentHeight: number, tableHeight: number, pageOrientation: 'portrait' | 'landscape'): boolean {
    return !this.hasEnoughSpace(currentHeight, tableHeight, pageOrientation);
  }

  shouldRotateTable(tabla: TablaResponseDTO): boolean {
    const numColumnas = (tabla.columnas?.length || 0) + 1;
    const numFilas = tabla.filas?.length || 0;
    
    let limit = this.config.layout.maxColumnasPortrait;
    
    if (numFilas <= this.config.layout.shortTableRows) {
      limit += 2;
    }
    
    return numColumnas > limit;
  }
}
