export const PDF_CONFIG = {
  pageSize: 'A4' as const,
  margins: [40, 40, 40, 40] as [number, number, number, number],
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
  },
  table: {
    columnWidths: {
      entero: 50,
      decimal: 60,
      fecha: 70,
      hora: 60,
      booleano: 40,
    },
    pageWidths: {
      portrait: 515,
      landscape: 755,
    },
  },
} as const;
