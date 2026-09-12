export type CategoriaFarmacia = 
  | 'ANALGESICO_ANTIINFLAMATORIO'
  | 'ANTIBIOTICO'
  | 'ANTIHIPERTENSIVO'
  | 'HIPOGLUCEMIANTE'
  | 'OFTALMOLOGICO'
  | 'RESPIRATORIO'
  | 'INSUMO_QUIRURGICO'
  | 'OTRO';

export type ServicioEmisor = 
  | 'MEDICINA_GENERAL'
  | 'OFTALMOLOGIA'
  | 'URGENCIAS_TERAPIA'
  | 'ODONTOLOGIA'
  | 'TRAUMATOLOGIA'
  | 'GINECOLOGIA'
  | 'PEDIATRIA'
  | 'OTRO_CENTRO_SALUD';

export interface EntradaLoteDTO {
  articuloId: string;
  numeroLote: string;
  fechaVencimiento: string; // YYYY-MM-DD
  cantidad: number;
  laboratorioOrigen?: string;
  documentoSoporte: string; // ej. "Guía de Despacho MPPS-0492"
  usuarioResponsable: string;
}

export interface ItemRecipeInput {
  articuloId: string;
  posologia: string;
  duracionTratamientoDias: number;
  cantidadPrescrita: number;
}

export interface RecepcionRecipeDTO {
  numeroRecipe: string;
  pacienteId?: string;
  cedulaPaciente: string;
  nombrePaciente: string;
  servicioEmisor: ServicioEmisor;
  medicoTratante: string;
  matriculaMpps: string;
  diagnosticoPresuntivo: string;
  fechaEmision: string;
  diasValidez?: number; // Por defecto 15 o 30 días
  observaciones?: string;
  medicamentos: ItemRecipeInput[];
}

export interface ItemDispensarRequest {
  recipeDetalleId: string;
  articuloId: string;
  cantidadADespachar: number;
}

export interface DispensarRecipeDTO {
  recipeId: string;
  personaQueRetira: string;
  cedulaPersonaQueRetira: string;
  parentesco: string;
  farmaceutaDespachador: string;
  items: ItemDispensarRequest[];
  observaciones?: string;
}

export interface LoteDeduccion {
  loteId: string;
  numeroLote: string;
  fechaVencimiento: string;
  cantidadDeducida: number;
}

export interface ItemDispensadoResultado {
  articuloId: string;
  nombreGenerico: string;
  cantidadDespachada: number;
  lotesAfectados: LoteDeduccion[];
  estadoItem: 'PENDIENTE' | 'PARCIAL' | 'COMPLETO' | 'NO_DISPONIBLE';
}

export interface ResultadoDispensacion {
  dispensacionId: string;
  codigoDispensacion: string;
  recipeId: string;
  estadoRecipeFinal: 'PENDIENTE' | 'DISPENSADO_PARCIAL' | 'DISPENSADO_TOTAL';
  fechaDispensacion: string;
  detalles: ItemDispensadoResultado[];
}
