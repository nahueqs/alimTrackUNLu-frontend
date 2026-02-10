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
    
    // Más estricto: debe cumplir TODAS las condiciones
    if (analysis.numFilas <= this.config.layout.giantTableRowThreshold) return false;
    if (!analysis.hasLongText) return false;
    
    const estimatedHeight = this.estimateTableHeight(tabla, fontSize, analysis);
    if (estimatedHeight < this.config.layout.giantTableMinHeight) return false;
    if (analysis.emptyRatio > 0.5) return false;
    
    return true;
  }

  estimateTableHeight(tabla: TablaResponseDTO, fontSize: number, analysis?: TableAnalysis): number {
    const numFilas = tabla.filas?.length || 0;
    const headerHeight = this.config.table.headerHeight;
    const hasLongText = analysis?.hasLongText ?? false;
    const baseRowHeight = this.config.table.rowHeightBase;
    const wrappingRowHeight = this.config.table.rowHeightWithWrapping;
    const rowHeight = hasLongText ? wrappingRowHeight : baseRowHeight;
    const adjustedRowHeight = rowHeight * (fontSize / this.config.fontSize.normal);
    const padding = this.config.table.paddingPerRow * numFilas;
    
    return headerHeight + (numFilas * adjustedRowHeight) + padding + 15;
  }

  hasEnoughSpace(currentHeight: number, tableHeight: number, pageOrientation: 'portrait' | 'landscape'): boolean {
    const totalHeight = pageOrientation === 'landscape'
      ? this.config.table.pageHeight.landscape
      : this.config.table.pageHeight.portrait;
    
    const remainingSpace = totalHeight - currentHeight;
    const spaceAfterTable = remainingSpace - tableHeight;
    
    return (spaceAfterTable / totalHeight) >= this.config.layout.minPageSpacePercent;
  }

  shouldMoveToNewPage(currentHeight: number, tableHeight: number, pageOrientation: 'portrait' | 'landscape'): boolean {
    return !this.hasEnoughSpace(currentHeight, tableHeight, pageOrientation);
  }

  // NUEVO: Determinar si tabla necesita rotación
  shouldRotateTable(tabla: TablaResponseDTO): boolean {
    const numColumnas = (tabla.columnas?.length || 0) + 1;
    return numColumnas > this.config.layout.maxColumnasPortrait;
  }
}
