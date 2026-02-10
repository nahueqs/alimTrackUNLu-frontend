export const PDF_CONFIG = {
  pageSize: 'A4' as const,
  margins: [25, 30, 25, 40] as [number, number, number, number],
  fonts: {
    header: 16,
    subheader: 12,
    label: 9,
    value: 9,
    sectionTitle: 11,
    tableHeader: 9,
    tableCell: 8,
    footer: 8,
  },
  layout: {
    columnsThreshold: 6,
    maxCharsBeforeBreak: 25,
    fieldsPerRow: 3,
    maxColumnasPortrait: 6,
    maxColumnasLandscape: 10,
    giantTableRowThreshold: 6,
    giantTableMinHeight: 400,
    avgTextLengthThreshold: 60,
    minPageSpacePercent: 0.20,
    
    // MEJORADO: Rangos más flexibles para concepto
    conceptColumnMinWidth: 30,
    conceptColumnMaxWidth: 70,
    conceptColumnMaxExtended: 120, // Nuevo límite para textos largos
    
    sectionSpacing: 8,
    groupSpacing: 5,
    fieldSpacing: 3,
    tableSpacing: 5,
    shortTableRows: 3,
  },
  charsPerLine: {
    small: 25,
    medium: 35,
    large: 50,
    // Estimación para campos simples
    fieldValue: 45, 
  },
  fontSize: {
    small: 7,
    medium: 8,
    normal: 8,
  },
  table: {
    columnWidths: {
      entero: 40,
      decimal: 50,
      fecha: 60,
      hora: 50,
      booleano: 30,
    },
    pageWidths: {
      portrait: 545,
      landscape: 792,
    },
    pageHeight: {
      portrait: 812,
      landscape: 545,
    },
    headerHeight: 18,
    rowHeightBase: 14,
    rowHeightWithWrapping: 25,
    paddingPerRow: 4,
    // Altura estimada por línea de texto en campos
    lineHeight: 12, 
  },
} as const;
