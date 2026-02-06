import React from 'react';
import { Select, Space, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import type { NotificationLevel } from '@/hooks/useProductionWebSocket';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Text } = Typography;

interface NotificationSelectorProps {
  value: NotificationLevel;
  onChange: (value: NotificationLevel) => void;
  className?: string;
}

export const NotificationSelector: React.FC<NotificationSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={className} style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
      <Space 
        align="center" 
        size={isMobile ? 'small' : 'middle'} 
        style={{ 
          width: isMobile ? '100%' : 'auto', 
          justifyContent: isMobile ? 'space-between' : 'flex-end' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BellOutlined style={{ color: '#8c8c8c' }} />
          <Text type="secondary" style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>
            Avisos:
          </Text>
        </div>
        <Select
          value={value}
          onChange={onChange}
          style={{ width: isMobile ? '140px' : '180px' }}
          size="small"
          placement="bottomRight"
          getPopupContainer={() => document.body}
          options={[
            { value: 'ALL', label: isMobile ? 'Todos' : 'Todos los cambios' },
            { value: 'STATE_ONLY', label: isMobile ? 'Estado' : 'Solo estado' },
            { value: 'NONE', label: 'Silenciar' },
          ]}
        />
      </Space>
    </div>
  );
};
