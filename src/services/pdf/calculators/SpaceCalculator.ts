import type { TablaResponseDTO } from '@/types/production';
import { PDF_CONFIG } from '../config';
import { ContentAnalyzer, TableAnalysis } from './ContentAnalyzer';

export class SpaceCalculator {
  constructor(
    private config: typeof PDF_CONFIG,
    private contentAnalyzer: ContentAnalyzer
  ) {}

  /**
   * Determina si una tabla es "gigante" basándose en contenido REAL
   */
  isGiantTable(tabla: TablaResponseDTO, respuestasTablas: any[], fontSize: number): boolean {
    const analysis = this.contentAnalyzer.analyzeTable(tabla, respuestasTablas);
    
    // REGLA 1: Debe tener más de N filas
    if (analysis.numFilas <= this.config.layout.giantTableRowThreshold) {
      return false;
    }
    
    // REGLA 2: Debe tener texto largo
    if (!analysis.hasLongText) {
      return false;
    }
    
    // REGLA 3: La altura estimada debe ser significativa
    const estimatedHeight = this.estimateTableHeight(tabla, fontSize, analysis);
    if (estimatedHeight < this.config.layout.giantTableMinHeight) {
      return false;
    }
    
    // REGLA 4: No debe estar mayormente vacía
    if (analysis.emptyRatio > 0.5) {
      return false;
    }
    
    return true;
  }

  /**
   * Estima la altura que ocupará una tabla (MEJORADO con análisis de contenido)
   */
  estimateTableHeight(tabla: TablaResponseDTO, fontSize: number, analysis?: TableAnalysis): number {
    const numFilas = tabla.filas?.length || 0;
    const headerHeight = this.config.table.headerHeight;
    
    // Si no tenemos análisis, hacerlo ahora (pero sin respuestas, será menos preciso)
    const hasLongText = analysis?.hasLongText ?? false;
    
    // Ajustar altura de fila según fontSize y contenido
    const baseRowHeight = this.config.table.rowHeightBase;
    const wrappingRowHeight = this.config.table.rowHeightWithWrapping;
    
    const rowHeight = hasLongText ? wrappingRowHeight : baseRowHeight;
    const adjustedRowHeight = rowHeight * (fontSize / this.config.fontSize.normal);
    
    const padding = this.config.table.paddingPerRow * numFilas;
    
    return headerHeight + (numFilas * adjustedRowHeight) + padding + 20;
  }

  /**
   * Calcula si hay suficiente espacio disponible en la página actual
   */
  hasEnoughSpace(currentHeight: number, tableHeight: number, pageOrientation: 'portrait' | 'landscape'): boolean {
    const totalHeight = pageOrientation === 'landscape'
      ? this.config.table.pageHeight.landscape
      : this.config.table.pageHeight.portrait;
    
    const remainingSpace = totalHeight - currentHeight;
    const spaceAfterTable = remainingSpace - tableHeight;
    
    // Debe quedar al menos 30% de espacio libre
    return (spaceAfterTable / totalHeight) >= this.config.layout.minPageSpacePercent;
  }

  /**
   * Determina si una tabla debe ir a nueva página
   */
  shouldMoveToNewPage(currentHeight: number, tableHeight: number, pageOrientation: 'portrait' | 'landscape'): boolean {
    return !this.hasEnoughSpace(currentHeight, tableHeight, pageOrientation);
  }
}
