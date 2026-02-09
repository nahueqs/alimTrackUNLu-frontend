import pdfMake from 'pdfmake/build/pdfmake';
// @ts-ignore
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { EstructuraProduccionDTO, RespuestasProduccionProtectedDTO, RespuestasProduccionPublicDTO } from '@/types/production';
import { PDF_CONFIG } from './config';
import { initializePdfFonts } from './fonts';
import { HeaderBuilder } from './builders/HeaderBuilder';
import { MetadataBuilder } from './builders/MetadataBuilder';
import { BodyBuilder } from './builders/BodyBuilder';
import { TableWidthCalculator } from './calculators/TableWidthCalculator';

type RespuestasProduccion = RespuestasProduccionPublicDTO | RespuestasProduccionProtectedDTO;

export class ProductionPdfService {
  private headerBuilder: HeaderBuilder;
  private metadataBuilder: MetadataBuilder;
  private bodyBuilder: BodyBuilder;
  
  constructor() {
    initializePdfFonts(pdfMake, pdfFonts);
    
    const widthCalculator = new TableWidthCalculator(PDF_CONFIG);
    
    this.headerBuilder = new HeaderBuilder(PDF_CONFIG);
    this.metadataBuilder = new MetadataBuilder(PDF_CONFIG);
    this.bodyBuilder = new BodyBuilder(PDF_CONFIG, widthCalculator);
  }

  generate(estructura: EstructuraProduccionDTO, respuestas: RespuestasProduccion) {
    const pageOrientation = this.determineOrientation(estructura);
    
    const docDefinition: any = {
      pageSize: PDF_CONFIG.pageSize,
      pageOrientation: pageOrientation,
      pageMargins: PDF_CONFIG.margins,
      content: [
        this.headerBuilder.build(estructura),
        this.metadataBuilder.build(respuestas),
        { text: '', margin: [0, 10] },
        this.bodyBuilder.build(estructura, respuestas, pageOrientation),
      ],
      styles: this.getStyles(),
      defaultStyle: { font: 'Roboto' },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  private determineOrientation(estructura: EstructuraProduccionDTO) {
    const hasWideTables = estructura.estructura.some(seccion => 
      seccion.tablas.some(tabla => 
        (tabla.columnas?.length || 0) + 1 > PDF_CONFIG.layout.maxColumnasPortrait
      )
    );
    
    return hasWideTables ? 'landscape' : 'portrait';
  }

  private getStyles() {
    return {
      header: { fontSize: PDF_CONFIG.fonts.header, bold: true, margin: [0, 0, 0, 10] },
      subheader: { fontSize: PDF_CONFIG.fonts.subheader, bold: true, margin: [0, 10, 0, 5] },
      label: { fontSize: PDF_CONFIG.fonts.label, color: '#444' },
      value: { fontSize: PDF_CONFIG.fonts.value, bold: true },
      sectionTitle: { fontSize: PDF_CONFIG.fonts.sectionTitle, bold: true, margin: [0, 15, 0, 5], decoration: 'underline' },
      tableHeader: { bold: true, fontSize: PDF_CONFIG.fonts.tableHeader, color: 'black', fillColor: '#eeeeee' },
      tableCell: { fontSize: PDF_CONFIG.fonts.tableCell },
    };
  }
}

export const pdfService = new ProductionPdfService();
