import type { ColumnsType } from 'antd/es/table';
import type { ProduccionProtectedResponseDTO } from '@/types/production';
import dayjs from 'dayjs';
import { CustomTableRowActions } from '@/components/ui/CustomTable/CustomTableRowActions.tsx';
import { Tag } from 'antd';
import {
  PRODUCTION_STATE_COLORS,
  PRODUCTION_STATE_LABELS,
  ProductionState,
} from '@/constants/ProductionStates';

interface ProductionsColumnsProps {
  onView?: (record: ProduccionProtectedResponseDTO) => void;
  onEdit?: (record: ProduccionProtectedResponseDTO) => void;
  onDelete?: (id: string) => void;
  isMobile: boolean;
}

export const getActiveProductionColumns = ({
  onView,
  onEdit,
  onDelete,
  isMobile,
}: ProductionsColumnsProps): ColumnsType<ProduccionProtectedResponseDTO> => {
  return [
    {
      title: 'Código Producción',
      dataIndex: 'codigoProduccion',
      key: 'codigoProduccion',
      sorter: (a: ProduccionProtectedResponseDTO, b: ProduccionProtectedResponseDTO) =>
        a.codigoProduccion.localeCompare(b.codigoProduccion),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Lote',
      dataIndex: 'lote',
      key: 'lote',
      sorter: (a: ProduccionProtectedResponseDTO, b: ProduccionProtectedResponseDTO) =>
        (a.lote || '').localeCompare(b.lote || ''),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Versión Receta',
      dataIndex: 'codigoVersion',
      key: 'codigoVersion',
      sorter: (a: ProduccionProtectedResponseDTO, b: ProduccionProtectedResponseDTO) =>
        a.codigoVersion.localeCompare(b.codigoVersion),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Encargado',
      dataIndex: 'encargado',
      key: 'encargado',
      sorter: (a: ProduccionProtectedResponseDTO, b: ProduccionProtectedResponseDTO) =>
        (a.encargado || '').localeCompare(b.encargado || ''),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Fecha Inicio',
      dataIndex: 'fechaInicio',
      key: 'fechaInicio',
      sorter: (a: ProduccionProtectedResponseDTO, b: ProduccionProtectedResponseDTO) =>
        new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime(),
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      sorter: (a: ProduccionProtectedResponseDTO, b: ProduccionProtectedResponseDTO) =>
        a.estado.localeCompare(b.estado),
      render: (estado: ProductionState) => {
        const color = PRODUCTION_STATE_COLORS[estado] || 'default';
        const text = PRODUCTION_STATE_LABELS[estado] || estado;
        return <Tag color={color}>{text}</Tag>;
      },
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: <span className="actions-title-text">Acciones</span>,
      key: 'actions',
      fixed: 'right',
      width: isMobile ? 50 : 150,
      className: 'actions-column',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (_: unknown, record: ProduccionProtectedResponseDTO) => (
        <CustomTableRowActions<ProduccionProtectedResponseDTO>
          record={record}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          getRecordId={(r) => r.codigoProduccion}
          isMobile={isMobile}
        />
      ),
    },
  ];
};
