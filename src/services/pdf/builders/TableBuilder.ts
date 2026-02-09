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

  build(tabla: TablaResponseDTO, respuestasTablas: any[]) {
    const numColumnas = (tabla.columnas?.length || 0) + 1;
    
    // Detectar si hay columnas de texto para ajustar el tamaño de fuente
    const hasLongText = tabla.columnas?.some(col => 
      col.tipoDato === TipoDatoCampo.TEXTO
    ) ?? false;

    const fontSize = this.calculateFontSize(numColumnas, hasLongText);
    
    return {
      table: {
        headerRows: 1,
        widths: this.widthCalculator.calculate(tabla, numColumnas, fontSize),
        body: this.buildTableBody(tabla, respuestasTablas, fontSize),
        dontBreakRows: false,
      },
      layout: 'lightHorizontalLines',
      margin: [0, 5, 0, 10],
    };
  }

  private calculateFontSize(numColumnas: number, hasLongText: boolean): number {
    if (numColumnas > 6) {
        // Si hay muchas columnas y texto largo, reducir más la fuente
        return hasLongText ? 6 : 8;
    }
    if (numColumnas > 10) return 7;
    return this.config.fonts.tableCell;
  }

  private buildTableBody(tabla: TablaResponseDTO, respuestasTablas: any[], fontSize: number) {
    const headers = [
      { text: 'Concepto', style: 'tableHeader', fontSize },
      ...(tabla.columnas?.map(c => ({ text: c.nombre, style: 'tableHeader', fontSize })) || [])
    ];

    const body = tabla.filas?.map(fila => {
      const row: any[] = [
        { text: ValueFormatter.format(fila.nombre, TipoDatoCampo.TEXTO), style: 'tableCell', bold: true, fontSize }
      ];

      tabla.columnas?.forEach(col => {
        const resp = respuestasTablas.find((r: any) => r.idTabla === tabla.id && r.idFila === fila.id && r.idColumna === col.id);
        const val = resp?.valor || '-';
        
        row.push({ 
            text: ValueFormatter.format(val, col.tipoDato), 
            style: 'tableCell', 
            fontSize 
        });
      });

      return row;
    }) || [];

    return [headers, ...body];
  }
}
