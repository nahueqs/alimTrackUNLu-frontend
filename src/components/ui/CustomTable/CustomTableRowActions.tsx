import type { MenuProps } from 'antd';
import { Button, Dropdown, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './CustomTableRowActions.css';

interface ResponsiveTableActionsProps<T> {
  record: T;
  viewPath?: (record: T) => string;
  editPath?: (record: T) => string;
  onDelete?: (id: string) => void;
  getRecordId: (record: T) => string;
  isMobile?: boolean;
  forceMenu?: boolean;
}

export const CustomTableRowActions = <T extends object>({
  record,
  viewPath,
  editPath,
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
      path: viewPath ? viewPath(record) : undefined,
      visible: !!viewPath,
      danger: false,
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: <EditOutlined />,
      path: editPath ? editPath(record) : undefined,
      visible: !!editPath,
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
        {activeActions.map((action) => {
          if (action.path) {
            return (
              <Tooltip key={action.key} title={action.label}>
                <Link to={action.path}>
                  <Button
                    icon={action.icon}
                    danger={action.danger}
                  />
                </Link>
              </Tooltip>
            );
          }
          return (
            <Tooltip key={action.key} title={action.label}>
              <Button
                icon={action.icon}
                onClick={action.onClick}
                danger={action.danger}
              />
            </Tooltip>
          );
        })}
      </div>
    );
  }

  // 2. Renderizado para Móvil

  // Caso A: Solo una acción y no se fuerza el menú -> Botón flotante directo
  if (activeActions.length === 1 && !forceMenu) {
    const action = activeActions[0];
    if (action.path) {
      return (
        <div className="responsive-table-actions__mobile">
          <Link to={action.path}>
            <Button
              icon={action.icon}
              danger={action.danger}
              type="default"
              aria-label={action.label}
            />
          </Link>
        </div>
      );
    }
    return (
      <div className="responsive-table-actions__mobile">
        <Button
          icon={action.icon}
          onClick={action.onClick}
          danger={action.danger}
          type="default"
          aria-label={action.label}
        />
      </div>
    );
  }

  // Caso B: Múltiples acciones o menú forzado -> Dropdown (3 puntos)
  const menuItems: MenuProps['items'] = activeActions.map((action) => {
    if (action.path) {
      return {
        key: action.key,
        label: <Link to={action.path}>{action.label}</Link>,
        icon: action.icon,
        danger: action.danger,
      };
    }
    return {
      key: action.key,
      label: action.label,
      icon: action.icon,
      danger: action.danger,
      onClick: action.onClick,
    };
  });

  return (
    <div className="responsive-table-actions__mobile">
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button icon={<EllipsisOutlined />} aria-label="Más acciones" />
      </Dropdown>
    </div>
  );
};
