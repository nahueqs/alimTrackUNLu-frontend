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

  // NUEVO: Build con rotación opcional
  build(
    tabla: TablaResponseDTO, 
    respuestasTablas: any[], 
    pageOrientation: 'portrait' | 'landscape',
    forceRotate: boolean = false
  ) {
    const numColumnas = (tabla.columnas?.length || 0) + 1;
    const hasLongText = tabla.columnas?.some(col => col.tipoDato === TipoDatoCampo.TEXTO) ?? false;
    const fontSize = this.calculateFontSize(numColumnas, hasLongText);
    const maxChars = this.calculateMaxChars(numColumnas);
    
    // Si forceRotate, usar landscape para el cálculo de widths
    const effectiveOrientation = forceRotate ? 'landscape' : pageOrientation;
    
    const tableDefinition = {
      table: {
        headerRows: 1,
        widths: this.widthCalculator.calculate(tabla, numColumnas, fontSize, effectiveOrientation),
        body: this.buildTableBody(tabla, respuestasTablas, fontSize, maxChars),
        dontBreakRows: true,
        keepWithHeaderRows: 1
      },
      layout: {
        hLineWidth: (i: number) => 0.5,
        vLineWidth: (i: number) => 0.5,
        hLineColor: (i: number) => i === 0 || i === 1 ? '#333' : '#ddd',
        vLineColor: () => '#ddd',
        paddingLeft: () => 3,
        paddingRight: () => 3,
        paddingTop: () => 2,
        paddingBottom: () => 2,
      },
      margin: [0, this.config.layout.tableSpacing, 0, 8],
    };

    // Si necesita rotación, aplicar pageOrientation a este elemento
    if (forceRotate) {
      return {
        ...tableDefinition,
        pageOrientation: 'landscape',
        pageBreak: 'before',
      };
    }

    return tableDefinition;
  }

  buildSplit(
    tabla: TablaResponseDTO, 
    respuestasTablas: any[], 
    pageOrientation: 'portrait' | 'landscape',
    forceRotate: boolean = false
  ): any[] {
    const effectiveOrientation = forceRotate ? 'landscape' : pageOrientation;
    const maxColsPorTabla = effectiveOrientation === 'landscape' 
      ? this.config.layout.maxColumnasLandscape - 1
      : this.config.layout.maxColumnasPortrait - 1;
    
    const columnas = tabla.columnas || [];
    const numSubTablas = Math.ceil(columnas.length / maxColsPorTabla);
    const subTablas: any[] = [];

    for (let i = 0; i < numSubTablas; i++) {
      const startIdx = i * maxColsPorTabla;
      const endIdx = Math.min(startIdx + maxColsPorTabla, columnas.length);
      const columnasSubTabla = columnas.slice(startIdx, endIdx);

      const subTabla: TablaResponseDTO = { ...tabla, columnas: columnasSubTabla };

      if (i > 0) {
        const continuation = {
          text: `${tabla.nombre} (cont. ${i + 1})`,
          fontSize: 9,
          italics: true,
          margin: [0, 10, 0, 2],
        };
        
        if (forceRotate) {
          subTablas.push({ ...continuation, pageOrientation: 'landscape', pageBreak: 'before' });
        } else {
          subTablas.push({ ...continuation, pageBreak: 'before' });
        }
      }

      subTablas.push(this.build(subTabla, respuestasTablas, pageOrientation, forceRotate));
    }

    return subTablas;
  }

  private calculateFontSize(numColumnas: number, hasLongText: boolean): number {
    if (numColumnas > 8) return this.config.fontSize.small;
    if (numColumnas > 6) return this.config.fontSize.medium;
    return this.config.fontSize.normal;
  }

  private calculateMaxChars(numColumnas: number): number {
    if (numColumnas > 8) return this.config.charsPerLine.small;
    if (numColumnas > 6) return this.config.charsPerLine.medium;
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
        const resp = respuestasTablas.find((r: any) => 
          r.idTabla === tabla.id && r.idFila === fila.id && r.idColumna === col.id
        );
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
