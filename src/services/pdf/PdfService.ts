import { pdfService as newPdfService } from './ProductionPdfService';

// Re-exportar el nuevo servicio manteniendo la compatibilidad con el nombre anterior
export const pdfService = {
  generateProductionPdf: (estructura: any, respuestas: any) => {
    newPdfService.generate(estructura, respuestas);
  }
};
