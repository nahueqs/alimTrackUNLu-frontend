import React from 'react';
import { Button, Tooltip } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

interface PrintButtonProps {
  className?: string;
}

export const PrintButton: React.FC<PrintButtonProps> = ({ className }) => {
  const handlePrint = () => {
    window.print();
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
