import type { EstructuraProduccionDTO, RespuestasProduccionProtectedDTO, RespuestasProduccionPublicDTO, SeccionResponseDTO, CampoSimpleResponseDTO } from '@/types/production';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import { PDF_CONFIG } from '../config';
import { TableWidthCalculator } from '../calculators/TableWidthCalculator';
import { SpaceCalculator } from '../calculators/SpaceCalculator';
import { TableBuilder } from './TableBuilder';
import { ValueFormatter } from '../formatters';

type RespuestasProduccion = RespuestasProduccionPublicDTO | RespuestasProduccionProtectedDTO;

interface TableInfo {
  seccionIndex: number;
  tablaIndex: number;
  tabla: any;
  seccionTitulo: string;
  tablaNombre: string;
  isGiant: boolean;
  estimatedHeight: number;
}

export class BodyBuilder {
  private tableBuilder: TableBuilder;
  private spaceCalculator: SpaceCalculator;

  constructor(
    private config: typeof PDF_CONFIG,
    widthCalculator: TableWidthCalculator,
    spaceCalculator: SpaceCalculator
  ) {
    this.tableBuilder = new TableBuilder(config, widthCalculator);
    this.spaceCalculator = spaceCalculator;
  }

  build(estructura: EstructuraProduccionDTO, respuestas: RespuestasProduccion, pageOrientation: 'portrait' | 'landscape') {
    const content: any[] = [];
    const respuestasCamposMap = respuestas.respuestasCampos.reduce((acc, r) => ({ ...acc, [r.idCampo]: r.valor }), {} as Record<number, string>);

    // Recopilar información de todas las tablas CON ANÁLISIS DE CONTENIDO
    const allTables: TableInfo[] = [];
    const giantTables: TableInfo[] = [];

    estructura.estructura.forEach((seccion: SeccionResponseDTO, seccionIndex: number) => {
      seccion.tablas.forEach((tabla, tablaIndex) => {
        const numColumnas = (tabla.columnas?.length || 0) + 1;
        const hasLongText = tabla.columnas?.some(col => col.tipoDato === TipoDatoCampo.TEXTO) ?? false;
        const fontSize = this.calculateFontSize(numColumnas, hasLongText);
        
        // NUEVO: Análisis basado en contenido REAL
        const isGiant = this.spaceCalculator.isGiantTable(tabla, respuestas.respuestasTablas, fontSize);
        const estimatedHeight = this.spaceCalculator.estimateTableHeight(tabla, fontSize);

        const tableInfo: TableInfo = {
          seccionIndex,
          tablaIndex,
          tabla,
          seccionTitulo: seccion.titulo,
          tablaNombre: tabla.nombre,
          isGiant,
          estimatedHeight,
        };

        allTables.push(tableInfo);
        
        if (isGiant) {
          giantTables.push(tableInfo);
        }
      });
    });

    // Construir contenido regular
    let currentPageHeight = 150; // Altura inicial aproximada (header + metadata)

    estructura.estructura.forEach((seccion: SeccionResponseDTO, seccionIndex: number) => {
      // Título de Sección (solo pageBreak si no es la primera)
      const seccionTitle = { 
        text: `${seccionIndex + 1}. ${seccion.titulo}`, 
        style: 'sectionTitle',
        margin: [0, 15, 0, 5],
        pageBreak: seccionIndex > 0 ? 'before' : undefined
      };
      content.push(seccionTitle);
      currentPageHeight = seccionIndex > 0 ? 30 : currentPageHeight + 30;

      // Campos Simples
      if (seccion.camposSimples.length > 0) {
        const fieldsGrid = this.buildFieldsGrid(seccion.camposSimples, respuestasCamposMap);
        content.push(fieldsGrid);
        currentPageHeight += seccion.camposSimples.length * 25;
      }

      // Grupos de Campos
      seccion.gruposCampos.forEach(grupo => {
        content.push({ text: grupo.subtitulo, fontSize: 11, bold: true, margin: [0, 8, 0, 3] });
        content.push(this.buildFieldsGrid(grupo.campos, respuestasCamposMap));
        currentPageHeight += grupo.campos.length * 25;
      });

      // Tablas con lógica MEJORADA
      seccion.tablas.forEach((tabla, tablaIndex) => {
        const tableInfo = allTables.find(t => 
          t.seccionIndex === seccionIndex && t.tablaIndex === tablaIndex
        );

        if (!tableInfo) return;

        // Si es tabla gigante, solo agregar referencia
        if (tableInfo.isGiant) {
          content.push({
            text: `📊 ${tabla.nombre} (Ver al final del documento)`,
            fontSize: 10,
            italics: true,
            color: '#0066cc',
            margin: [0, 10, 0, 5],
            decoration: 'underline'
          });
          return;
        }

        // Para tablas normales, verificar espacio disponible
        const numColumnas = (tabla.columnas?.length || 0) + 1;
        
        // Tablas con muchas columnas (divididas)
        if (numColumnas > this.config.layout.maxColumnasLandscape) {
          const shouldBreak = this.spaceCalculator.shouldMoveToNewPage(
            currentPageHeight, 
            tableInfo.estimatedHeight, 
            pageOrientation
          );

          content.push({ 
            text: tabla.nombre, 
            fontSize: 11, 
            bold: true, 
            margin: [0, 10, 0, 2],
            pageBreak: shouldBreak ? 'before' : undefined
          });
          content.push(...this.tableBuilder.buildSplit(tabla, respuestas.respuestasTablas, pageOrientation));
          
          currentPageHeight = shouldBreak ? tableInfo.estimatedHeight : currentPageHeight + tableInfo.estimatedHeight;
        } else {
          // Tablas normales - SOLO mover a nueva página si NO cabe
          const shouldBreak = this.spaceCalculator.shouldMoveToNewPage(
            currentPageHeight, 
            tableInfo.estimatedHeight, 
            pageOrientation
          );

          content.push({ 
            text: tabla.nombre, 
            fontSize: 11, 
            bold: true, 
            margin: [0, 10, 0, 2],
            pageBreak: shouldBreak ? 'before' : undefined
          });
          content.push(this.tableBuilder.build(tabla, respuestas.respuestasTablas, pageOrientation));
          
          currentPageHeight = shouldBreak ? tableInfo.estimatedHeight : currentPageHeight + tableInfo.estimatedHeight;
        }
      });

      // Línea separadora (SOLO si no es la última sección Y no viene pageBreak después)
      if (seccionIndex < estructura.estructura.length - 1) {
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

    // Agregar tablas gigantes al final
    if (giantTables.length > 0) {
      content.push({
        text: 'TABLAS DETALLADAS',
        style: 'header',
        margin: [0, 20, 0, 10],
        pageBreak: 'before'
      });

      giantTables.forEach((tableInfo, index) => {
        const { tabla, seccionTitulo, tablaNombre } = tableInfo;
        
        content.push({
          text: `${seccionTitulo} - ${tablaNombre}`,
          fontSize: 12,
          bold: true,
          margin: [0, index > 0 ? 15 : 0, 0, 5],
          pageBreak: index > 0 ? 'before' : undefined
        });

        const numColumnas = (tabla.columnas?.length || 0) + 1;
        
        if (numColumnas > this.config.layout.maxColumnasLandscape) {
          content.push(...this.tableBuilder.buildSplit(tabla, respuestas.respuestasTablas, pageOrientation));
        } else {
          content.push(this.tableBuilder.build(tabla, respuestas.respuestasTablas, pageOrientation));
        }
      });
    }

    return content;
  }

  private calculateFontSize(numColumnas: number, hasLongText: boolean): number {
    if (numColumnas > 7) return this.config.fontSize.small;
    if (numColumnas > 5) return this.config.fontSize.medium;
    return this.config.fontSize.normal;
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
