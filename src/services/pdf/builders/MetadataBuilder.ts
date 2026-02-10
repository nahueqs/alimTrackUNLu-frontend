import type { RespuestasProduccionProtectedDTO, RespuestasProduccionPublicDTO } from '@/types/production';
import dayjs from 'dayjs';
import { PDF_CONFIG } from '../config';

type RespuestasProduccion = RespuestasProduccionPublicDTO | RespuestasProduccionProtectedDTO;

export class MetadataBuilder {
  constructor(private config: typeof PDF_CONFIG) {}

  build(respuestas: RespuestasProduccion) {
    const { produccion, progreso } = respuestas;
    const isProtected = 'emailCreador' in produccion;

    const data: any[] = [
      [
        { text: 'Código:', style: 'label' }, 
        { text: produccion.codigoProduccion, style: 'value' },
        { text: 'Lote:', style: 'label' }, 
        { text: produccion.lote || '-', style: 'value' },
        { text: 'Estado:', style: 'label' }, 
        { text: produccion.estado, style: 'value' }
      ],
      [
        { text: 'Inicio:', style: 'label' }, 
        { text: dayjs(produccion.fechaInicio).format('DD/MM/YYYY HH:mm'), style: 'value' },
        { text: 'Fin:', style: 'label' }, 
        { text: produccion.fechaFin ? dayjs(produccion.fechaFin).format('DD/MM/YYYY HH:mm') : '-', style: 'value' },
        { text: 'Progreso:', style: 'label' }, 
        { text: `${Math.round(progreso.porcentajeCompletado)}%`, style: 'value' }
      ]
    ];

    if (isProtected && (produccion as any).encargado) {
        data.push([
            { text: 'Encargado:', style: 'label' }, 
            { text: (produccion as any).encargado, style: 'value', colSpan: 5 }, 
            {}, {}, {}, {}
        ]);
    }

    return {
      table: {
        widths: ['auto', '*', 'auto', '*', 'auto', '*'],
        body: data
      },
      layout: 'noBorders',
      margin: [0, 5, 0, 8] // Reducido
    };
  }
}
