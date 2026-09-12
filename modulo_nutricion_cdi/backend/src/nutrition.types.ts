export type TurnoCita = 'MANANA' | 'TARDE';
export type TipoConsulta = 'PRIMERA_VEZ' | 'CONTROL' | 'EMERGENCIA_NUTRICIONAL';
export type EstadoCita = 'PROGRAMADA' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA' | 'NO_ASISTIO';

export interface CitaNutricionDTO {
  id?: string;
  pacienteId: string;
  fechaCita: string;
  horaCita: string;
  turno: TurnoCita;
  tipoConsulta: TipoConsulta;
  motivoConsulta: string;
  profesionalNombre: string;
}

export interface EvaluacionAntropometricaDTO {
  historiaId: string;
  citaId?: string;
  pesoKg: number;
  tallaCm: number;
  circunferenciaBrazoCm?: number;
  circunferenciaCinturaCm?: number;
  pliegueTricipitalMm?: number;
  evaluadorNombre: string;
  observacionesClinicas?: string;
  esGestante?: boolean;
  semanasGestacion?: number;
  edadMesesOAnos?: { valor: number; unidad: 'MESES' | 'ANOS' };
}

export interface DiagnosticoNutricionalResult {
  imc: number;
  clasificacion: string;
  diagnosticoDetallado: string;
  alertaRiesgo: 'VERDE' | 'AMARILLO' | 'ROJO';
  requiereSuplementacionUrgente: boolean;
}

export interface PlanAlimentarioDTO {
  evaluacionId: string;
  pacienteId: string;
  requerimientoCaloricoKcal: number;
  porcentajeCarbohidratos?: number;
  porcentajeProteinas?: number;
  porcentajeGrasas?: number;
  desayunoGuia: string;
  meriendaMananaGuia?: string;
  almuerzoGuia: string;
  meriendaTardeGuia?: string;
  cenaGuia: string;
  recomendacionesLocales: string;
  fechaProximoControl?: string;
}

export interface EntregaSuplementoDTO {
  evaluacionId: string;
  suplementoId: string;
  dosisDiaria: string;
  duracionDias: number;
  cantidadPrescrita: number;
  cantidadEntregada: number;
  loteEntregado?: string;
  responsableEntrega: string;
  observaciones?: string;
}
