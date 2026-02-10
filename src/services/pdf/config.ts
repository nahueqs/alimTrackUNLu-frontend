export const PDF_CONFIG = {
  pageSize: 'A4' as const,
  margins: [30, 40, 30, 40] as [number, number, number, number],
  fonts: {
    header: 18,
    subheader: 14,
    label: 10,
    value: 10,
    sectionTitle: 12,
    tableHeader: 10,
    tableCell: 9,
  },
  layout: {
    columnsThreshold: 6,
    maxCharsBeforeBreak: 20,
    fieldsPerRow: 3,
    maxColumnasPortrait: 4,
    maxColumnasLandscape: 8,
    // MEJORADO: Configuración más inteligente
    giantTableRowThreshold: 5,        // Mínimo de filas para considerar
    giantTableMinHeight: 350,         // Altura mínima en puntos para ser "gigante"
    avgTextLengthThreshold: 50,       // Longitud promedio de texto para pesar más
    minPageSpacePercent: 0.30,        // 30% mínimo de espacio libre
    conceptColumnMinWidth: 35,        // Ultra-comprimido
    conceptColumnMaxWidth: 75,        // Máximo reducido
  },
  charsPerLine: {
    small: 30,
    medium: 40,
    large: 60,
  },
  fontSize: {
    small: 7,
    medium: 8,
    normal: 9,
  },
  table: {
    columnWidths: {
      entero: 45,
      decimal: 55,
      fecha: 65,
      hora: 55,
      booleano: 35,
    },
    pageWidths: {
      portrait: 535,
      landscape: 755,
    },
    pageHeight: {
      portrait: 800,
      landscape: 535,
    },
    // NUEVO: Factores de altura más precisos
    headerHeight: 22,
    rowHeightBase: 16,
    rowHeightWithWrapping: 30,    // Para texto que envuelve
    paddingPerRow: 6,
  },
} as const;
