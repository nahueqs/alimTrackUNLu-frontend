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
// La estructura de pdfmake/vfs_fonts puede variar según la versión y el bundler
// Intentamos asignar de forma segura
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
 * Inserta oportunidades de wrapping en texto continuo sin espacios
 * Agrega zero-width space (U+200B) cada N caracteres para permitir line breaks
 */
function insertSoftBreaks(text: string, maxCharsBeforeBreak: number = 20): string {
  if (!text || text.length <= maxCharsBeforeBreak) return text;
  
  // Si ya tiene espacios frecuentes, no es necesario
  const avgWordLength = text.split(/\s+/).reduce((acc, word) => acc + word.length, 0) / Math.max(1, text.split(/\s+/).length);
  if (avgWordLength < maxCharsBeforeBreak) return text;
  
  // Insertar zero-width space cada maxCharsBeforeBreak caracteres
  const ZERO_WIDTH_SPACE = '\u200B';
  let result = '';
  let charCount = 0;
  
  for (let i = 0; i < text.length; i++) {
    result += text[i];
    charCount++;
    
    // Insertar break point si:
    // 1. Hemos alcanzado el límite de caracteres
    // 2. No es el último carácter
    // 3. El siguiente carácter no es un espacio (para evitar duplicados)
    if (charCount >= maxCharsBeforeBreak && i < text.length - 1 && text[i + 1] !== ' ') {
      result += ZERO_WIDTH_SPACE;
      charCount = 0;
    }
    
    // Resetear contador en espacios naturales
    if (text[i] === ' ') {
      charCount = 0;
    }
  }
  
  return result;
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
        { text: '', margin: [0, 10] }, // Espacio
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
        font: 'Roboto' // pdfmake usa Roboto por defecto
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
        { text: 'Código:', style: 'label' }, { text: produccion.codigoProduccion, style: 'value' },
        { text: 'Lote:', style: 'label' }, { text: produccion.lote || '-', style: 'value' },
        { text: 'Estado:', style: 'label' }, { text: produccion.estado, style: 'value' }
      ],
      [
        { text: 'Inicio:', style: 'label' }, { text: dayjs(produccion.fechaInicio).format('DD/MM/YYYY HH:mm'), style: 'value' },
        { text: 'Fin:', style: 'label' }, { text: produccion.fechaFin ? dayjs(produccion.fechaFin).format('DD/MM/YYYY HH:mm') : '-', style: 'value' },
        { text: 'Progreso:', style: 'label' }, { text: `${Math.round(progreso.porcentajeCompletado)}%`, style: 'value' }
      ]
    ];

    if (isProtected && (produccion as any).encargado) {
        data.push([
            { text: 'Encargado:', style: 'label' }, { text: (produccion as any).encargado, style: 'value', colSpan: 5 }, {}, {}, {}, {}
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
    const respuestasCamposMap = respuestas.respuestasCampos.reduce((acc, r) => ({ ...acc, [r.idCampo]: r.valor }), {} as Record<number, string>);

    estructura.estructura.forEach((seccion: SeccionResponseDTO, index: number) => {
      // Título de Sección
      content.push({ 
        text: `${index + 1}. ${seccion.titulo}`, 
        style: 'sectionTitle',
        margin: [0, 15, 0, 5]
      });

      // Campos Simples (Layout de 2 columnas)
      if (seccion.camposSimples.length > 0) {
        content.push(this.buildFieldsGrid(seccion.camposSimples, respuestasCamposMap));
      }

      // Grupos de Campos
      seccion.gruposCampos.forEach(grupo => {
        content.push({ text: grupo.subtitulo, fontSize: 11, bold: true, margin: [0, 5, 0, 2] });
        content.push(this.buildFieldsGrid(grupo.campos, respuestasCamposMap));
      });

      // Tablas
      seccion.tablas.forEach(tabla => {
        content.push({ text: tabla.nombre, fontSize: 11, bold: true, margin: [0, 10, 0, 2] });
        content.push(this.buildTable(tabla, respuestas.respuestasTablas));
      });

      // Línea separadora
      content.push({ canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: '#ccc' }] });
    });

    return content;
  },

  buildFieldsGrid(campos: CampoSimpleResponseDTO[], respuestasMap: Record<number, string>) {
    const columns: any[] = [];
    let currentRow: any[] = [];

    campos.forEach((campo, i) => {
      const valor = respuestasMap[campo.id] || '-';
      
      // Formatear valor si es booleano, decimal, entero, fecha u hora
      let displayValue = valor;
      if (campo.tipoDato === TipoDatoCampo.BOOLEANO) {
          displayValue = valor === 'true' ? 'Sí' : (valor === 'false' ? 'No' : '-');
      } else if (campo.tipoDato === TipoDatoCampo.DECIMAL && valor !== '-') {
          const num = parseFloat(valor);
          if (!isNaN(num)) {
              displayValue = num.toFixed(2);
          }
      } else if (campo.tipoDato === TipoDatoCampo.ENTERO && valor !== '-') {
          const num = parseFloat(valor);
          if (!isNaN(num)) {
              displayValue = Math.floor(num).toString();
          }
      } else if (campo.tipoDato === TipoDatoCampo.FECHA && valor !== '-') {
          displayValue = dayjs(valor).format('DD/MM/YYYY');
      } else if (campo.tipoDato === TipoDatoCampo.HORA && valor !== '-') {
          // Si el valor es una fecha completa, extraemos la hora, si es solo hora, la dejamos
          // Asumimos que si viene de un input time puede ser HH:mm o HH:mm:ss
          // Si viene como ISO string, dayjs lo parsea
          if (valor.includes('T') || valor.includes('-')) {
             displayValue = dayjs(valor).format('HH:mm:ss');
          } else {
             // Si ya es hora, intentamos asegurar formato HH:mm:ss si es posible, o dejarlo como está
             // A veces los inputs time devuelven HH:mm
             displayValue = valor; 
          }
      } else if (campo.tipoDato === TipoDatoCampo.TEXTO && valor !== '-') {
          // Insertar soft breaks en texto para permitir wrapping
          displayValue = insertSoftBreaks(valor);
      }

      currentRow.push({
        stack: [
          { text: campo.nombre, style: 'label', fontSize: 9 },
          { text: displayValue, style: 'value', fontSize: 10 }
        ],
        margin: [0, 0, 10, 5]
      });

      // Cada 3 campos, nueva fila (o si es el último)
      if (currentRow.length === 3 || i === campos.length - 1) {
        columns.push({ columns: currentRow, columnGap: 10 });
        currentRow = [];
      }
    });

    return { stack: columns, margin: [0, 5, 0, 5] };
  },

  buildTable(tabla: TablaResponseDTO, respuestasTablas: any[]) {
    const numColumnas = (tabla.columnas?.length || 0) + 1; // +1 por columna "Concepto"
    
    // Determinar espacio disponible y tamaño de fuente según número de columnas
    // La orientación ya fue determinada a nivel documento en generateProductionPdf
    let fontSize = 9;
    let espacioDisponible = 515; // Portrait por defecto
    
    // Si hay muchas columnas, asumimos que el documento está en landscape
    if (numColumnas > 6) {
        espacioDisponible = 755; // Landscape A4 con márgenes 40
        if (numColumnas > 10) {
            fontSize = 7; // Reducir fuente para muchas columnas
        } else {
            fontSize = 8;
        }
    }
    
    // Calcular ancho óptimo de columna "Concepto" basado en el texto más largo
    const calcularAnchoConcepto = (): number => {
        if (!tabla.filas || tabla.filas.length === 0) return 80;
        
        // Encontrar el nombre de fila más largo
        const maxLength = Math.max(...tabla.filas.map(f => f.nombre.length));
        
        // Estimación: ~5.5 puntos por carácter para fontSize 9
        // Ajustar según el fontSize actual
        const puntosPerChar = fontSize * 0.6;
        const anchoEstimado = Math.ceil(maxLength * puntosPerChar);
        
        // Limitar entre 60 y 150 puntos
        return Math.min(Math.max(anchoEstimado, 60), 150);
    };
    
    const ANCHO_CONCEPTO = calcularAnchoConcepto();

    const headers = [
      { text: 'Concepto', style: 'tableHeader', fontSize: fontSize },
      ...(tabla.columnas?.map(c => ({ text: c.nombre, style: 'tableHeader', fontSize: fontSize })) || [])
    ];

    const body = tabla.filas?.map(fila => {
      const row: any[] = [
        { text: insertSoftBreaks(fila.nombre), style: 'tableCell', bold: true, fontSize: fontSize }
      ];

      tabla.columnas?.forEach(col => {
        const resp = respuestasTablas.find((r: any) => r.idTabla === tabla.id && r.idFila === fila.id && r.idColumna === col.id);
        let val = resp?.valor || '-';

        if (val !== '-') {
            if (col.tipoDato === TipoDatoCampo.DECIMAL) {
                const num = parseFloat(val);
                if (!isNaN(num)) {
                    val = num.toFixed(2);
                }
            } else if (col.tipoDato === TipoDatoCampo.ENTERO) {
                const num = parseFloat(val);
                if (!isNaN(num)) {
                    val = Math.floor(num).toString();
                }
            } else if (col.tipoDato === TipoDatoCampo.FECHA) {
                val = dayjs(val).format('DD/MM/YYYY');
            } else if (col.tipoDato === TipoDatoCampo.HORA) {
                if (val.includes('T') || val.includes('-')) {
                    val = dayjs(val).format('HH:mm:ss');
                }
            } else if (col.tipoDato === TipoDatoCampo.TEXTO) {
                // Insertar soft breaks en texto para permitir wrapping
                val = insertSoftBreaks(val);
            }
        }

        row.push({ text: val, style: 'tableCell', fontSize: fontSize });
      });

      return row;
    }) || [];

    // Calcular anchos de columna basados en el tipo de dato
    const widths: any[] = [];
    
    // Anchos fijos para tipos de datos específicos (en puntos)
    // Ajustar según fontSize
    const factorEscala = fontSize / 9;
    const ANCHO_ENTERO = Math.ceil(50 * factorEscala);
    const ANCHO_DECIMAL = Math.ceil(60 * factorEscala);
    const ANCHO_FECHA = Math.ceil(70 * factorEscala);
    const ANCHO_HORA = Math.ceil(60 * factorEscala);
    const ANCHO_BOOLEANO = Math.ceil(40 * factorEscala);
    
    // Primera columna (Concepto) - ancho calculado dinámicamente
    widths.push(ANCHO_CONCEPTO);
    let espacioUsado = ANCHO_CONCEPTO;
    
    // Calcular espacio usado por columnas de ancho fijo
    const columnasTexto: number[] = [];
    tabla.columnas?.forEach((col, index) => {
        if (col.tipoDato === TipoDatoCampo.ENTERO) {
            widths.push(ANCHO_ENTERO);
            espacioUsado += ANCHO_ENTERO;
        } else if (col.tipoDato === TipoDatoCampo.DECIMAL) {
            widths.push(ANCHO_DECIMAL);
            espacioUsado += ANCHO_DECIMAL;
        } else if (col.tipoDato === TipoDatoCampo.FECHA) {
            widths.push(ANCHO_FECHA);
            espacioUsado += ANCHO_FECHA;
        } else if (col.tipoDato === TipoDatoCampo.HORA) {
            widths.push(ANCHO_HORA);
            espacioUsado += ANCHO_HORA;
        } else if (col.tipoDato === TipoDatoCampo.BOOLEANO) {
            widths.push(ANCHO_BOOLEANO);
            espacioUsado += ANCHO_BOOLEANO;
        } else {
            // TipoDatoCampo.TEXTO - calcular después
            columnasTexto.push(index + 1); // +1 porque la primera es "Concepto"
            widths.push(null); // Placeholder
        }
    });
    
    // Distribuir espacio restante entre columnas de texto
    const espacioRestante = espacioDisponible - espacioUsado;
    const numColumnasTexto = columnasTexto.length;
    
    if (numColumnasTexto > 0) {
        // Distribuir equitativamente entre columnas de texto
        // Ajustar ancho mínimo según fontSize
        const anchoMinimo = fontSize === 7 ? 60 : (fontSize === 8 ? 70 : 80);
        const anchoPorColumnaTexto = Math.max(anchoMinimo, Math.floor(espacioRestante / numColumnasTexto));
        columnasTexto.forEach(colIndex => {
            widths[colIndex] = anchoPorColumnaTexto;
        });
    }

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
  }
};
