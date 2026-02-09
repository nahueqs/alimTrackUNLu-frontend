import pdfMake from 'pdfmake/build/pdfmake';
// @ts-ignore
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { 
  EstructuraProduccionDTO, 
  RespuestasProduccionProtectedDTO, 
  RespuestasProduccionPublicDTO,
  SeccionResponseDTO,
  TablaResponseDTO,
  CampoSimpleResponseDTO
} from '@/types/production';
import dayjs from 'dayjs';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';

// Inicializar fuentes (necesario para pdfmake en cliente)
if (pdfFonts && (pdfFonts as any).pdfMake && (pdfFonts as any).pdfMake.vfs) {
    // @ts-ignore
    pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;
} else if (pdfFonts && (pdfFonts as any).vfs) {
    // @ts-ignore
    pdfMake.vfs = (pdfFonts as any).vfs;
} else {
    console.warn('No se pudieron cargar las fuentes de pdfmake. Es posible que el PDF no se genere correctamente.');
}

type RespuestasProduccion = RespuestasProduccionPublicDTO | RespuestasProduccionProtectedDTO;

/**
 * Envuelve texto largo insertando saltos de línea cada N caracteres.
 * Prioriza cortar en espacios cuando existen, evitando partir palabras.
 * 
 * @param text - Texto a envolver
 * @param maxCharsPerLine - Máximo de caracteres por línea antes de insertar salto
 * @returns Texto con saltos de línea insertados
 */
function wrapLongText(text: string, maxCharsPerLine: number): string {
  if (!text || text.length <= maxCharsPerLine) return text;
  
  const result: string[] = [];
  let remaining = text;
  
  while (remaining.length > 0) {
    // Si lo que queda es menor al límite, agregarlo y terminar
    if (remaining.length <= maxCharsPerLine) {
      result.push(remaining);
      break;
    }
    
    // Tomar un chunk del tamaño máximo
    const chunk = remaining.substring(0, maxCharsPerLine);
    const lastSpaceIndex = chunk.lastIndexOf(' ');
    
    // Si hay un espacio en la segunda mitad del chunk, cortar ahí para no partir palabras
    if (lastSpaceIndex > maxCharsPerLine * 0.5) {
      result.push(remaining.substring(0, lastSpaceIndex));
      remaining = remaining.substring(lastSpaceIndex + 1);
    } else {
      // Si no hay espacios cercanos, cortar forzosamente en el límite
      result.push(chunk);
      remaining = remaining.substring(maxCharsPerLine);
    }
  }
  
  // Unir con saltos de línea reales que pdfmake respeta
  return result.join('\n');
}

/**
 * Formatea un valor según su tipo de dato para visualización en el PDF
 * 
 * @param valor - Valor a formatear
 * @param tipoDato - Tipo de dato del campo
 * @returns Valor formateado como string
 */
function formatValue(valor: string, tipoDato: TipoDatoCampo): string {
  if (valor === '-' || !valor) return '-';

  switch (tipoDato) {
    case TipoDatoCampo.BOOLEANO:
      return valor === 'true' ? 'Sí' : valor === 'false' ? 'No' : '-';
    
    case TipoDatoCampo.DECIMAL: {
      const num = parseFloat(valor);
      return isNaN(num) ? valor : num.toFixed(2);
    }
    
    case TipoDatoCampo.ENTERO: {
      const num = parseFloat(valor);
      return isNaN(num) ? valor : Math.floor(num).toString();
    }
    
    case TipoDatoCampo.FECHA:
      return dayjs(valor).format('DD/MM/YYYY');
    
    case TipoDatoCampo.HORA:
      // Si el valor incluye fecha completa, extraer solo la hora
      if (valor.includes('T') || valor.includes('-')) {
        return dayjs(valor).format('HH:mm:ss');
      }
      return valor;
    
    case TipoDatoCampo.TEXTO:
      // Para texto largo, insertar saltos de línea
      return wrapLongText(valor, 50);
    
    default:
      return valor;
  }
}

export const pdfService = {
  generateProductionPdf(estructura: EstructuraProduccionDTO, respuestas: RespuestasProduccion) {
    // Detectar si hay tablas con muchas columnas para determinar orientación del documento
    const tieneTablaAnchas = estructura.estructura.some(seccion => 
      seccion.tablas.some(tabla => (tabla.columnas?.length || 0) + 1 > 6)
    );
    
    const pageOrientation = tieneTablaAnchas ? 'landscape' : 'portrait';
    
    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: pageOrientation,
      pageMargins: [40, 40, 40, 40],
      content: [
        this.buildHeader(estructura),
        this.buildMetadata(respuestas),
        { text: '', margin: [0, 10] },
        this.buildBody(estructura, respuestas),
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        label: { fontSize: 10, color: '#444' },
        value: { fontSize: 10, bold: true },
        sectionTitle: { fontSize: 12, bold: true, margin: [0, 15, 0, 5], decoration: 'underline' },
        tableHeader: { bold: true, fontSize: 10, color: 'black', fillColor: '#eeeeee' },
        tableCell: { fontSize: 9 },
      },
      defaultStyle: {
        font: 'Roboto'
      }
    };

    pdfMake.createPdf(docDefinition).open();
  },

  buildHeader(estructura: EstructuraProduccionDTO) {
    return {
      columns: [
        {
          width: '*',
          text: [
            { text: 'Reporte de Producción\n', style: 'header' },
            { text: `Receta: ${estructura.metadata.nombre} (${estructura.metadata.codigoVersionReceta})`, fontSize: 10 }
          ]
        },
        {
          width: 'auto',
          text: `Generado: ${dayjs().format('DD/MM/YYYY HH:mm')}`,
          fontSize: 8,
          alignment: 'right'
        }
      ]
    };
  },

  buildMetadata(respuestas: RespuestasProduccion) {
    const { produccion, progreso } = respuestas;
    const isProtected = 'emailCreador' in produccion;

    const data: any[] = [
      [
        { text: 'Código:', style: 'label' }, 
        { text: produccion.codigoProduccion, style: 'value' },
        { text: 'Lote:', style: 'label' }, 
        { text: produccion.lote || '-', style: 'value' },
        { text: 'Estado:', style: 'label' }, 
        { text: produccion.estado, style: 'value' }
      ],
      [
        { text: 'Inicio:', style: 'label' }, 
        { text: dayjs(produccion.fechaInicio).format('DD/MM/YYYY HH:mm'), style: 'value' },
        { text: 'Fin:', style: 'label' }, 
        { text: produccion.fechaFin ? dayjs(produccion.fechaFin).format('DD/MM/YYYY HH:mm') : '-', style: 'value' },
        { text: 'Progreso:', style: 'label' }, 
        { text: `${Math.round(progreso.porcentajeCompletado)}%`, style: 'value' }
      ]
    ];

    if (isProtected && (produccion as any).encargado) {
      data.push([
        { text: 'Encargado:', style: 'label' }, 
        { text: (produccion as any).encargado, style: 'value', colSpan: 5 }, 
        {}, {}, {}, {}
      ]);
    }

    return {
      table: {
        widths: ['auto', '*', 'auto', '*', 'auto', '*'],
        body: data
      },
      layout: 'noBorders',
      margin: [0, 10, 0, 10]
    };
  },

  buildBody(estructura: EstructuraProduccionDTO, respuestas: RespuestasProduccion) {
    const content: any[] = [];
    const respuestasCamposMap = respuestas.respuestasCampos.reduce(
      (acc, r) => ({ ...acc, [r.idCampo]: r.valor }), 
      {} as Record<number, string>
    );

    estructura.estructura.forEach((seccion: SeccionResponseDTO, index: number) => {
      // Título de Sección
      content.push({ 
        text: `${index + 1}. ${seccion.titulo}`, 
        style: 'sectionTitle',
        margin: [0, 15, 0, 5]
      });

      // Campos Simples (Layout de 3 columnas)
      if (seccion.camposSimples.length > 0) {
        content.push(this.buildFieldsGrid(seccion.camposSimples, respuestasCamposMap));
      }

      // Grupos de Campos
      seccion.gruposCampos.forEach(grupo => {
        content.push({ 
          text: grupo.subtitulo, 
          fontSize: 11, 
          bold: true, 
          margin: [0, 5, 0, 2] 
        });
        content.push(this.buildFieldsGrid(grupo.campos, respuestasCamposMap));
      });

      // Tablas
      seccion.tablas.forEach(tabla => {
        content.push({ 
          text: tabla.nombre, 
          fontSize: 11, 
          bold: true, 
          margin: [0, 10, 0, 2] 
        });
        content.push(this.buildTable(tabla, respuestas.respuestasTablas));
      });

      // Línea separadora entre secciones
      content.push({ 
        canvas: [{ 
          type: 'line', 
          x1: 0, 
          y1: 5, 
          x2: 515, 
          y2: 5, 
          lineWidth: 0.5, 
          lineColor: '#ccc' 
        }] 
      });
    });

    return content;
  },

  buildFieldsGrid(campos: CampoSimpleResponseDTO[], respuestasMap: Record<number, string>) {
    const columns: any[] = [];
    let currentRow: any[] = [];

    campos.forEach((campo, i) => {
      const valor = respuestasMap[campo.id] || '-';
      const displayValue = formatValue(valor, campo.tipoDato);

      currentRow.push({
        stack: [
          { text: campo.nombre, style: 'label', fontSize: 9 },
          { text: displayValue, style: 'value', fontSize: 10 }
        ],
        margin: [0, 0, 10, 5]
      });

      // Cada 3 campos, nueva fila (o si es el último campo)
      if (currentRow.length === 3 || i === campos.length - 1) {
        columns.push({ columns: currentRow, columnGap: 10 });
        currentRow = [];
      }
    });

    return { stack: columns, margin: [0, 5, 0, 5] };
  },

  buildTable(tabla: TablaResponseDTO, respuestasTablas: any[]) {
    const numColumnas = (tabla.columnas?.length || 0) + 1; // +1 por columna "Concepto"
    
    // Detectar si hay columnas de texto para ajustar el tamaño de fuente
    const hasLongText = tabla.columnas?.some(col => 
      col.tipoDato === TipoDatoCampo.TEXTO
    ) ?? false;
    
    // Determinar tamaño de fuente según número de columnas y tipo de contenido
    let fontSize = 9;
    let espacioDisponible = 515; // Portrait por defecto
    
    if (numColumnas > 6) {
      espacioDisponible = 755; // Landscape A4 con márgenes 40
      fontSize = hasLongText ? 6 : 8; // Reducir más si hay texto largo
    } else if (numColumnas > 10) {
      fontSize = 7;
    }
    
    // Calcular ancho óptimo de columna "Concepto"
    const calcularAnchoConcepto = (): number => {
      if (!tabla.filas || tabla.filas.length === 0) return 80;
      
      const maxLength = Math.max(...tabla.filas.map(f => f.nombre.length));
      const puntosPerChar = fontSize * 0.6;
      const anchoEstimado = Math.ceil(maxLength * puntosPerChar);
      
      return Math.min(Math.max(anchoEstimado, 60), 150);
    };
    
    const ANCHO_CONCEPTO = calcularAnchoConcepto();

    // Headers de la tabla
    const headers = [
      { text: 'Concepto', style: 'tableHeader', fontSize: fontSize },
      ...(tabla.columnas?.map(c => ({ 
        text: c.nombre, 
        style: 'tableHeader', 
        fontSize: fontSize 
      })) || [])
    ];

    // Construir filas de la tabla
    const body = tabla.filas?.map(fila => {
      const row: any[] = [
        { 
          text: wrapLongText(fila.nombre, 40), 
          style: 'tableCell', 
          bold: true, 
          fontSize: fontSize 
        }
      ];

      tabla.columnas?.forEach(col => {
        const resp = respuestasTablas.find((r: any) => 
          r.idTabla === tabla.id && 
          r.idFila === fila.id && 
          r.idColumna === col.id
        );
        
        const valor = resp?.valor || '-';
        const displayValue = formatValue(valor, col.tipoDato);

        row.push({ 
          text: displayValue, 
          style: 'tableCell', 
          fontSize: fontSize 
        });
      });

      return row;
    }) || [];

    // Calcular anchos de columnas
    const widths = this.calculateColumnWidths(
      tabla, 
      ANCHO_CONCEPTO, 
      espacioDisponible, 
      fontSize
    );

    return {
      table: {
        headerRows: 1,
        widths: widths,
        body: [headers, ...body],
        dontBreakRows: false
      },
      layout: 'lightHorizontalLines',
      margin: [0, 5, 0, 10]
    };
  },

  /**
   * Calcula los anchos óptimos para cada columna de la tabla
   * basándose en el tipo de dato y el espacio disponible
   */
  calculateColumnWidths(
    tabla: TablaResponseDTO, 
    anchoConcepto: number, 
    espacioDisponible: number, 
    fontSize: number
  ): any[] {
    const widths: any[] = [];
    const factorEscala = fontSize / 9;
    
    // Anchos fijos para tipos de datos específicos (escalados por fontSize)
    const ANCHO_ENTERO = Math.ceil(50 * factorEscala);
    const ANCHO_DECIMAL = Math.ceil(60 * factorEscala);
    const ANCHO_FECHA = Math.ceil(70 * factorEscala);
    const ANCHO_HORA = Math.ceil(60 * factorEscala);
    const ANCHO_BOOLEANO = Math.ceil(40 * factorEscala);
    
    // Primera columna (Concepto)
    widths.push(anchoConcepto);
    let espacioUsado = anchoConcepto;
    
    // Identificar columnas de texto que necesitan distribución dinámica
    const columnasTexto: number[] = [];
    
    tabla.columnas?.forEach((col, index) => {
      switch (col.tipoDato) {
        case TipoDatoCampo.ENTERO:
          widths.push(ANCHO_ENTERO);
          espacioUsado += ANCHO_ENTERO;
          break;
        case TipoDatoCampo.DECIMAL:
          widths.push(ANCHO_DECIMAL);
          espacioUsado += ANCHO_DECIMAL;
          break;
        case TipoDatoCampo.FECHA:
          widths.push(ANCHO_FECHA);
          espacioUsado += ANCHO_FECHA;
          break;
        case TipoDatoCampo.HORA:
          widths.push(ANCHO_HORA);
          espacioUsado += ANCHO_HORA;
          break;
        case TipoDatoCampo.BOOLEANO:
          widths.push(ANCHO_BOOLEANO);
          espacioUsado += ANCHO_BOOLEANO;
          break;
        default:
          // TipoDatoCampo.TEXTO - se calculará después
          columnasTexto.push(index + 1); // +1 porque la primera es "Concepto"
          widths.push(null); // Placeholder
      }
    });
    
    // Distribuir espacio restante entre columnas de texto
    const espacioRestante = espacioDisponible - espacioUsado;
    const numColumnasTexto = columnasTexto.length;
    
    if (numColumnasTexto > 0) {
      const anchoMinimo = fontSize === 7 ? 60 : (fontSize === 8 ? 70 : 80);
      const anchoPorColumnaTexto = Math.max(
        anchoMinimo, 
        Math.floor(espacioRestante / numColumnasTexto)
      );
      
      columnasTexto.forEach(colIndex => {
        widths[colIndex] = anchoPorColumnaTexto;
      });
    }

    return widths;
  }
};
