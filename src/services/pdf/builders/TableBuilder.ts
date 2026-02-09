import type { TablaResponseDTO } from '@/types/production';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import { PDF_CONFIG } from '../config';
import { TableWidthCalculator } from '../calculators/TableWidthCalculator';
import { ValueFormatter } from '../formatters';

export class TableBuilder {
  constructor(
    private config: typeof PDF_CONFIG,
    private widthCalculator: TableWidthCalculator
  ) {}

  build(tabla: TablaResponseDTO, respuestasTablas: any[], pageOrientation: 'portrait' | 'landscape') {
    const numColumnas = (tabla.columnas?.length || 0) + 1;
    
    // Detectar si hay columnas de texto para ajustar el tamaño de fuente
    const hasLongText = tabla.columnas?.some(col => 
      col.tipoDato === TipoDatoCampo.TEXTO
    ) ?? false;

    const fontSize = this.calculateFontSize(numColumnas, hasLongText);
    const maxChars = this.calculateMaxChars(numColumnas);
    
    return {
      table: {
        headerRows: 1,
        widths: this.widthCalculator.calculate(tabla, numColumnas, fontSize, pageOrientation),
        body: this.buildTableBody(tabla, respuestasTablas, fontSize, maxChars),
        dontBreakRows: true,
        keepWithHeaderRows: 1
      },
      layout: {
        hLineWidth: (i: number) => 0.5,
        vLineWidth: (i: number) => 0.5,
        hLineColor: (i: number) => i === 0 || i === 1 ? '#000' : '#ddd',
        vLineColor: () => '#ddd',
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 3,
        paddingBottom: () => 3,
      },
      margin: [0, 5, 0, 10],
    };
  }

  buildSplit(tabla: TablaResponseDTO, respuestasTablas: any[], pageOrientation: 'portrait' | 'landscape'): any[] {
    const maxColsPorTabla = pageOrientation === 'landscape' 
      ? this.config.layout.maxColumnasLandscape - 1
      : this.config.layout.maxColumnasPortrait - 1;
    
    const columnas = tabla.columnas || [];
    const numSubTablas = Math.ceil(columnas.length / maxColsPorTabla);
    const subTablas: any[] = [];

    for (let i = 0; i < numSubTablas; i++) {
      const startIdx = i * maxColsPorTabla;
      const endIdx = Math.min(startIdx + maxColsPorTabla, columnas.length);
      const columnasSubTabla = columnas.slice(startIdx, endIdx);

      const subTabla: TablaResponseDTO = {
        ...tabla,
        columnas: columnasSubTabla
      };

      if (i > 0) {
        subTablas.push({
          text: `${tabla.nombre} (continuación ${i + 1})`,
          fontSize: 10,
          italics: true,
          margin: [0, 15, 0, 2],
          pageBreak: 'before'
        });
      }

      subTablas.push(this.build(subTabla, respuestasTablas, pageOrientation));
    }

    return subTablas;
  }

  private calculateFontSize(numColumnas: number, hasLongText: boolean): number {
    if (numColumnas > 7) {
        return this.config.fontSize.small;
    }
    if (numColumnas > 5) {
        return this.config.fontSize.medium;
    }
    return this.config.fontSize.normal;
  }

  private calculateMaxChars(numColumnas: number): number {
    if (numColumnas > 7) return this.config.charsPerLine.small;
    if (numColumnas > 5) return this.config.charsPerLine.medium;
    return this.config.charsPerLine.large;
  }

  private buildTableBody(tabla: TablaResponseDTO, respuestasTablas: any[], fontSize: number, maxChars: number) {
    const headers = [
      { text: 'Concepto', style: 'tableHeader', fontSize },
      ...(tabla.columnas?.map(c => ({ 
        text: ValueFormatter.format(c.nombre, TipoDatoCampo.TEXTO, maxChars), 
        style: 'tableHeader', 
        fontSize 
      })) || [])
    ];

    const body = tabla.filas?.map(fila => {
      const row: any[] = [
        { 
            text: ValueFormatter.format(fila.nombre, TipoDatoCampo.TEXTO, maxChars), 
            style: 'tableCell', 
            bold: true, 
            fontSize 
        }
      ];

      tabla.columnas?.forEach(col => {
        const resp = respuestasTablas.find((r: any) => r.idTabla === tabla.id && r.idFila === fila.id && r.idColumna === col.id);
        const val = resp?.valor || '-';
        
        row.push({ 
            text: ValueFormatter.format(val, col.tipoDato, maxChars), 
            style: 'tableCell', 
            fontSize 
        });
      });

      return row;
    }) || [];

    return [headers, ...body];
  }
}
