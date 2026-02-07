import React, { useMemo } from 'react';
import { Col, Row } from 'antd';
import { InfoProduccionCard } from './components/InfoProduccionCard';
import { EstructuraProduccion } from './components/EstructuraProduccion';
import { FloatingActionButtons } from './components/FloatingActionButtons';
import { ProgresoProduccionCard } from './components/ProgresoProduccionCard';
import { RespuestasContext } from './context/RespuestasContext';
import type {
  EstructuraProduccionDTO,
  ProduccionMetadataModifyRequestDTO,
  RespuestasProduccionProtectedDTO,
  RespuestasProduccionPublicDTO,
} from '@/types/production';
import { TipoDatoCampo } from '@/pages/Recetas/types/TipoDatoCampo';
import { ProductionState } from '@/constants/ProductionStates';

type RespuestasProduccion = RespuestasProduccionPublicDTO | RespuestasProduccionProtectedDTO;

interface ProductionDisplayProps {
  estructura: EstructuraProduccionDTO;
  respuestas: RespuestasProduccion;
  isEditable?: boolean;
  onCampoChange?: (idCampo: number, valor: string, tipoDato: TipoDatoCampo) => Promise<void>;
  onTablaChange?: (
    idTabla: number,
    idFila: number,
    idColumna: number,
    valor: string,
    tipoDato: TipoDatoCampo
  ) => Promise<void>;
  onMetadataChange?: (data: ProduccionMetadataModifyRequestDTO) => void;
  onCambioEstado?: (nuevoEstado: ProductionState) => void;
}

const noOp = async () => {};

export const DetalleProduccionPage: React.FC<ProductionDisplayProps> = ({
  estructura,
  respuestas,
  isEditable = false,
  onCampoChange = noOp,
  onTablaChange = noOp,
  onMetadataChange = noOp,
  onCambioEstado,
}) => {
  // Optimización: Crear el mapa de respuestas solo cuando cambian las respuestas
  const respuestasCamposMap = useMemo(() => {
    return respuestas.respuestasCampos.reduce(
      (acc, resp) => {
        acc[resp.idCampo] = resp.valor;
        return acc;
      },
      {} as Record<number, string>
    );
  }, [respuestas.respuestasCampos]);

  // Optimización: El contexto solo recibe funciones de cambio si es editable
  const contextValue = useMemo(
    () => ({
      respuestasCampos: respuestasCamposMap,
      respuestasTablas: respuestas.respuestasTablas,
      onCampoChange: isEditable ? onCampoChange : noOp,
      onTablaChange: isEditable ? onTablaChange : noOp,
    }),
    [respuestasCamposMap, respuestas.respuestasTablas, onCampoChange, onTablaChange, isEditable]
  );

  return (
    <div id="production-content">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <InfoProduccionCard
            produccion={respuestas.produccion}
            versionReceta={estructura}
            isEditable={isEditable}
            onCambioEstado={onCambioEstado}
            onMetadataChange={onMetadataChange}
          />
        </Col>
        <Col xs={24} lg={8}>
          <ProgresoProduccionCard progreso={respuestas.progreso} />
        </Col>
      </Row>

      <RespuestasContext.Provider value={contextValue}>
        <EstructuraProduccion estructura={estructura.estructura} isEditable={isEditable} />
      </RespuestasContext.Provider>

      {isEditable && <FloatingActionButtons />}
    </div>
  );
};
