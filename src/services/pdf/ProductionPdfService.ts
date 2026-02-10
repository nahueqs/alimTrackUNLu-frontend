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
import { SpaceCalculator } from './calculators/SpaceCalculator';
import { ContentAnalyzer } from './calculators/ContentAnalyzer';

type RespuestasProduccion = RespuestasProduccionPublicDTO | RespuestasProduccionProtectedDTO;

export class ProductionPdfService {
  private headerBuilder: HeaderBuilder;
  private metadataBuilder: MetadataBuilder;
  private bodyBuilder: BodyBuilder;
  
  constructor() {
    initializePdfFonts(pdfMake, pdfFonts);
    
    const widthCalculator = new TableWidthCalculator(PDF_CONFIG);
    const contentAnalyzer = new ContentAnalyzer(PDF_CONFIG);
    const spaceCalculator = new SpaceCalculator(PDF_CONFIG, contentAnalyzer);
    
    this.headerBuilder = new HeaderBuilder(PDF_CONFIG);
    this.metadataBuilder = new MetadataBuilder(PDF_CONFIG);
    this.bodyBuilder = new BodyBuilder(PDF_CONFIG, widthCalculator, spaceCalculator);
  }

  generate(estructura: EstructuraProduccionDTO, respuestas: RespuestasProduccion) {
    // El documento base es portrait, las tablas se rotan individualmente
    const pageOrientation = 'portrait';
    
    const docDefinition: any = {
      pageSize: PDF_CONFIG.pageSize,
      pageOrientation: pageOrientation,
      pageMargins: PDF_CONFIG.margins,
      
      // NUEVO: Header y Footer con numeración
      header: (currentPage: number, pageCount: number) => {
        if (currentPage === 1) return null; // Sin header en primera página
        
        return {
          text: `${estructura.metadata.nombre} - ${estructura.metadata.codigoVersionReceta}`,
          alignment: 'center',
          fontSize: 8,
          margin: [0, 10, 0, 0],
          color: '#666'
        };
      },
      
      footer: (currentPage: number, pageCount: number) => {
        return {
          text: `Página ${currentPage} de ${pageCount}`,
          alignment: 'center',
          fontSize: PDF_CONFIG.fonts.footer,
          margin: [0, 10, 0, 0],
          color: '#666'
        };
      },
      
      content: [
        this.headerBuilder.build(estructura),
        this.metadataBuilder.build(respuestas),
        this.bodyBuilder.build(estructura, respuestas, pageOrientation),
      ],
      
      styles: this.getStyles(),
      defaultStyle: { font: 'Roboto' },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  private getStyles() {
    return {
      header: { 
        fontSize: PDF_CONFIG.fonts.header, 
        bold: true, 
        margin: [0, 0, 0, 5] 
      },
      subheader: { 
        fontSize: PDF_CONFIG.fonts.subheader, 
        bold: true, 
        margin: [0, 5, 0, 3] 
      },
      label: { 
        fontSize: PDF_CONFIG.fonts.label, 
        color: '#555' 
      },
      value: { 
        fontSize: PDF_CONFIG.fonts.value, 
        bold: true 
      },
      sectionTitle: { 
        fontSize: PDF_CONFIG.fonts.sectionTitle, 
        bold: true, 
        decoration: 'underline',
        decorationColor: '#333'
      },
      tableHeader: { 
        bold: true, 
        fontSize: PDF_CONFIG.fonts.tableHeader, 
        color: '#000', 
        fillColor: '#f5f5f5' 
      },
      tableCell: { 
        fontSize: PDF_CONFIG.fonts.tableCell 
      },
    };
  }
}

export const pdfService = new ProductionPdfService();
