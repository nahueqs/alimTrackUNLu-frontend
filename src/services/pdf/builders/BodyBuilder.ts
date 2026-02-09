import type { EstructuraProduccionDTO, RespuestasProduccionProtectedDTO, RespuestasProduccionPublicDTO, SeccionResponseDTO, CampoSimpleResponseDTO } from '@/types/production';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import { PDF_CONFIG } from '../config';
import { TableWidthCalculator } from '../calculators/TableWidthCalculator';
import { TableBuilder } from './TableBuilder';
import { ValueFormatter } from '../formatters';

type RespuestasProduccion = RespuestasProduccionPublicDTO | RespuestasProduccionProtectedDTO;

export class BodyBuilder {
  private tableBuilder: TableBuilder;

  constructor(
    private config: typeof PDF_CONFIG,
    widthCalculator: TableWidthCalculator
  ) {
    this.tableBuilder = new TableBuilder(config, widthCalculator);
  }

  build(estructura: EstructuraProduccionDTO, respuestas: RespuestasProduccion, pageOrientation: 'portrait' | 'landscape') {
    const content: any[] = [];
    const respuestasCamposMap = respuestas.respuestasCampos.reduce((acc, r) => ({ ...acc, [r.idCampo]: r.valor }), {} as Record<number, string>);

    estructura.estructura.forEach((seccion: SeccionResponseDTO, index: number) => {
      // Título de Sección
      content.push({ 
        text: `${index + 1}. ${seccion.titulo}`, 
        style: 'sectionTitle',
        margin: [0, 15, 0, 5],
        pageBreak: index > 0 ? 'before' : undefined
      });

      // Campos Simples
      if (seccion.camposSimples.length > 0) {
        content.push(this.buildFieldsGrid(seccion.camposSimples, respuestasCamposMap));
      }

      // Grupos de Campos
      seccion.gruposCampos.forEach(grupo => {
        content.push({ text: grupo.subtitulo, fontSize: 11, bold: true, margin: [0, 8, 0, 3] });
        content.push(this.buildFieldsGrid(grupo.campos, respuestasCamposMap));
      });

      // Tablas
      seccion.tablas.forEach((tabla, tablaIndex) => {
        const numColumnas = (tabla.columnas?.length || 0) + 1;
        
        if (numColumnas > this.config.layout.maxColumnasLandscape) {
            content.push({ 
                text: tabla.nombre, 
                fontSize: 11, 
                bold: true, 
                margin: [0, 10, 0, 2],
                pageBreak: tablaIndex > 0 ? 'before' : undefined
            });
            content.push(...this.tableBuilder.buildSplit(tabla, respuestas.respuestasTablas, pageOrientation));
        } else {
            content.push({ text: tabla.nombre, fontSize: 11, bold: true, margin: [0, 10, 0, 2] });
            content.push(this.tableBuilder.build(tabla, respuestas.respuestasTablas, pageOrientation));
        }
      });

      // Línea separadora
      if (index < estructura.estructura.length - 1) {
        content.push({ 
            canvas: [{ 
                type: 'line', 
                x1: 0, 
                y1: 5, 
                x2: pageOrientation === 'landscape' ? this.config.table.pageWidths.landscape : this.config.table.pageWidths.portrait, 
                y2: 5, 
                lineWidth: 0.5, 
                lineColor: '#ccc' 
            }],
            margin: [0, 10, 0, 0]
        });
      }
    });

    return content;
  }

  private buildFieldsGrid(campos: CampoSimpleResponseDTO[], respuestasMap: Record<number, string>) {
    const rows: any[] = [];
    let currentRowFields: { campo: CampoSimpleResponseDTO, displayValue: string }[] = [];

    campos.forEach((campo, i) => {
      const valor = respuestasMap[campo.id] || '-';
      const displayValue = ValueFormatter.format(valor, campo.tipoDato);

      currentRowFields.push({ campo, displayValue });

      if (currentRowFields.length === this.config.layout.fieldsPerRow || i === campos.length - 1) {
        const hasText = currentRowFields.some(f => f.campo.tipoDato === TipoDatoCampo.TEXTO);
        
        const columns = currentRowFields.map(f => {
            let width: any = '*';
            if (hasText) {
                width = f.campo.tipoDato === TipoDatoCampo.TEXTO ? '*' : 'auto';
            }
            
            return {
                width: width,
                stack: [
                    { text: f.campo.nombre, style: 'label', fontSize: this.config.fonts.tableCell },
                    { text: f.displayValue, style: 'value', fontSize: this.config.fonts.value }
                ],
                margin: [0, 0, 10, 5]
            };
        });

        rows.push({ columns: columns, columnGap: 10 });
        currentRowFields = [];
      }
    });

    return { stack: rows, margin: [0, 5, 0, 5] };
  }
}
