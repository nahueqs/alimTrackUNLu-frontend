import type { MenuProps } from 'antd';
import { Button, Dropdown, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined } from '@ant-design/icons';
import './CustomTableRowActions.css';

interface ResponsiveTableActionsProps<T> {
  record: T;
  onView?: (record: T) => void;
  onEdit?: (record: T) => void;
  onDelete?: (id: string) => void;
  getRecordId: (record: T) => string;
  isMobile?: boolean;
  forceMenu?: boolean; // Nueva prop para forzar el menú de 3 puntos si se desea
}

export const CustomTableRowActions = <T extends object>({
  record,
  onView,
  onEdit,
  onDelete,
  getRecordId,
  isMobile,
  forceMenu = false,
}: ResponsiveTableActionsProps<T>) => {
  const recordId = getRecordId(record);

  // Definimos las acciones posibles con su metadata
  const allActions = [
    {
      key: 'view',
      label: 'Ver',
      icon: <EyeOutlined />,
      onClick: () => onView?.(record),
      visible: !!onView,
      danger: false,
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: <EditOutlined />,
      onClick: () => onEdit?.(record),
      visible: !!onEdit,
      danger: false,
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: <DeleteOutlined />,
      onClick: () => onDelete?.(recordId),
      visible: !!onDelete,
      danger: true,
    },
  ];

  // Filtramos solo las acciones activas
  const activeActions = allActions.filter((action) => action.visible);

  // Si no hay acciones, no renderizamos nada
  if (activeActions.length === 0) return null;

  // --- LÓGICA DE RENDERIZADO ---

  // 1. Renderizado para Escritorio (siempre botones individuales)
  if (!isMobile) {
    return (
      <div className="responsive-table-actions__desktop">
        {activeActions.map((action) => (
          <Tooltip key={action.key} title={action.label}>
            <Button
              icon={action.icon}
              onClick={action.onClick}
              danger={action.danger}
            />
          </Tooltip>
        ))}
      </div>
    );
  }

  // 2. Renderizado para Móvil

  // Caso A: Solo una acción y no se fuerza el menú -> Botón flotante directo
  if (activeActions.length === 1 && !forceMenu) {
    const action = activeActions[0];
    return (
      <div className="responsive-table-actions__mobile">
        <Button
          icon={action.icon}
          onClick={action.onClick}
          danger={action.danger}
          type="default" // Mantiene el estilo blanco/elevado definido en CSS
          aria-label={action.label}
        />
      </div>
    );
  }

  // Caso B: Múltiples acciones o menú forzado -> Dropdown (3 puntos)
  const menuItems: MenuProps['items'] = activeActions.map((action) => ({
    key: action.key,
    label: action.label,
    icon: action.icon,
    danger: action.danger,
    onClick: action.onClick,
  }));

  return (
    <div className="responsive-table-actions__mobile">
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button icon={<EllipsisOutlined />} aria-label="Más acciones" />
      </Dropdown>
    </div>
  );
};
