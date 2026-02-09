import type { EstructuraProduccionDTO } from '@/types/production';
import dayjs from 'dayjs';
import { PDF_CONFIG } from '../config';

export class HeaderBuilder {
  constructor(private config: typeof PDF_CONFIG) {}

  build(estructura: EstructuraProduccionDTO) {
    return {
      columns: [
        this.buildTitle(estructura),
        this.buildTimestamp(),
      ],
    };
  }

  private buildTitle(estructura: EstructuraProduccionDTO) {
    return {
      width: '*',
      text: [
        { text: 'Reporte de Producción\n', style: 'header' },
        { 
          text: `Receta: ${estructura.metadata.nombre} (${estructura.metadata.codigoVersionReceta})`, 
          fontSize: this.config.fonts.label 
        },
      ],
    };
  }

  private buildTimestamp() {
    return {
      width: 'auto',
      text: `Generado: ${dayjs().format('DD/MM/YYYY HH:mm')}`,
      fontSize: 8,
      alignment: 'right' as const,
    };
  }
}
