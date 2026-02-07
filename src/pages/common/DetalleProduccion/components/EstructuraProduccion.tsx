import React from 'react';
import { Card, Form, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRespuestas } from '../context/RespuestasContext';
import { ManualSaveInput } from './form/ManualSaveInput';
import type {
  GrupoCamposResponseDTO,
  SeccionResponseDTO,
  TablaResponseDTO,
} from '@/types/production';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useSectionProgress } from '../hooks/useSectionProgress';
import '../DetalleProduccionPage.css';

const { Title } = Typography;

const GrupoDeCampos: React.FC<{ grupo: GrupoCamposResponseDTO; isEditable: boolean }> = React.memo(
  ({ grupo, isEditable }) => {
    const { respuestasCampos, onCampoChange } = useRespuestas();
    return (
      <div className="group-card">
        <Title level={5} className="group-title">
          {grupo.subtitulo}
        </Title>
        {grupo.campos.map((campo) => (
          <Form.Item key={`campo-${campo.id}`} label={campo.nombre}>
            <ManualSaveInput
              value={respuestasCampos[campo.id] || ''}
              onChange={(valor) => onCampoChange(campo.id, valor, campo.tipoDato)}
              placeholder={`Ingrese ${campo.nombre.toLowerCase()}`}
              disabled={!isEditable}
              tipoDato={campo.tipoDato}
            />
          </Form.Item>
        ))}
      </div>
    );
  }
);

type DataType = { key: number; idFila: number; nombreFila: string };

const TablaProduccion: React.FC<{ tabla: TablaResponseDTO; isEditable: boolean }> = React.memo(
  ({ tabla, isEditable }) => {
    const isMobile = useIsMobile();
    const { respuestasTablas, onTablaChange } = useRespuestas();
    const dataSource: DataType[] =
      tabla.filas?.map((fila) => ({
        key: fila.id,
        idFila: fila.id,
        nombreFila: fila.nombre,
      })) || [];

    const columns: ColumnsType<DataType> = [
      {
        title: 'Concepto',
        dataIndex: 'nombreFila',
        key: 'nombreFila',
        render: (text: string) => <strong>{text}</strong>,
        fixed: !isMobile ? 'left' : false,
        width: 150,
      },
      ...(tabla.columnas?.map((col) => ({
        title: col.nombre,
        dataIndex: col.id.toString(),
        key: `col-${col.id}`,
        render: (_: any, record: DataType) => {
          const valor =
            respuestasTablas.find(
              (c) => c.idFila === record.idFila && c.idColumna === col.id
            )?.valor || '';
          return (
            <ManualSaveInput
              value={valor}
              onChange={(nuevoValor) =>
                onTablaChange(tabla.id, record.idFila, col.id, nuevoValor, col.tipoDato)
              }
              placeholder={col.nombre}
              disabled={!isEditable}
              tipoDato={col.tipoDato}
            />
          );
        },
      })) || []),
    ];

    return (
      <div className="production-table-container">
        <h5 className="production-table-title">{tabla.nombre}</h5>
        {tabla.descripcion && (
          <p className="production-table-description">{tabla.descripcion}</p>
        )}
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          bordered
          size="small"
          scroll={{ x: 'max-content' }}
        />
      </div>
    );
  }
);

interface SeccionProduccionProps {
  seccion: SeccionResponseDTO;
  numeroSeccion: number;
  isEditable: boolean;
  showProgress?: boolean;
}

const SeccionProduccion: React.FC<SeccionProduccionProps> = React.memo(
  ({ seccion, numeroSeccion, isEditable, showProgress = true }) => {
    const { respuestasCampos, onCampoChange } = useRespuestas();
    const progreso = useSectionProgress(seccion, showProgress);

    return (
      <Card className="section-card">
        <Title level={4} className="section-title">
          <span className="section-number">{numeroSeccion}</span>
          {seccion.titulo}
          {showProgress && progreso.total > 0 && (
            <span className="section-progress-text">
              ({progreso.respondidos} / {progreso.total})
            </span>
          )}
        </Title>
        <div className="section-content-wrapper">
          <Form layout="vertical">
            {seccion.camposSimples.map((campo) => (
              <Form.Item key={`campo-${campo.id}`} label={campo.nombre}>
                <ManualSaveInput
                  value={respuestasCampos[campo.id] || ''}
                  onChange={(valor) => onCampoChange(campo.id, valor, campo.tipoDato)}
                  placeholder={`Ingrese ${campo.nombre.toLowerCase()}`}
                  disabled={!isEditable}
                  tipoDato={campo.tipoDato}
                />
              </Form.Item>
            ))}
            {seccion.gruposCampos.map((grupo) => (
              <GrupoDeCampos key={`grupo-${grupo.id}`} grupo={grupo} isEditable={isEditable} />
            ))}
            {seccion.tablas.map((tabla) => (
              <TablaProduccion key={`tabla-${tabla.id}`} tabla={tabla} isEditable={isEditable} />
            ))}
          </Form>
        </div>
      </Card>
    );
  }
);

interface EstructuraProduccionProps {
  estructura: SeccionResponseDTO[];
  isEditable?: boolean;
  showProgress?: boolean;
}

export const EstructuraProduccion: React.FC<EstructuraProduccionProps> = ({
  estructura,
  isEditable = false,
  showProgress = true,
}) => (
  <div className="production-structure">
    {estructura.map((seccion, index) => (
      <SeccionProduccion
        key={`seccion-${seccion.id}`}
        seccion={seccion}
        numeroSeccion={index + 1}
        isEditable={isEditable}
        showProgress={showProgress}
      />
    ))}
  </div>
);
