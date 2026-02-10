import React, { useState } from 'react';
import { Button, Card, Descriptions, Form, Input, Modal, Select, Tag, Typography, message } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import type {
  EstructuraProduccionDTO,
  ProduccionMetadataModifyRequestDTO,
  ProduccionProtectedResponseDTO,
  ProduccionPublicMetadataDTO,
} from '@/types/production';
import {
  PRODUCTION_STATE_COLORS,
  PRODUCTION_STATE_LABELS,
  ProductionState,
} from '@/constants/ProductionStates';
import { useIsMobile } from '@/hooks/useIsMobile';
import { isProtectedProduction } from '@/utils/production/typeGuards';

const { Title, Text } = Typography;
const { Option } = Select;

interface InfoProduccionCardProps {
  produccion: ProduccionProtectedResponseDTO | ProduccionPublicMetadataDTO;
  versionReceta: EstructuraProduccionDTO;
  isEditable?: boolean;
  onCambioEstado?: (nuevoEstado: ProductionState) => Promise<void> | void;
  onMetadataChange?: (data: ProduccionMetadataModifyRequestDTO) => Promise<void> | void;
}

export const InfoProduccionCard: React.FC<InfoProduccionCardProps> = ({
  produccion,
  versionReceta,
  isEditable = false,
  onCambioEstado,
  onMetadataChange,
}) => {
  const [isEditing, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const isMobile = useIsMobile();

  const isProtected = isProtectedProduction(produccion);

  const handleEdit = () => {
    form.setFieldsValue({
      lote: produccion.lote,
      encargado: produccion.encargado,
      observaciones: isProtected ? produccion.observaciones : undefined,
    });
    setIsEditable(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (onMetadataChange) {
        await onMetadataChange(values);
      }
      
      setIsEditable(false);
      message.success('Información actualizada correctamente');
    } catch (error: any) {
      if (error.errorFields) {
        // Error de validación del formulario (campos requeridos, etc.)
        console.log('Validate Failed:', error);
      } else {
        // Error del backend o de red
        console.error('Error al guardar metadatos:', error);
        message.error(error.message || 'Error al actualizar la información. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = (value: ProductionState) => {
    // Guardar el valor anterior para revertir si falla o cancela
    const previousValue = produccion.estado;

    Modal.confirm({
      title: '¿Estás seguro de cambiar el estado?',
      content: `La producción pasará a estado ${PRODUCTION_STATE_LABELS[value]}.`,
      onOk: async () => {
        try {
          if (onCambioEstado) {
            await onCambioEstado(value);
            message.success(`Estado cambiado a ${PRODUCTION_STATE_LABELS[value]}`);
          }
        } catch (error: any) {
          console.error('Error al cambiar estado:', error);
          message.error(error.message || 'Error al cambiar el estado. Intente nuevamente.');
          // Revertir visualmente si es necesario (aunque el componente se re-renderizará con props)
        }
      },
      onCancel: () => {
        // No hacemos nada, el Select mantendrá el valor visualmente hasta que se actualicen las props
        // o podemos forzar un re-render si fuera un componente controlado localmente
      }
    });
  };

  const renderEstadoTag = (estado: ProductionState) => {
    const color = PRODUCTION_STATE_COLORS[estado] || 'default';
    const text = PRODUCTION_STATE_LABELS[estado] || estado;
    return <Tag color={color}>{text}</Tag>;
  };

  return (
    <Card className="info-card">
      <div className="info-card-header">
        <Title level={4} className="info-card-title">
          Información de Producción
        </Title>
        {isEditable && !isEditing && isProtected && (
          <Button type="text" icon={<EditOutlined />} onClick={handleEdit}>
            {isMobile ? '' : 'Editar'}
          </Button>
        )}
        {isEditable && isEditing && isProtected && (
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave}
            loading={loading}
          >
            {isMobile ? '' : 'Guardar'}
          </Button>
        )}
      </div>

      {isEditing ? (
        <Form form={form} layout="vertical">
          <Form.Item name="lote" label="Lote" rules={[
            {
              max: 100,
              message: 'El lote no pueden exceder los 255 caracteres.'
            }
          ]}>
            <Input />
          </Form.Item>
          <Form.Item name="encargado" label="Encargado" rules={[
            {
              max: 100,
              message: 'El encargado no pueden exceder los 255 caracteres.'
            }
          ]}>
            <Input />
          </Form.Item>
          <Form.Item 
            name="observaciones" 
            label="Observaciones"
            rules={[
              { 
                max: 255, 
                message: 'Las observaciones no pueden exceder los 255 caracteres.' 
              }
            ]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      ) : (
        <Descriptions 
          column={1} 
          bordered 
          size="small"
          layout={isMobile ? 'vertical' : 'horizontal'}
          style={{ width: '100%' }}
        >
          <Descriptions.Item label="Código">{produccion.codigoProduccion}</Descriptions.Item>
          <Descriptions.Item label="Lote">
            <Text strong>{produccion.lote || '-'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            {isEditable && isProtected ? (
              <Select
                value={produccion.estado} // Usar value controlado en lugar de defaultValue
                style={{ width: '100%', minWidth: 120 }}
                onChange={handleEstadoChange}
                disabled={
                  produccion.estado === ProductionState.FINALIZADA ||
                  produccion.estado === ProductionState.CANCELADA
                }
              >
                <Option value={ProductionState.EN_PROCESO}>En Proceso</Option>
                <Option value={ProductionState.FINALIZADA}>Finalizada</Option>
                <Option value={ProductionState.CANCELADA}>Cancelada</Option>
              </Select>
            ) : (
              renderEstadoTag(produccion.estado)
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Versión Receta">
            {versionReceta.metadata.nombre} ({versionReceta.metadata.codigoVersionReceta})
          </Descriptions.Item>
          <Descriptions.Item label="Fecha Inicio">
            {new Date(produccion.fechaInicio).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha Fin">
            {produccion.fechaFin ? new Date(produccion.fechaFin).toLocaleString() : '-'}
          </Descriptions.Item>
          {produccion.encargado && (
            <Descriptions.Item label="Encargado">
              {produccion.encargado}
            </Descriptions.Item>
          )}
          {isProtected && produccion.emailCreador && (
            <Descriptions.Item label="Creado por">
              {produccion.emailCreador}
            </Descriptions.Item>
          )}
        </Descriptions>
      )}
      {!isEditing && isProtected && produccion.observaciones && (
        <div style={{ marginTop: 16 }}>
          <Text strong>Observaciones:</Text>
          <p>{produccion.observaciones}</p>
        </div>
      )}
    </Card>
  );
};
