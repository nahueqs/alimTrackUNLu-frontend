import type { ColumnsType } from 'antd/es/table';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import type { ProduccionPublicMetadataDTO } from '@/types/production';
import {
  PRODUCTION_STATE_COLORS,
  PRODUCTION_STATE_LABELS,
  ProductionState,
} from '@/constants/ProductionStates';
import { CustomTableRowActions } from '@/components/ui/CustomTable/CustomTableRowActions.tsx';

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
      title: 'Inicio',
      dataIndex: 'fechaInicio',
      key: 'fechaInicio',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
      responsive: ['sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Fin',
      dataIndex: 'fechaFin',
      key: 'fechaFin',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
      responsive: ['sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Lote',
      dataIndex: 'lote',
      key: 'lote',
      render: (text) => text || '-',
      responsive: ['sm', 'md', 'lg', 'xl'],
    },
    {
      title: <span className="actions-title-text">Acciones</span>,
      key: 'actions',
      fixed: 'right',
      width: isMobile ? 50 : 100,
      className: 'actions-column',
      render: (_, record) => (
        <CustomTableRowActions<ProduccionPublicMetadataDTO>
          record={record}
          onView={onView}
          getRecordId={(r) => r.codigoProduccion}
          isMobile={isMobile}
        />
      ),
    },
  ];
};
