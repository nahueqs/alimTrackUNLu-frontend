import type { ProduccionProtectedResponseDTO, ProduccionPublicMetadataDTO } from '@/types/production';

/**
 * Verifica si una producción es del tipo Protegido (tiene datos sensibles como emailCreador).
 */
export const isProtectedProduction = (
  produccion: ProduccionProtectedResponseDTO | ProduccionPublicMetadataDTO
): produccion is ProduccionProtectedResponseDTO => {
  return 'emailCreador' in produccion;
};
