import React from 'react';
import { Button, Spin } from 'antd';
import { BarcodeOutlined, FieldNumberOutlined, UserOutlined } from '@ant-design/icons';
import type { VersionRecetaMetadataResponseDTO } from '@/types/production';
import { VersionDetails } from './VersionDetails.tsx';

export interface FormFieldConfig {
  name: string;
  label: string | React.ReactNode;
  type: 'text' | 'textarea' | 'selectVersion';
  placeholder?: string;
  rules?: any[];
  prefix?: React.ReactNode;
  props?: Record<string, any>;
  renderDetails?: (selectedVersion: VersionRecetaMetadataResponseDTO) => React.ReactNode;
  options?: {
    value: string | number;
    label: string | React.ReactNode;
    children?: React.ReactNode;
  }[];
}

const VersionOption: React.FC<{ version: VersionRecetaMetadataResponseDTO }> = ({ version }) => (
  <div className="nueva-produccion-form__option-container">
    <div className="nueva-produccion-form__option-main">
      <strong>{version.codigoVersionReceta}</strong>
      <span className="nueva-produccion-form__option-separator"> - </span>
      <span>{version.nombre}</span>
    </div>
    {version.descripcion && (
      <div className="nueva-produccion-form__option-description">{version.descripcion}</div>
    )}
  </div>
);

export const getProduccionFormFields = (
  recipeVersions: VersionRecetaMetadataResponseDTO[],
  isFormSubmitting: boolean,
  hasVersionsError: boolean,
  refetchVersions: () => void,
  onVersionChange: (value: string) => void
): FormFieldConfig[] => {
  const getSelectPlaceholder = () =>
    (recipeVersions || []).length === 0 && !isFormSubmitting && !hasVersionsError
      ? 'No hay versiones disponibles'
      : 'Selecciona una versión de receta';

  const getSuffixIcon = () => (isFormSubmitting ? <Spin size="small" /> : undefined);

  const filterOptions = (input: string, option: any) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const sortOptions = (optionA: any, optionB: any) =>
    (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase());

  const getNotFoundContent = () => {
    if (isFormSubmitting) return <Spin size="small" />;
    if (hasVersionsError) {
      return (
        <div className="nueva-produccion-form__not-found-content">
          <div style={{ color: '#ff4d4f', marginBottom: '8px' }}>Error al cargar versiones</div>
          <Button
            type="link"
            size="small"
            onClick={refetchVersions}
            className="nueva-produccion-form__retry-button"
          >
            Reintentar
          </Button>
        </div>
      );
    }
    if ((recipeVersions || []).length === 0)
      return 'No se encontraron versiones de receta disponibles';
    return 'No hay opciones disponibles';
  };

  return [
    {
      name: 'codigoVersionReceta',
      label: (
        <span className="nueva-produccion-form__required-label">
          Versión de Receta<span className="nueva-produccion-form__required-asterisk"> *</span>
        </span>
      ),
      type: 'selectVersion',
      placeholder: getSelectPlaceholder(),
      rules: [{ required: true, message: 'Por favor selecciona una versión de receta' }],
      props: {
        showSearch: true,
        allowClear: true,
        optionFilterProp: 'children',
        filterOption: filterOptions,
        filterSort: sortOptions,
        notFoundContent: getNotFoundContent(),
        loading: isFormSubmitting,
        suffixIcon: getSuffixIcon(),
        disabled: hasVersionsError || (recipeVersions || []).length === 0,
        onChange: onVersionChange,
        onClear: () => onVersionChange(''),
        optionLabelProp: 'value',
      },
      options: (recipeVersions || []).map((version) => ({
        value: version.codigoVersionReceta,
        label: `${version.codigoVersionReceta} - ${version.nombre}`,
        children: <VersionOption version={version} />,
      })),
      renderDetails: (version: VersionRecetaMetadataResponseDTO) => (
        <VersionDetails version={version} />
      ),
    },
    {
      name: 'codigoProduccion',
      label: (
        <span className="nueva-produccion-form__required-label">
          Código de Producción<span className="nueva-produccion-form__required-asterisk"> *</span>
        </span>
      ),
      type: 'text',
      placeholder: 'Ej: PROD-2024-001',
      rules: [
        { required: true, message: 'El código de producción es requerido' },
        { min: 1, message: 'El código de producción no puede estar vacío' },
        { max: 255, message: 'No puede exceder 255 caracteres' },
        {
          pattern: /^[a-zA-Z0-9-_]+$/,
          message: 'Solo se permiten letras, números, guiones y guiones bajos',
        },
      ],
      prefix: <BarcodeOutlined style={{ color: '#1890ff' }} />,
      props: { maxLength: 255, showCount: true, allowClear: true },
    },
    {
      name: 'lote',
      label: 'Número de Lote',
      type: 'text',
      placeholder: 'Ej: LOTE-2024-001',
      rules: [
        { max: 100, message: 'No puede exceder 100 caracteres' },
        {
          pattern: /^[a-zA-Z0-9-_]+$/,
          message: 'Solo se permiten letras, números, guiones y guiones bajos',
        },
      ],
      prefix: <FieldNumberOutlined style={{ color: '#1890ff' }} />,
      props: {
        maxLength: 100,
        showCount: true,
        allowClear: true,
        style: { textTransform: 'uppercase' },
        onInput: (e: React.FormEvent<HTMLInputElement>) => {
          e.currentTarget.value = e.currentTarget.value.toUpperCase();
        },
      },
    },
    {
      name: 'encargado',
      label: 'Encargado de Producción',
      type: 'text',
      placeholder: 'Ej: Juan Pérez',
      rules: [
        { min: 1, message: 'El encargado no puede estar vacío' },
        { max: 100, message: 'No puede exceder 100 caracteres' },
      ],
      prefix: <UserOutlined style={{ color: '#1890ff' }} />,
      props: { maxLength: 100, showCount: true, allowClear: true },
    },
    {
      name: 'observaciones',
      label: 'Observaciones',
      type: 'textarea',
      placeholder:
        'Ej: Presencia de partículas. Color normal',
      rules: [
        { max: 255, message: 'No puede exceder 255 caracteres' },
      ],
      props: {
        rows: 4,
        maxLength: 255,
        showCount: true,
        allowClear: true,
        style: { resize: 'vertical' },
      },
    },
  ];
};
