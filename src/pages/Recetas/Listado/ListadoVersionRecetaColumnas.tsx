import type { ColumnsType } from 'antd/es/table';
import { CustomTableRowActions } from '@/components/ui/CustomTable/CustomTableRowActions.tsx';
import type { VersionRecetaMetadataResponseDTO } from '@/types/production'; // Changed import path and type
import { formatDate } from '@/hooks/useFormatDate.ts';

interface GetColumnsProps {
  onDelete?: (id: string) => void;
  isMobile: boolean; // Add isMobile prop
}

export const getColumns = ({
  onDelete,
  isMobile, // Destructure isMobile
}: GetColumnsProps): ColumnsType<VersionRecetaMetadataResponseDTO> => {
  // Changed type
  return [
    {
      title: 'Código Receta Padre',
      dataIndex: 'codigoRecetaPadre',
      key: 'codigoRecetaPadre',
      render: (text: string | undefined) => text || '-',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Código Versión',
      dataIndex: 'codigoVersionReceta',
      key: 'codigoVersionReceta',
      render: (text: string | undefined) => text || '-',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Nombre Receta',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text: string | undefined) => text || '-',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      render: (text: string | undefined) => text || '-',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    // Removed 'Creado por' column as it's no longer in VersionRecetaMetadataResponseDTO
    {
      title: 'Fecha de Creación',
      dataIndex: 'fechaCreacion',
      key: 'fechaCreacion',
      render: (date: string | undefined) => formatDate(date),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: <span className="actions-title-text">Acciones</span>,
      key: 'actions',
      fixed: 'right',
      width: isMobile ? 50 : 150, // Dynamically set width
      className: 'actions-column',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'], // Always present
      render: (
        _: unknown,
        record: VersionRecetaMetadataResponseDTO // Changed type
      ) => (
        <CustomTableRowActions<VersionRecetaMetadataResponseDTO> // Changed type
          record={record}
          viewPath={(r) => `/recetas/ver/${r.codigoVersionReceta}`}
          editPath={(r) => `/recetas/versiones/editar/${r.codigoVersionReceta}`}
          onDelete={onDelete}
          getRecordId={(r) => r.codigoVersionReceta}
          isMobile={isMobile} // Pass isMobile prop
        />
      ),
    },
  ];
};
