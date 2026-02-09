export function initializePdfFonts(pdfMake: any, pdfFonts: any) {
  if (pdfFonts?.pdfMake?.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  } else if (pdfFonts?.vfs) {
    pdfMake.vfs = pdfFonts.vfs;
  } else {
    console.warn('No se pudieron cargar las fuentes de pdfmake.');
  }
}
