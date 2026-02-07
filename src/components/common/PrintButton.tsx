import React from 'react';
import { Button, Tooltip } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { pdfService } from '@/services/pdf/PdfService';
import type { EstructuraProduccionDTO, RespuestasProduccionProtectedDTO, RespuestasProduccionPublicDTO } from '@/types/production';

interface PrintButtonProps {
  className?: string;
  estructura?: EstructuraProduccionDTO | null;
  respuestas?: RespuestasProduccionPublicDTO | RespuestasProduccionProtectedDTO | null;
}

export const PrintButton: React.FC<PrintButtonProps> = ({ className, estructura, respuestas }) => {
  const handlePrint = () => {
    if (estructura && respuestas) {
      pdfService.generateProductionPdf(estructura, respuestas);
    } else {
      // Fallback a impresión nativa si no hay datos (ej. listados)
      window.print();
    }
  };

  return (
    <Tooltip title="Exportar a PDF / Imprimir">
      <Button 
        icon={<PrinterOutlined />} 
        onClick={handlePrint}
        className={className}
        aria-label="Imprimir detalle de producción"
      >
        Imprimir / PDF
      </Button>
    </Tooltip>
  );
};
