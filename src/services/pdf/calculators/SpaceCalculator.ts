import type { TablaResponseDTO } from '@/types/production';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import { PDF_CONFIG } from '../config';

export class SpaceCalculator {
  constructor(private config: typeof PDF_CONFIG) {}

  /**
   * Determina si una tabla es "gigante"
   */
  isGiantTable(tabla: TablaResponseDTO): boolean {
    const numFilas = tabla.filas?.length || 0;
    const hasTextColumns = tabla.columnas?.some(col => col.tipoDato === TipoDatoCampo.TEXTO) ?? false;
    
    // Tabla gigante si: >5 filas, especialmente si tiene columnas de texto
    return numFilas > this.config.layout.giantTableThreshold && hasTextColumns;
  }

  /**
   * Estima la altura que ocupará una tabla en puntos
   */
  estimateTableHeight(tabla: TablaResponseDTO, fontSize: number): number {
    const numFilas = tabla.filas?.length || 0;
    const headerHeight = this.config.table.headerHeight;
    const rowHeight = this.config.table.rowHeight;
    
    // Ajustar altura de fila según fontSize
    const adjustedRowHeight = rowHeight * (fontSize / this.config.fontSize.normal);
    
    return headerHeight + (numFilas * adjustedRowHeight) + 20; // +20 para márgenes
  }

  /**
   * Calcula si hay suficiente espacio disponible en la página actual
   * Retorna true si hay más del 30% de espacio libre
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
