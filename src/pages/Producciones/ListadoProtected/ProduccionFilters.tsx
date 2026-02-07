import React from 'react';
import { Button, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { PRODUCTION_STATE_LABELS, ProductionState } from '@/constants/ProductionStates';
import type { Dayjs } from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

// Interfaz para los filtros locales del formulario
export interface LocalProductionFilters {
  codigoProduccion?: string;
  lote?: string;
  estado?: ProductionState;
  fechaRange?: [Dayjs | null, Dayjs | null];
}

interface ProduccionFiltersProps {
  onFilterChange: (filters: LocalProductionFilters) => void;
  initialFilters?: Partial<LocalProductionFilters>;
}

export const ProduccionFilters: React.FC<ProduccionFiltersProps> = ({
  onFilterChange,
  initialFilters = {},
}) => {
  const [form] = Form.useForm();

  const handleFinish = (values: LocalProductionFilters) => {
    onFilterChange(values);
  };

  const handleReset = () => {
    form.resetFields();
    // Enviamos un objeto vacío para limpiar los filtros
    onFilterChange({});
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={initialFilters}
      style={{ marginBottom: '24px', background: '#fff', padding: '24px', borderRadius: '8px' }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="codigoProduccion" label="Código Producción">
            <Input placeholder="Buscar por código" allowClear />
          </Form.Item>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="lote" label="Lote">
            <Input placeholder="Buscar por lote" allowClear />
          </Form.Item>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="estado" label="Estado">
            <Select placeholder="Todos" allowClear>
              {Object.values(ProductionState).map((state) => (
                <Option key={state} value={state}>
                  {PRODUCTION_STATE_LABELS[state]}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item name="fechaRange" label="Rango de Fechas (Inicio)">
            <RangePicker 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY"
              placeholder={['Desde', 'Hasta']}
            />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={handleReset} icon={<ClearOutlined />}>
              Limpiar
            </Button>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              Buscar
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
};
