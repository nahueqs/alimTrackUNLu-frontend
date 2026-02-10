import type { TablaResponseDTO } from '@/types/production';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import { PDF_CONFIG } from '../config';

export class ContentAnalyzer {
  constructor(private config: typeof PDF_CONFIG) {}

  analyzeTable(tabla: TablaResponseDTO, respuestasTablas: any[]): TableAnalysis {
    const numFilas = tabla.filas?.length || 0;
    const numColumnas = tabla.columnas?.length || 0;
    const tablaCells = respuestasTablas.filter(r => r.idTabla === tabla.id);
    const textStats = this.analyzeTextContent(tabla, tablaCells);
    const totalCells = numFilas * numColumnas;
    const filledCells = tablaCells.length;
    const emptyRatio = totalCells > 0 ? (totalCells - filledCells) / totalCells : 0;
    
    return {
      numFilas,
      numColumnas,
      totalCells,
      filledCells,
      emptyRatio,
      hasTextColumns: textStats.hasTextColumns,
      avgTextLength: textStats.avgTextLength,
      maxTextLength: textStats.maxTextLength,
      hasLongText: textStats.hasLongText,
    };
  }

  private analyzeTextContent(tabla: TablaResponseDTO, tablaCells: any[]): TextStats {
    const textColumns = tabla.columnas?.filter(col => col.tipoDato === TipoDatoCampo.TEXTO) || [];
    const hasTextColumns = textColumns.length > 0;
    
    if (!hasTextColumns || tablaCells.length === 0) {
      return { hasTextColumns: false, avgTextLength: 0, maxTextLength: 0, hasLongText: false };
    }
    
    const textColumnIds = new Set(textColumns.map(col => col.id));
    const textCells = tablaCells.filter(cell => textColumnIds.has(cell.idColumna));
    
    if (textCells.length === 0) {
      return { hasTextColumns: true, avgTextLength: 0, maxTextLength: 0, hasLongText: false };
    }
    
    const lengths = textCells.map(cell => (cell.valor || '').length);
    const totalLength = lengths.reduce((sum, len) => sum + len, 0);
    const avgTextLength = totalLength / lengths.length;
    const maxTextLength = Math.max(...lengths);
    const hasLongText = avgTextLength > this.config.layout.avgTextLengthThreshold;
    
    return { hasTextColumns: true, avgTextLength, maxTextLength, hasLongText };
  }
}

export interface TableAnalysis {
  numFilas: number;
  numColumnas: number;
  totalCells: number;
  filledCells: number;
  emptyRatio: number;
  hasTextColumns: boolean;
  avgTextLength: number;
  maxTextLength: number;
  hasLongText: boolean;
}

interface TextStats {
  hasTextColumns: boolean;
  avgTextLength: number;
  maxTextLength: number;
  hasLongText: boolean;
}
