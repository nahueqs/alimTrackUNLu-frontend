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
    
    // CORREGIDO: Verificar si cabe físicamente con un pequeño margen de seguridad (20 puntos)
    // Antes exigía un % libre después de la tabla, lo cual era incorrecto.
    return remainingSpace >= (tableHeight + 20);
  }

  shouldMoveToNewPage(currentHeight: number, tableHeight: number, pageOrientation: 'portrait' | 'landscape'): boolean {
    return !this.hasEnoughSpace(currentHeight, tableHeight, pageOrientation);
  }

  // MEJORADO: Lógica inteligente para evitar rotación en tablas cortas
  shouldRotateTable(tabla: TablaResponseDTO): boolean {
    const numColumnas = (tabla.columnas?.length || 0) + 1;
    const numFilas = tabla.filas?.length || 0;
    
    // Límite base
    let limit = this.config.layout.maxColumnasPortrait;
    
    // Si es una tabla corta (pocas filas), somos más tolerantes
    // Permitimos hasta 2 columnas extra si son pocas filas
    if (numFilas <= this.config.layout.shortTableRows) {
      limit += 2;
    }
    
    return numColumnas > limit;
  }
}
