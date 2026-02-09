import type { TablaResponseDTO } from '@/types/production';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import { PDF_CONFIG } from '../config';
import { TableWidthCalculator } from '../calculators/TableWidthCalculator';
import { ValueFormatter } from '../formatters';
import dayjs from 'dayjs';

export class TableBuilder {
  constructor(
    private config: typeof PDF_CONFIG,
    private widthCalculator: TableWidthCalculator
  ) {}

  build(tabla: TablaResponseDTO, respuestasTablas: any[]) {
    const numColumnas = (tabla.columnas?.length || 0) + 1;
    const fontSize = this.calculateFontSize(numColumnas);
    
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

  private calculateFontSize(numColumnas: number): number {
    if (numColumnas > 10) return 7;
    if (numColumnas > 6) return 8;
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
