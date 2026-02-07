import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import type { SeccionResponseDTO } from '@/types/production';
import { useRespuestas } from '../context/RespuestasContext';

export const useSectionProgress = (seccion: SeccionResponseDTO, showProgress: boolean) => {
  const { respuestasCampos, respuestasTablas } = useRespuestas();
  const [progreso, setProgreso] = useState({ respondidos: 0, total: 0 });

  const recalcularProgresoSeccion = useCallback(() => {
    if (!showProgress) return;

    const camposSimplesTotal = seccion.camposSimples.length;
    const camposSimplesRespondidos = seccion.camposSimples.filter((c) =>
      respuestasCampos[c.id]?.trim()
    ).length;

    const camposEnGruposTotal = seccion.gruposCampos.reduce(
      (sum, g) => sum + g.campos.length,
      0
    );
    const camposEnGruposRespondidos = seccion.gruposCampos.reduce(
      (sum, g) => sum + g.campos.filter((c) => respuestasCampos[c.id]?.trim()).length,
      0
    );

    const celdasTotal = seccion.tablas.reduce(
      (sum, t) => sum + (t.filas?.length || 0) * (t.columnas?.length || 0),
      0
    );
    const celdasRespondidas = seccion.tablas.reduce(
      (sum, t) =>
        sum +
        respuestasTablas.filter((rt) => rt.idTabla === t.id && rt.valor?.trim()).length,
      0
    );

    setProgreso({
      total: camposSimplesTotal + camposEnGruposTotal + celdasTotal,
      respondidos: camposSimplesRespondidos + camposEnGruposRespondidos + celdasRespondidas,
    });
  }, [seccion, respuestasCampos, respuestasTablas, showProgress]);

  const debouncedRecalcular = useMemo(
    () => debounce(recalcularProgresoSeccion, 500),
    [recalcularProgresoSeccion]
  );

  useEffect(() => {
    debouncedRecalcular();
    return () => debouncedRecalcular.cancel();
  }, [respuestasCampos, respuestasTablas, debouncedRecalcular]);

  return progreso;
};
