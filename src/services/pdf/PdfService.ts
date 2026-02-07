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

export const pdfService = {
  generateProductionPdf(estructura: EstructuraProduccionDTO, respuestas: RespuestasProduccion) {
    const docDefinition: any = {
      pageSize: 'A4',
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
      
      // Formatear valor si es booleano, decimal, fecha u hora
      let displayValue = valor;
      if (campo.tipoDato === TipoDatoCampo.BOOLEANO) {
          displayValue = valor === 'true' ? 'Sí' : (valor === 'false' ? 'No' : '-');
      } else if (campo.tipoDato === TipoDatoCampo.DECIMAL && valor !== '-') {
          const num = parseFloat(valor);
          if (!isNaN(num)) {
              displayValue = num.toFixed(2);
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
    const headers = [
      { text: 'Concepto', style: 'tableHeader' },
      ...(tabla.columnas?.map(c => ({ text: c.nombre, style: 'tableHeader' })) || [])
    ];

    const body = tabla.filas?.map(fila => {
      const row: any[] = [
        { text: fila.nombre, style: 'tableCell', bold: true }
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
            } else if (col.tipoDato === TipoDatoCampo.FECHA) {
                val = dayjs(val).format('DD/MM/YYYY');
            } else if (col.tipoDato === TipoDatoCampo.HORA) {
                if (val.includes('T') || val.includes('-')) {
                    val = dayjs(val).format('HH:mm:ss');
                }
            }
        }

        row.push({ text: val, style: 'tableCell' });
      });

      return row;
    }) || [];

    return {
      table: {
        headerRows: 1,
        widths: ['auto', ...Array(headers.length - 1).fill('*')], // Primera col auto, resto expandidas
        body: [headers, ...body]
      },
      layout: 'lightHorizontalLines', // Estilo limpio
      margin: [0, 5, 0, 10]
    };
  }
};
