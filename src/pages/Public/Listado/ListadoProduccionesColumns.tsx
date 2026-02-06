import type { ColumnsType } from 'antd/es/table';
import { Button, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import type { ProduccionPublicMetadataDTO } from '@/types/production';
import {
  PRODUCTION_STATE_COLORS,
  PRODUCTION_STATE_LABELS,
  ProductionState,
} from '@/constants/ProductionStates';

interface PublicProductionColumnsProps {
  onView: (record: ProduccionPublicMetadataDTO) => void;
  isMobile: boolean;
}

export const getPublicProductionColumns = ({
  onView,
  isMobile,
}: PublicProductionColumnsProps): ColumnsType<ProduccionPublicMetadataDTO> => {
  return [
    {
      title: 'Código',
      dataIndex: 'codigoProduccion',
      key: 'codigoProduccion',
      sorter: (a, b) => a.codigoProduccion.localeCompare(b.codigoProduccion),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Versión Receta',
      dataIndex: 'codigoVersion',
      key: 'codigoVersion',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Inicio',
      dataIndex: 'fechaInicio',
      key: 'fechaInicio',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
      responsive: ['sm', 'md', 'lg', 'xl'], // Oculto en móvil muy pequeño
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: ProductionState) => {
        const color = PRODUCTION_STATE_COLORS[estado] || 'default';
        const text = PRODUCTION_STATE_LABELS[estado] || estado;
        return <Tag color={color}>{text}</Tag>;
      },
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Lote',
      dataIndex: 'lote',
      key: 'lote',
      render: (text) => text || '-',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Encargado',
      dataIndex: 'encargado',
      key: 'encargado',
      render: (text) => text || '-',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: isMobile ? 50 : 100,
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Ver detalle">
            <Button 
              type="text" // Botón tipo texto para que sea más limpio
              icon={<EyeOutlined style={{ fontSize: '18px', color: '#1890ff' }} />} 
              onClick={() => onView(record)} 
            />
          </Tooltip>
        </div>
      ),
    },
  ];
};
