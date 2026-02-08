export interface RecetaCreateDTO {
  codigoReceta: string;
  nombre: string;
  descripcion?: string;
  emailCreador: string;
}

export interface RecetaMetadataResponseDTO {
  codigoReceta: string;
  nombre: string;
  descripcion?: string;
  emailCreador: string;
  fechaCreacion: string;
}
