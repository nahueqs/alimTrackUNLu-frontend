import type { ColumnsType } from 'antd/es/table';
import { CustomTableRowActions } from '@/components/ui/CustomTable/CustomTableRowActions.tsx';
import type { RecetaMetadataResponseDTO } from '@/types/production/RecetaPadreDTOs';
import { formatDate } from '@/hooks/useFormatDate.ts';

interface GetColumnsProps {
  onDelete?: (id: string) => void;
  isMobile: boolean;
}

export const getRecetasPadreColumns = ({
  onDelete,
  isMobile,
}: GetColumnsProps): ColumnsType<RecetaMetadataResponseDTO> => {
  return [
    {
      title: 'Código Receta',
      dataIndex: 'codigoReceta',
      key: 'codigoReceta',
      sorter: (a, b) => a.codigoReceta.localeCompare(b.codigoReceta),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      render: (text: string | undefined) => text || '-',
      responsive: ['sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Creador',
      dataIndex: 'emailCreador',
      key: 'emailCreador',
      responsive: ['md', 'lg', 'xl'],
    },
    {
      title: 'Fecha Creación',
      dataIndex: 'fechaCreacion',
      key: 'fechaCreacion',
      render: (date: string | undefined) => formatDate(date),
      responsive: ['lg', 'xl'],
    },
    {
      title: <span className="actions-title-text">Acciones</span>,
      key: 'actions',
      fixed: 'right',
      width: isMobile ? 50 : 100,
      className: 'actions-column',
      render: (_, record) => (
        <CustomTableRowActions<RecetaMetadataResponseDTO>
          record={record}
          // Por ahora no hay vista de detalle de receta padre, solo listado de versiones
          // viewPath={(r) => `/recetas/${r.codigoReceta}/versiones`} 
          onDelete={onDelete}
          getRecordId={(r) => r.codigoReceta}
          isMobile={isMobile}
        />
      ),
    },
  ];
};
