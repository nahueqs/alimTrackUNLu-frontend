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
    // NUEVO: Configuración para gestión de espacio
    giantTableThreshold: 5, // Más de 5 filas = tabla gigante
    minPageSpacePercent: 0.30, // 30% mínimo de espacio libre
    conceptColumnMinWidth: 40, // Ancho mínimo comprimido para "Concepto"
    conceptColumnMaxWidth: 80, // Ancho máximo para "Concepto"
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
    // NUEVO: Alturas aproximadas para cálculo de espacio
    headerHeight: 20,
    rowHeight: 18,
    pageHeight: {
      portrait: 800, // Altura útil aproximada en portrait (A4 - margins)
      landscape: 535, // Altura útil aproximada en landscape (A4 - margins)
    },
  },
} as const;
