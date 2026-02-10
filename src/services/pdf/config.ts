export const PDF_CONFIG = {
  pageSize: 'A4' as const,
  margins: [25, 30, 25, 40] as [number, number, number, number], // Reducido: left, top, right, bottom
  fonts: {
    header: 16,        // Reducido de 18
    subheader: 12,     // Reducido de 14
    label: 9,          // Reducido de 10
    value: 9,          // Reducido de 10
    sectionTitle: 11,  // Reducido de 12
    tableHeader: 9,    // Reducido de 10
    tableCell: 8,      // Reducido de 9
    footer: 8,         // Para numeración
  },
  layout: {
    columnsThreshold: 6,
    maxCharsBeforeBreak: 25,      // Aumentado para menos wrapping
    fieldsPerRow: 3,
    maxColumnasPortrait: 5,       // Aumentado de 4
    maxColumnasLandscape: 10,     // Aumentado de 8
    giantTableRowThreshold: 6,    // Aumentado de 5 para ser más selectivo
    giantTableMinHeight: 400,     // Aumentado para ser más selectivo
    avgTextLengthThreshold: 60,   // Aumentado de 50
    minPageSpacePercent: 0.20,    // Reducido de 0.30 (más agresivo)
    conceptColumnMinWidth: 30,    // Ultra-comprimido
    conceptColumnMaxWidth: 70,
    // NUEVO: Espaciado reducido
    sectionSpacing: 8,            // Espacio entre secciones
    groupSpacing: 5,              // Espacio entre grupos
    fieldSpacing: 3,              // Espacio entre campos
    tableSpacing: 5,              // Espacio antes de tabla
  },
  charsPerLine: {
    small: 25,
    medium: 35,
    large: 50,
  },
  fontSize: {
    small: 7,
    medium: 8,
    normal: 8,     // Reducido de 9
  },
  table: {
    columnWidths: {
      entero: 40,      // Reducido de 45
      decimal: 50,     // Reducido de 55
      fecha: 60,       // Reducido de 65
      hora: 50,        // Reducido de 55
      booleano: 30,    // Reducido de 35
    },
    pageWidths: {
      portrait: 545,   // Aumentado por márgenes reducidos
      landscape: 792,  // A4 landscape width - margins
    },
    pageHeight: {
      portrait: 812,   // Aumentado por márgenes reducidos
      landscape: 545,  // A4 landscape height - margins
    },
    headerHeight: 18,
    rowHeightBase: 14,           // Reducido de 16
    rowHeightWithWrapping: 25,   // Reducido de 30
    paddingPerRow: 4,            // Reducido de 6
  },
} as const;
