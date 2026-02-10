import type { 
  EstructuraProduccionDTO, 
  RespuestasProduccionProtectedDTO, 
  RespuestasProduccionPublicDTO, 
  SeccionResponseDTO, 
  CampoSimpleResponseDTO 
} from '@/types/production';
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
  needsRotation: boolean;
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
    const respuestasCamposMap = respuestas.respuestasCampos.reduce(
      (acc, r) => ({ ...acc, [r.idCampo]: r.valor }), 
      {} as Record<number, string>
    );

    const allTables: TableInfo[] = [];
    const giantTables: TableInfo[] = [];

    // Analizar todas las tablas
    estructura.estructura.forEach((seccion: SeccionResponseDTO, seccionIndex: number) => {
      seccion.tablas.forEach((tabla, tablaIndex) => {
        const numColumnas = (tabla.columnas?.length || 0) + 1;
        const hasLongText = tabla.columnas?.some(col => col.tipoDato === TipoDatoCampo.TEXTO) ?? false;
        const fontSize = this.calculateFontSize(numColumnas, hasLongText);
        const needsRotation = this.spaceCalculator.shouldRotateTable(tabla);
        const isGiant = this.spaceCalculator.isGiantTable(tabla, respuestas.respuestasTablas, fontSize);
        const estimatedHeight = this.spaceCalculator.estimateTableHeight(tabla, fontSize);

        const tableInfo: TableInfo = {
          seccionIndex,
          tablaIndex,
          tabla,
          seccionTitulo: seccion.titulo,
          tablaNombre: tabla.nombre,
          isGiant,
          needsRotation,
          estimatedHeight,
        };

        allTables.push(tableInfo);
        if (isGiant) giantTables.push(tableInfo);
      });
    });

    // Construir contenido
    let currentPageHeight = 100; // Header + metadata aproximado

    estructura.estructura.forEach((seccion: SeccionResponseDTO, seccionIndex: number) => {
      // Título de sección (compacto)
      content.push({ 
        text: `${seccionIndex + 1}. ${seccion.titulo}`, 
        style: 'sectionTitle',
        margin: [0, this.config.layout.sectionSpacing, 0, this.config.layout.groupSpacing],
      });
      currentPageHeight += 20;

      // Campos simples (compactos)
      if (seccion.camposSimples.length > 0) {
        const fieldsGrid = this.buildFieldsGrid(seccion.camposSimples, respuestasCamposMap);
        content.push(fieldsGrid);
        currentPageHeight += this.estimateGridHeight(seccion.camposSimples, respuestasCamposMap);
      }

      // Grupos de campos (compactos)
      seccion.gruposCampos.forEach(grupo => {
        content.push({ 
          text: grupo.subtitulo, 
          fontSize: 10, 
          bold: true, 
          margin: [0, this.config.layout.groupSpacing, 0, this.config.layout.fieldSpacing] 
        });
        content.push(this.buildFieldsGrid(grupo.campos, respuestasCamposMap));
        currentPageHeight += this.estimateGridHeight(grupo.campos, respuestasCamposMap);
      });

      // Tablas
      seccion.tablas.forEach((tabla, tablaIndex) => {
        const tableInfo = allTables.find(t => 
          t.seccionIndex === seccionIndex && t.tablaIndex === tablaIndex
        );
        if (!tableInfo) return;

        // Si es gigante, solo referencia
        if (tableInfo.isGiant) {
          content.push({
            text: `→ ${tabla.nombre} (Ver al final del documento)`,
            fontSize: 9,
            italics: true,
            margin: [0, 5, 0, 3],
          });
          return;
        }

        const numColumnas = (tabla.columnas?.length || 0) + 1;
        const shouldBreak = this.spaceCalculator.shouldMoveToNewPage(
          currentPageHeight, 
          tableInfo.estimatedHeight, 
          pageOrientation
        );

        // Título de tabla (compacto)
        const tableTitle = { 
          text: tabla.nombre, 
          fontSize: 10, 
          bold: true, 
          margin: [0, this.config.layout.tableSpacing, 0, 2],
        };

        if (shouldBreak) {
          content.push({ ...tableTitle, pageBreak: 'before' });
          currentPageHeight = 0; // Resetear altura al cambiar de página
        } else {
          content.push(tableTitle);
        }
        currentPageHeight += tableInfo.estimatedHeight;

        // Tabla con rotación si es necesaria
        if (numColumnas > this.config.layout.maxColumnasLandscape) {
          content.push(...this.tableBuilder.buildSplit(
            tabla, 
            respuestas.respuestasTablas, 
            pageOrientation,
            tableInfo.needsRotation
          ));
        } else {
          content.push(this.tableBuilder.build(
            tabla, 
            respuestas.respuestasTablas, 
            pageOrientation,
            tableInfo.needsRotation
          ));
        }
      });
    });

    // Tablas gigantes al final
    if (giantTables.length > 0) {
      content.push({
        text: 'ANEXO - TABLAS DETALLADAS',
        style: 'header',
        margin: [0, 15, 0, 8],
        pageBreak: 'before'
      });

      giantTables.forEach((tableInfo, index) => {
        const { tabla, seccionTitulo, tablaNombre } = tableInfo;
        
        content.push({
          text: `${seccionTitulo} - ${tablaNombre}`,
          fontSize: 11,
          bold: true,
          margin: [0, index > 0 ? 12 : 0, 0, 4],
          pageBreak: index > 0 ? 'before' : undefined
        });

        const numColumnas = (tabla.columnas?.length || 0) + 1;
        
        if (numColumnas > this.config.layout.maxColumnasLandscape) {
          content.push(...this.tableBuilder.buildSplit(
            tabla, 
            respuestas.respuestasTablas, 
            pageOrientation,
            tableInfo.needsRotation
          ));
        } else {
          content.push(this.tableBuilder.build(
            tabla, 
            respuestas.respuestasTablas, 
            pageOrientation,
            tableInfo.needsRotation
          ));
        }
      });
    }

    return content;
  }

  private calculateFontSize(numColumnas: number, hasLongText: boolean): number {
    if (numColumnas > 8) return this.config.fontSize.small;
    if (numColumnas > 6) return this.config.fontSize.medium;
    return this.config.fontSize.normal;
  }

  // MEJORADO: Estima la altura real de un grid de campos
  private estimateGridHeight(campos: CampoSimpleResponseDTO[], respuestasMap: Record<number, string>): number {
    let totalHeight = 0;
    const numRows = Math.ceil(campos.length / this.config.layout.fieldsPerRow);

    for (let i = 0; i < numRows; i++) {
      const rowCampos = campos.slice(i * 3, (i * 3) + 3);
      let maxLinesInRow = 1;

      rowCampos.forEach(campo => {
        if (campo.tipoDato === TipoDatoCampo.TEXTO) {
          const valor = respuestasMap[campo.id] || '';
          const numLines = Math.ceil(valor.length / this.config.charsPerLine.fieldValue);
          if (numLines > maxLinesInRow) {
            maxLinesInRow = numLines;
          }
        }
      });
      
      totalHeight += maxLinesInRow * this.config.table.lineHeight + 10; // +10 para márgenes
    }
    
    return totalHeight;
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
            const width = hasText ? (f.campo.tipoDato === TipoDatoCampo.TEXTO ? '*' : 'auto') : '*';
            
            return {
                width,
                stack: [
                    { text: f.campo.nombre, style: 'label', fontSize: this.config.fonts.label },
                    { text: f.displayValue, style: 'value', fontSize: this.config.fonts.value }
                ],
                margin: [0, 0, 8, this.config.layout.fieldSpacing]
            };
        });

        rows.push({ columns, columnGap: 8 });
        currentRowFields = [];
      }
    });

    return { stack: rows, margin: [0, 3, 0, 3] };
  }
}
