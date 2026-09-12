// Tipos y Esquemas de Datos para el Sistema CDI Salud Integral Enterprise

export type ModuloNombre =
  | 'dashboard'
  | 'pacientes'
  | 'citas'
  | 'triaje'
  | 'tratamientos'
  | 'laboratorio'
  | 'imagenologia'
  | 'hospitalizacion'
  | 'odontologia'
  | 'telemedicina'
  | 'medicamentos'
  | 'farmacia'
  | 'proveedores'
  | 'facturacion'
  | 'epidemiologia'
  | 'departamentos'
  | 'empleados'
  | 'cargos'
  | 'horarios'
  | 'usuarios'
  | 'roles'
  | 'auditoria'
  | 'portal_paciente'
  | 'nutricion'
  | 'oftalmologia';

export type RolTipo =
  | 'Administrador'
  | 'Médico'
  | 'Enfermero/a'
  | 'Farmacéutico/a'
  | 'Bioanalista'
  | 'Radiólogo/a'
  | 'Odontólogo/a'
  | 'Nutricionista'
  | 'Oftalmólogo/a'
  | 'Recepcionista'
  | 'Auditor'
  | 'Paciente';

export interface PermisosRol {
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
  exportar: boolean;
}

export interface Rol {
  id: string;
  nombre: RolTipo;
  descripcion: string;
  permisos: Record<ModuloNombre, PermisosRol>;
  estado: 'Activo' | 'Inactivo';
  fechaCreacion: string;
}

export interface Usuario {
  id: string;
  nombreUsuario: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
  rolId: string;
  rolNombre?: string;
  empleadoId?: string;
  pacienteId?: string;
  estado: 'Activo' | 'Inactivo' | 'Bloqueado';
  ultimoAcceso?: string;
  fechaCreacion: string;
}

export interface Departamento {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  piso: string;
  responsable: string;
  capacidadCamas: number;
  consultorios: number;
  telefonoInterno: string;
  estado: 'Activo' | 'Mantenimiento' | 'Inactivo';
}

export interface Cargo {
  id: string;
  titulo: string;
  departamentoId: string;
  departamentoNombre?: string;
  nivelJerarquico: 'Directivo' | 'Médico Especialista' | 'Asistencial' | 'Técnico' | 'Administrativo' | 'Apoyo';
  salarioBase: number;
  requisitos: string;
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
}

export interface Empleado {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  genero: 'Masculino' | 'Femenino' | 'Otro';
  fechaNacimiento: string;
  email: string;
  telefono: string;
  direccion: string;
  cargoId: string;
  cargoTitulo?: string;
  departamentoId: string;
  departamentoNombre?: string;
  fechaIngreso: string;
  colegiaturaMedica?: string;
  estado: 'Activo' | 'Vacaciones' | 'Permiso' | 'Inactivo';
}

export interface Horario {
  id: string;
  nombreTurno: string;
  empleadoId: string;
  empleadoNombre?: string;
  departamentoId: string;
  departamentoNombre?: string;
  tipoTurno: 'Matutino' | 'Vespertino' | 'Nocturno' | 'Guardia 24h';
  horaInicio: string;
  horaFin: string;
  diasSemana: string[]; // ['Lunes', 'Martes', ...]
  estado: 'Activo' | 'Programado' | 'Cubierto' | 'Cancelado';
  observaciones?: string;
}

export interface Paciente {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  edad: number;
  genero: 'Masculino' | 'Femenino' | 'Otro';
  tipoSangre: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
  telefono: string;
  email?: string;
  direccion: string;
  comunidadSector?: string;
  contactoEmergencia: {
    nombre: string;
    parentesco: string;
    telefono: string;
  };
  alergias: string[];
  antecedentes: string[];
  fechaRegistro: string;
  estado: 'Activo' | 'En Observación' | 'Hospitalizado' | 'De Alta';
}

export interface Proveedor {
  id: string;
  rif: string; // RIF / NIT / Tax ID
  razonSocial: string;
  nombreComercial: string;
  contactoPrincipal: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  categoria: 'Medicamentos' | 'Material Médico-Quirúrgico' | 'Reactivos de Laboratorio' | 'Equipos y Mantenimiento';
  plazoPagoDias: number;
  calificacion: 1 | 2 | 3 | 4 | 5;
  estado: 'Activo' | 'Inactivo' | 'Suspendido';
}

export interface Medicamento {
  id: string;
  codigo: string;
  nombreComercial: string;
  principioActivo: string;
  concentracion: string;
  presentacion: 'Tabletas' | 'Cápsulas' | 'Jarabe' | 'Ampollas / Inyectable' | 'Suspensión' | 'Gotas' | 'Crema / Pomada' | 'Solución Intravenosa';
  viaAdministracion: 'Oral' | 'Intravenosa' | 'Intramuscular' | 'Subcutánea' | 'Intravenosa / Intramuscular' | 'Tópica' | 'Sublingual' | 'Oftálmica' | 'Inhalatoria';
  categoriaTerapeutica: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  ubicacionEstante: string;
  requiereReceta: boolean;
  temperaturaAlmacenamiento: 'Ambiente (15-25°C)' | 'Refrigerado (2-8°C)' | 'Congelado';
  estado: 'Disponible' | 'Stock Bajo' | 'Agotado' | 'Vencido';
}

export interface MovimientoFarmacia {
  id: string;
  numeroTransaccion: string;
  tipoMovimiento: 'Entrada / Compra' | 'Salida / Despacho' | 'Ajuste de Inventario' | 'Merma / Vencimiento' | 'Transferencia';
  medicamentoId: string;
  medicamentoNombre?: string;
  cantidad: number;
  lote: string;
  fechaVencimiento: string;
  proveedorId?: string;
  proveedorNombre?: string;
  pacienteId?: string;
  pacienteNombre?: string;
  tratamientoId?: string;
  responsableEmpleadoId: string;
  responsableNombre?: string;
  fechaHora: string;
  motivo: string;
  observaciones?: string;
}

export interface Cita {
  id: string;
  codigoCita: string;
  pacienteId: string;
  pacienteNombre?: string;
  pacienteCedula?: string;
  medicoId: string;
  medicoNombre?: string;
  departamentoId: string;
  departamentoNombre?: string;
  fecha: string;
  hora: string;
  motivoConsulta: string;
  triajePrioridad: 'Emergencia' | 'Urgencia' | 'Consulta Regular' | 'Control / Seguimiento';
  modalidad?: 'Presencial' | 'Telemedicina';
  signosVitales?: {
    presionArterial?: string;
    frecuenciaCardiaca?: number;
    temperatura?: number;
    saturacionOxigeno?: number;
    pesoKg?: number;
    frecuenciaRespiratoria?: number;
  };
  estado: 'Pendiente' | 'Confirmada' | 'En Triaje' | 'En Consulta' | 'Completada' | 'Cancelada';
  diagnosticoPreliminar?: string;
  notas?: string;
}

export interface PrescripcionItem {
  medicamentoId: string;
  medicamentoNombre: string;
  dosis: string;
  frecuencia: string;
  duracionDias: number;
  cantidadTotal: number;
  instruccionesEspeciales?: string;
}

export interface Tratamiento {
  id: string;
  codigoTratamiento: string;
  citaId?: string;
  pacienteId: string;
  pacienteNombre?: string;
  pacienteCedula?: string;
  medicoId: string;
  medicoNombre?: string;
  diagnosticoCIE: string; // Ej. J00 Rinofaringitis aguda
  diagnosticoDescripcion: string;
  prescripciones: PrescripcionItem[];
  indicacionesGenerales: string;
  fechaInicio: string;
  fechaFin: string;
  proximoControl?: string;
  estado: 'Activo' | 'Completado' | 'Suspendido' | 'Modificado';
}

// -------------------------------------------------------------
// NUEVOS MÓDULOS HOSPITALARIOS ENTERPRISE
// -------------------------------------------------------------

// 1. Laboratorio Clínico (LIS)
export interface ItemResultadoLaboratorio {
  parametro: string;
  valor: string | number;
  unidad: string;
  rangoReferencia: string;
  estado: 'Normal' | 'Bajo' | 'Alto' | 'Crítico';
  observaciones?: string;
}

export interface OrdenLaboratorio {
  id: string;
  codigoOrden: string;
  pacienteId: string;
  pacienteNombre?: string;
  pacienteCedula?: string;
  pacienteEdad?: number;
  pacienteGenero?: string;
  medicoId: string;
  medicoNombre?: string;
  fechaOrden: string;
  fechaResultado?: string;
  prioridad: 'Rutina' | 'Urgente' | 'Emergencia / Stat';
  perfil:
    | 'Hematología Completa'
    | 'Química Sanguínea General'
    | 'Perfil Lipídico'
    | 'Electrolitos y Gases Arteriales'
    | 'Uroanálisis / Orina Simple'
    | 'Inmunología y Serología'
    | 'Coprología'
    | 'Pruebas de Coagulación (PT/PTT)';
  muestra: 'Sangre Total' | 'Suero' | 'Plasma' | 'Orina' | 'Heces' | 'LCR' | 'Exudado';
  resultados: ItemResultadoLaboratorio[];
  bioanalistaResponsable?: string;
  observacionesClinicas?: string;
  codigoValidacionQR?: string;
  estado: 'Solicitado' | 'En Proceso' | 'Validado' | 'Entregado';
}

// 2. Imagenología & Radiología (RIS / PACS)
export interface EstudioImagen {
  id: string;
  codigoEstudio: string;
  pacienteId: string;
  pacienteNombre?: string;
  pacienteCedula?: string;
  medicoSolicitanteId: string;
  medicoSolicitanteNombre?: string;
  modalidad: 'Rayos X' | 'Ecografía / Ultrasonido' | 'Tomografía Axial (TAC)' | 'Electrocardiograma (ECG)' | 'Resonancia Magnética (RMN)';
  regionAnatomica: string;
  fechaSolicitud: string;
  fechaRealizacion?: string;
  radiologoResponsable?: string;
  motivoEstudio: string;
  hallazgos: string;
  impresionDiagnostica: string;
  clasificacionEspecial?: string; // Ej. BI-RADS 2, Fleischner bajo riesgo
  imagenesUrls: string[]; // Imágenes de demostración de alta fidelidad
  prioridad: 'Emergencia' | 'Urgente' | 'Programada';
  estado: 'Pendiente' | 'Adquirido' | 'Informado' | 'Entregado';
}

// 3. Hospitalización, Gestión de Camas & Censo Hospitalario
export interface CamaHospitalaria {
  id: string;
  codigoCama: string;
  departamentoId: string;
  departamentoNombre: string;
  salaNombre: string;
  tipoCama: 'General Adulto' | 'Cuidados Intensivos (UCI)' | 'Observación Urgencias' | 'Aislamiento Respiratorio' | 'Pediátrica' | 'Trauma Shock';
  estado: 'Disponible' | 'Ocupada' | 'En Limpieza' | 'Mantenimiento';
  pacienteActualId?: string;
  pacienteActualNombre?: string;
  pacienteCedula?: string;
  fechaIngreso?: string;
  medicoTratante?: string;
  diagnosticoActual?: string;
}

export interface NotaSOAP {
  id: string;
  fechaHora: string;
  medicoNombre: string;
  subjetivo: string;
  objetivo: string;
  analisis: string;
  plan: string;
  signosVitales?: {
    pa: string;
    fc: number;
    fr: number;
    temp: number;
    spo2: number;
  };
}

export interface OrdenEnfermeria {
  id: string;
  fechaHora: string;
  enfermeroNombre: string;
  indicacion: string;
  via: string;
  horario: string;
  estado: 'Pendiente' | 'Cumplida' | 'Suspendida';
}

export interface AdmisionHospitalaria {
  id: string;
  codigoAdmision: string;
  pacienteId: string;
  pacienteNombre?: string;
  pacienteCedula?: string;
  camaId: string;
  camaCodigo: string;
  salaNombre: string;
  fechaIngreso: string;
  fechaAltaEstimada?: string;
  fechaAltaReal?: string;
  diagnosticoIngreso: string;
  diagnosticoEgreso?: string;
  medicoTratanteId: string;
  medicoTratanteNombre: string;
  notasEvolucionSOAP: NotaSOAP[];
  ordenesEnfermeria: OrdenEnfermeria[];
  resumenEpicrisis?: string;
  estado: 'Ingresado' | 'En Observación' | 'Alta Médica' | 'Trasladado';
}

// 4. Triaje de Urgencias & Score NEWS2
export interface RegistroTriaje {
  id: string;
  codigoTriaje: string;
  pacienteId: string;
  pacienteNombre?: string;
  pacienteCedula?: string;
  fechaHora: string;
  enfermeroTriaje: string;
  nivelTriaje:
    | 'Nivel 1 - Resucitación (Rojo)'
    | 'Nivel 2 - Emergencia (Naranja)'
    | 'Nivel 3 - Urgencia (Amarillo)'
    | 'Nivel 4 - Menor (Verde)'
    | 'Nivel 5 - No Urgente (Azul)';
  signosVitales: {
    pas: number; // Presión arterial sistólica
    pad: number; // Presión arterial diastólica
    fc: number; // Frecuencia cardíaca
    fr: number; // Frecuencia respiratoria
    spo2: number; // Saturación de O2 %
    oxigenoSuplementario: boolean;
    temperatura: number; // °C
    escalaAVPU: 'Alerta (A)' | 'Voz (V)' | 'Dolor (P)' | 'Inconsciente (U)';
    escalaDolorEva: number; // 0-10
  };
  scoreNEWS2: number;
  nivelRiesgoNEWS2: 'Bajo (0-4)' | 'Medio (5-6 / Monoparámetro 3)' | 'Alto (7+ Alerta Crítica)';
  motivoUrgencia: string;
  destinoRecomendado: 'Reanimación / Trauma Shock' | 'Observación' | 'Consulta de Urgencias' | 'Sala de Espera';
  tiempoEsperaMinutos: number;
  estado: 'En Espera' | 'En Atención' | 'Hospitalizado' | 'Atendido y Egresado';
}

// 5. Odontología & Odontograma Anatómico (FDI)
export interface DetalleDiente {
  numeroDiente: number; // Notación FDI (ej. 11, 21, 36, 46)
  estadoGeneral: 'Sano' | 'Ausente' | 'Implante' | 'Corona' | 'Protesis' | 'Endodoncia' | 'Exodoncia Indicada';
  caras: {
    oclusal?: 'Sana' | 'Caries' | 'Obturacion Resina' | 'Obturacion Amalgama' | 'Sellante';
    vestibular?: 'Sana' | 'Caries' | 'Obturacion Resina' | 'Obturacion Amalgama';
    lingual?: 'Sana' | 'Caries' | 'Obturacion Resina' | 'Obturacion Amalgama';
    mesial?: 'Sana' | 'Caries' | 'Obturacion Resina' | 'Obturacion Amalgama';
    distal?: 'Sana' | 'Caries' | 'Obturacion Resina' | 'Obturacion Amalgama';
  };
  notas?: string;
}

export interface TratamientoDentalItem {
  id: string;
  dienteNumero?: number;
  procedimiento: string;
  costoEstimadoUSD: number;
  estado: 'Planificado' | 'En Proceso' | 'Completado';
}

export interface OdontogramaPaciente {
  id: string;
  pacienteId: string;
  pacienteNombre?: string;
  pacienteCedula?: string;
  odontologoId: string;
  odontologoNombre: string;
  fechaEvaluacion: string;
  dientes: Record<number, DetalleDiente>;
  indiceHigieneOral: 'Excelente' | 'Bueno' | 'Regular' | 'Deficiente';
  diagnosticoPeriodontal: string;
  planTratamiento: TratamientoDentalItem[];
  estado: 'Activo' | 'Tratamiento Finalizado';
}

// 6. Telemedicina & Interconsultas Clínicas
export interface MensajeChatClinico {
  id: string;
  remitente: 'medico' | 'paciente' | 'especialista';
  remitenteNombre: string;
  texto: string;
  fechaHora: string;
}

export interface Teleconsulta {
  id: string;
  codigoConsulta: string;
  pacienteId: string;
  pacienteNombre?: string;
  pacienteCedula?: string;
  medicoId: string;
  medicoNombre?: string;
  especialidad: string;
  fechaProgramada: string;
  horaProgramada: string;
  enlaceSalaVirtual: string;
  motivo: string;
  resumenClinico?: string;
  planTerapeutico?: string;
  estadoLlamada: 'Programada' | 'En Curso' | 'Finalizada' | 'Cancelada';
  chatMensajes: MensajeChatClinico[];
}

export interface InterconsultaMedica {
  id: string;
  codigoInterconsulta: string;
  pacienteId: string;
  pacienteNombre?: string;
  pacienteCedula?: string;
  medicoSolicitanteId: string;
  medicoSolicitanteNombre: string;
  departamentoOrigen: string;
  especialidadDestino: string;
  medicoConsultadoId?: string;
  medicoConsultadoNombre?: string;
  prioridad: 'Emergencia' | 'Alta' | 'Rutinaria';
  motivoConsulta: string;
  antecedentesRelevantes: string;
  respuestaEspecialista?: string;
  fechaSolicitud: string;
  fechaRespuesta?: string;
  estado: 'Solicitada' | 'En Revisión' | 'Respondida' | 'Cerrada';
}

// 7. Facturación, Baremos & Servicios Hospitalarios
export interface ServicioTarifa {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  descripcion?: string;
  precioBaseUSD: number;
  precioBs: number;
  exoneradoCDI?: boolean;
  estado: 'Activo' | 'Inactivo';
}

export interface ItemFactura {
  servicioId: string;
  concepto: string;
  servicioNombre?: string;
  cantidad: number;
  precioUnitarioUSD: number;
  subtotalUSD?: number;
  totalUSD: number;
}

export interface FacturaHospitalaria {
  id: string;
  numeroFactura?: string;
  codigoFactura?: string;
  pacienteId: string;
  pacienteNombre?: string;
  pacienteCedula?: string;
  fechaEmision: string;
  modalidadCobertura?: string;
  modalidadPago?: string;
  seguroNombre?: string;
  nombreAseguradora?: string;
  coberturaSeguroPorcentaje?: number;
  tasaCambioBs?: number;
  items: ItemFactura[];
  subtotalUSD?: number;
  descuentoUSD?: number;
  totalUSD: number;
  totalBs: number;
  estadoPago: 'Pagada' | 'Exonerada / 100% Cubierta' | 'Exonerado / Gratuito' | 'Pendiente' | 'Anulada' | string;
  notas?: string;
}

// 8. Auditoría Clínica & Trazabilidad (HIPAA Logs)
export interface RegistroAuditoria {
  id: string;
  fechaHora: string;
  usuarioId: string;
  nombreUsuario?: string;
  usuarioNombre?: string;
  rolNombre?: string;
  rol?: string;
  modulo: string;
  accion: 'VER' | 'CREAR' | 'EDITAR' | 'ELIMINAR' | 'EXPORTAR' | 'ACCESO_HISTORIAL' | 'DESPACHO_FARMACIA' | 'AUTORIZACION_MEDICA' | 'ACTUALIZAR' | 'CONSULTA' | string;
  detalle?: string;
  detalles?: string;
  registroId?: string;
  direccionIP?: string;
  ipAddress?: string;
  dispositivo?: string;
  userAgent?: string;
  severidad: 'INFO' | 'AVISO' | 'CRITICO';
}

// 9. Epidemiología & Vigilancia en Salud Pública
export interface CasoEpidemiologico {
  id: string;
  codigoNotificacion?: string;
  codigoCaso?: string;
  pacienteId: string;
  pacienteNombre?: string;
  pacienteCedula?: string;
  edad?: number;
  pacienteEdad?: number;
  genero?: string;
  comunidadSector?: string;
  sectorComunidad?: string;
  diagnosticoCIE10?: string;
  enfermedad?: string;
  enfermedadNotificable?: string;
  fechaNotificacion: string;
  semanaEpidemiologica: number;
  ano?: number;
  canalEndemicoZona?: string;
  estadoCaso: 'Sospechoso' | 'Probable' | 'Confirmado' | 'Descartado' | 'En Investigación' | string;
  hospitalizado?: boolean;
  clasificacionGravedad?: 'Leve' | 'Moderada' | 'Grave' | string;
  notificadoMPPS?: boolean;
  medidasTomadas?: string;
}

// 10. Nutrición & Dietética INN
export interface EvaluacionNutricional {
  id: string;
  pacienteId: string;
  pacienteNombre?: string;
  pacienteCedula?: string;
  fecha: string;
  pesoKg: number;
  tallaCm: number;
  imc: number;
  circunferenciaBrazoCm?: number;
  circunferenciaCinturaCm?: number;
  clasificacion: string;
  recomendacion?: string;
  evaluador?: string;
}

// 11. Oftalmología & Misión Milagro
export interface ConsultaOftalmica {
  id: string;
  pacienteId: string;
  pacienteNombre?: string;
  pacienteCedula?: string;
  fecha: string;
  medicoTratante?: string;
  avOD?: string;
  avOS?: string;
  pioOD: number;
  pioOS: number;
  biomicroscopia?: string;
  fondoOjo?: string;
  diagnostico: string;
  planTratamiento?: string;
}

export interface CandidatoMisionMilagro {
  id: string;
  pacienteId: string;
  pacienteNombre?: string;
  pacienteCedula?: string;
  ojo: string;
  patologia: string;
  poderLIO?: string;
  checklistLaboratorio: string;
  checklistCardio: string;
  estado: string;
  fechaJornada?: string;
}

// -------------------------------------------------------------
// ESTADO GLOBAL DE DATOS CDI
// -------------------------------------------------------------

export interface CDIDataState {
  roles: Rol[];
  usuarios: Usuario[];
  departamentos: Departamento[];
  cargos: Cargo[];
  empleados: Empleado[];
  horarios: Horario[];
  pacientes: Paciente[];
  proveedores: Proveedor[];
  medicamentos: Medicamento[];
  movimientosFarmacia: MovimientoFarmacia[];
  citas: Cita[];
  tratamientos: Tratamiento[];
  // Colecciones Nuevas Enterprise
  ordenesLaboratorio: OrdenLaboratorio[];
  estudiosImagen: EstudioImagen[];
  camasHospitalarias: CamaHospitalaria[];
  admisionesHospitalarias: AdmisionHospitalaria[];
  registrosTriaje: RegistroTriaje[];
  odontogramas: OdontogramaPaciente[];
  teleconsultas: Teleconsulta[];
  interconsultas: InterconsultaMedica[];
  serviciosTarifas: ServicioTarifa[];
  facturas: FacturaHospitalaria[];
  registrosAuditoria: RegistroAuditoria[];
  casosEpidemiologicos: CasoEpidemiologico[];
  evaluacionesNutricionales: EvaluacionNutricional[];
  consultasOftalmicas: ConsultaOftalmica[];
  candidatosMisionMilagro: CandidatoMisionMilagro[];
}

export interface KPIStats {
  totalPacientes: number;
  citasHoy: number;
  citasPendientes: number;
  medicamentosCriticos: number;
  despachosHoy: number;
  ocupacionCamasPorcentaje: number;
  empleadosActivos: number;
  turnosActivos: number;
  // Nuevos KPIs
  urgenciasActivas: number;
  laboratoriosPendientes: number;
  imagenesPendientes: number;
  pacientesHospitalizados: number;
  teleconsultasHoy: number;
  casosEpidemiologicosSemana: number;
}

