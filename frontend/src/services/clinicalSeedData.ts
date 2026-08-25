import {
  OrdenLaboratorio,
  EstudioImagen,
  CamaHospitalaria,
  AdmisionHospitalaria,
  RegistroTriaje,
  OdontogramaPaciente,
  Teleconsulta,
  InterconsultaMedica,
  ServicioTarifa,
  FacturaHospitalaria,
  RegistroAuditoria,
  CasoEpidemiologico
} from '../types';

// ============================================================================
// 1. LABORATORIO CLÍNICO Y BIOANÁLISIS (LIS)
// ============================================================================
export const initialOrdenesLaboratorio: OrdenLaboratorio[] = [
  {
    id: 'lab-1',
    codigoOrden: 'LAB-2025-0089',
    pacienteId: 'pac-1',
    pacienteNombre: 'José Gregorio Hernández Morillo',
    pacienteCedula: 'V-9874561',
    pacienteEdad: 54,
    pacienteGenero: 'Masculino',
    medicoId: 'emp-2',
    medicoNombre: 'Dr. Carlos Mendoza',
    fechaOrden: '2025-02-14 09:30',
    fechaResultado: '2025-02-14 14:15',
    prioridad: 'Rutina',
    perfil: 'Química Sanguínea General',
    muestra: 'Suero',
    bioanalistaResponsable: 'Lcda. Mariana Rivas (CBV-8942)',
    observacionesClinicas: 'Control de rutina para paciente hipertenso y diabético tipo 2.',
    codigoValidacionQR: 'CDI-LAB-VAL-9874561-0089',
    estado: 'Validado',
    resultados: [
      { parametro: 'Glucosa en Ayunas', valor: 142, unidad: 'mg/dL', rangoReferencia: '70 - 100', estado: 'Alto', observaciones: 'Glucemia basal elevada' },
      { parametro: 'Urea Sérica', valor: 38, unidad: 'mg/dL', rangoReferencia: '15 - 45', estado: 'Normal' },
      { parametro: 'Creatinina Sérica', valor: 1.1, unidad: 'mg/dL', rangoReferencia: '0.7 - 1.3', estado: 'Normal' },
      { parametro: 'Ácido Úrico', valor: 6.8, unidad: 'mg/dL', rangoReferencia: '3.4 - 7.0', estado: 'Normal' },
      { parametro: 'TGO / AST', valor: 28, unidad: 'U/L', rangoReferencia: '10 - 40', estado: 'Normal' },
      { parametro: 'TGP / ALT', valor: 32, unidad: 'U/L', rangoReferencia: '10 - 45', estado: 'Normal' },
      { parametro: 'Bilirrubina Total', valor: 0.85, unidad: 'mg/dL', rangoReferencia: '0.2 - 1.2', estado: 'Normal' }
    ]
  },
  {
    id: 'lab-2',
    codigoOrden: 'LAB-2025-0090',
    pacienteId: 'pac-2',
    pacienteNombre: 'María Corina Machado Pérez',
    pacienteCedula: 'V-15894230',
    pacienteEdad: 41,
    pacienteGenero: 'Femenino',
    medicoId: 'emp-1',
    medicoNombre: 'Dra. Elena Ramos',
    fechaOrden: '2025-02-15 08:10',
    fechaResultado: '2025-02-15 11:30',
    prioridad: 'Rutina',
    perfil: 'Hematología Completa',
    muestra: 'Sangre Total',
    bioanalistaResponsable: 'Lcda. Mariana Rivas (CBV-8942)',
    observacionesClinicas: 'Evaluación de fatiga y astenia.',
    codigoValidacionQR: 'CDI-LAB-VAL-15894230-0090',
    estado: 'Validado',
    resultados: [
      { parametro: 'Glóbulos Blancos (Leucocitos)', valor: 6.4, unidad: 'x10³/µL', rangoReferencia: '4.5 - 11.0', estado: 'Normal' },
      { parametro: 'Glóbulos Rojos (Hematíes)', valor: 4.2, unidad: 'x10⁶/µL', rangoReferencia: '4.0 - 5.2', estado: 'Normal' },
      { parametro: 'Hemoglobina', valor: 12.8, unidad: 'g/dL', rangoReferencia: '12.0 - 16.0', estado: 'Normal' },
      { parametro: 'Hematocrito', valor: 38.5, unidad: '%', rangoReferencia: '36.0 - 48.0', estado: 'Normal' },
      { parametro: 'VCM (Volumen Corpuscular Medio)', valor: 89, unidad: 'fL', rangoReferencia: '80 - 100', estado: 'Normal' },
      { parametro: 'HCM (Hemoglobina Corpuscular Media)', valor: 30.1, unidad: 'pg', rangoReferencia: '27 - 33', estado: 'Normal' },
      { parametro: 'Plaquetas', valor: 245, unidad: 'x10³/µL', rangoReferencia: '150 - 450', estado: 'Normal' },
      { parametro: 'Neutrófilos Segmentados', valor: 58, unidad: '%', rangoReferencia: '45 - 70', estado: 'Normal' },
      { parametro: 'Linfocitos', valor: 34, unidad: '%', rangoReferencia: '20 - 40', estado: 'Normal' }
    ]
  },
  {
    id: 'lab-3',
    codigoOrden: 'LAB-2025-0091',
    pacienteId: 'pac-3',
    pacienteNombre: 'Luis Alejandro Castillo Colmenares',
    pacienteCedula: 'V-23114589',
    pacienteEdad: 29,
    pacienteGenero: 'Masculino',
    medicoId: 'emp-3',
    medicoNombre: 'Dr. Roberto Gómez',
    fechaOrden: '2025-02-15 10:45',
    fechaResultado: '2025-02-15 12:20',
    prioridad: 'Urgente',
    perfil: 'Inmunología y Serología',
    muestra: 'Suero',
    bioanalistaResponsable: 'Lcda. Mariana Rivas (CBV-8942)',
    observacionesClinicas: 'Sospecha de síndrome viral / Dengue agudo (Día 3 de fiebre).',
    codigoValidacionQR: 'CDI-LAB-VAL-23114589-0091',
    estado: 'Validado',
    resultados: [
      { parametro: 'Antígeno Dengue NS1', valor: 'POSITIVO (+)', unidad: 'Cualitativo', rangoReferencia: 'Negativo', estado: 'Crítico', observaciones: 'Infección aguda temprana por Virus del Dengue' },
      { parametro: 'Anticuerpos Dengue IgM', valor: 'POSITIVO (+)', unidad: 'Cualitativo', rangoReferencia: 'Negativo', estado: 'Alto', observaciones: 'Respuesta inmune primaria activa' },
      { parametro: 'Anticuerpos Dengue IgG', valor: 'NEGATIVO (-)', unidad: 'Cualitativo', rangoReferencia: 'Negativo', estado: 'Normal' },
      { parametro: 'Proteína C Reactiva (PCR)', valor: 24.5, unidad: 'mg/L', rangoReferencia: '< 5.0', estado: 'Alto', observaciones: 'Proceso inflamatorio sistémico' }
    ]
  },
  {
    id: 'lab-4',
    codigoOrden: 'LAB-2025-0092',
    pacienteId: 'pac-4',
    pacienteNombre: 'Ana Victoria Rangel Mendoza',
    pacienteCedula: 'V-28491023',
    pacienteEdad: 22,
    pacienteGenero: 'Femenino',
    medicoId: 'emp-1',
    medicoNombre: 'Dra. Elena Ramos',
    fechaOrden: '2025-02-15 11:30',
    prioridad: 'Rutina',
    perfil: 'Uroanálisis / Orina Simple',
    muestra: 'Orina',
    bioanalistaResponsable: 'Lcda. Mariana Rivas (CBV-8942)',
    observacionesClinicas: 'Disuria y polaquiuria de 48 horas de evolución.',
    estado: 'En Proceso',
    resultados: [
      { parametro: 'Aspecto', valor: 'Ligeramente Turbio', unidad: 'Físico', rangoReferencia: 'Límpido / Transparente', estado: 'Alto' },
      { parametro: 'Color', valor: 'Amarillo Ámbar', unidad: 'Físico', rangoReferencia: 'Amarillo Claro', estado: 'Normal' },
      { parametro: 'Densidad', valor: '1.025', unidad: 'g/mL', rangoReferencia: '1.010 - 1.030', estado: 'Normal' },
      { parametro: 'pH', valor: '6.5', unidad: 'pH', rangoReferencia: '5.0 - 7.5', estado: 'Normal' },
      { parametro: 'Proteínas', valor: 'Trazas', unidad: 'Tira reactiva', rangoReferencia: 'Negativo', estado: 'Normal' },
      { parametro: 'Nitritos', valor: 'POSITIVO (+)', unidad: 'Tira reactiva', rangoReferencia: 'Negativo', estado: 'Alto' },
      { parametro: 'Leucocitos', valor: '18 - 25 por campo', unidad: 'x campo 40x', rangoReferencia: '0 - 4 por campo', estado: 'Alto', observaciones: 'Piuria significativa' },
      { parametro: 'Bacterias', valor: 'Abundantes (+++)', unidad: 'Microscopía', rangoReferencia: 'Escasas / Ausentes', estado: 'Alto' }
    ]
  },
  {
    id: 'lab-5',
    codigoOrden: 'LAB-2025-0093',
    pacienteId: 'pac-1',
    pacienteNombre: 'José Gregorio Hernández Morillo',
    pacienteCedula: 'V-9874561',
    pacienteEdad: 54,
    pacienteGenero: 'Masculino',
    medicoId: 'emp-2',
    medicoNombre: 'Dr. Carlos Mendoza',
    fechaOrden: '2025-02-15 13:00',
    prioridad: 'Rutina',
    perfil: 'Perfil Lipídico',
    muestra: 'Suero',
    bioanalistaResponsable: 'Lcda. Mariana Rivas (CBV-8942)',
    observacionesClinicas: 'Estratificación de riesgo cardiovascular global.',
    codigoValidacionQR: 'CDI-LAB-VAL-9874561-0093',
    estado: 'Validado',
    resultados: [
      { parametro: 'Colesterol Total', valor: 235, unidad: 'mg/dL', rangoReferencia: '< 200', estado: 'Alto' },
      { parametro: 'Triglicéridos', valor: 210, unidad: 'mg/dL', rangoReferencia: '< 150', estado: 'Alto' },
      { parametro: 'Colesterol HDL (Bueno)', valor: 38, unidad: 'mg/dL', rangoReferencia: '> 40', estado: 'Bajo' },
      { parametro: 'Colesterol LDL (Malo)', valor: 155, unidad: 'mg/dL', rangoReferencia: '< 100', estado: 'Alto' },
      { parametro: 'Índice de Castelli (CT/HDL)', valor: 6.18, unidad: 'Ratio', rangoReferencia: '< 4.5', estado: 'Alto', observaciones: 'Riesgo cardiovascular aumentado' }
    ]
  }
];

// ============================================================================
// 2. IMAGENOLOGÍA Y RADIOLOGÍA DIGITAL (RIS / PACS)
// ============================================================================
export const initialEstudiosImagen: EstudioImagen[] = [
  {
    id: 'img-1',
    codigoEstudio: 'RAD-2025-0034',
    pacienteId: 'pac-1',
    pacienteNombre: 'José Gregorio Hernández Morillo',
    pacienteCedula: 'V-9874561',
    medicoSolicitanteId: 'emp-2',
    medicoSolicitanteNombre: 'Dr. Carlos Mendoza',
    modalidad: 'Rayos X',
    regionAnatomica: 'Tórax Óseo y Pulmonar (Proyección PA y Lateral)',
    fechaSolicitud: '2025-02-14 10:00',
    fechaRealizacion: '2025-02-14 11:20',
    radiologoResponsable: 'Dr. Fernando Ruiz / Téc. Andrés Paredes',
    motivoEstudio: 'Evaluación cardiotorácica en paciente hipertenso crónico.',
    hallazgos: 'Silueta cardíaca en el límite superior de la normalidad con índice cardiotorácico de 0.52 sugerente de leve hipertrofia ventricular izquierda. Campos pulmonares bien ventilados sin infiltrados focales, condensaciones neumónicas ni derrames pleurales. Senos costofrénicos y cardiofrénicos libres. Trama vascular pulmonar de distribución normal.',
    impresionDiagnostica: '1. Cardiomegalia grado I / Hipertrofia ventricular izquierda incipiente. 2. Campos pulmonares sin lesiones activas.',
    clasificacionEspecial: 'Índice Cardiotorácico: 0.52',
    imagenesUrls: [
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'
    ],
    prioridad: 'Programada',
    estado: 'Informado'
  },
  {
    id: 'img-2',
    codigoEstudio: 'RAD-2025-0035',
    pacienteId: 'pac-3',
    pacienteNombre: 'Luis Alejandro Castillo Colmenares',
    pacienteCedula: 'V-23114589',
    medicoSolicitanteId: 'emp-3',
    medicoSolicitanteNombre: 'Dr. Roberto Gómez',
    modalidad: 'Ecografía / Ultrasonido',
    regionAnatomica: 'Abdomen Superior e Hipocondrio Derecho',
    fechaSolicitud: '2025-02-15 09:15',
    fechaRealizacion: '2025-02-15 10:00',
    radiologoResponsable: 'Dr. Fernando Ruiz (Especialista en Diagnóstico por Imágenes)',
    motivoEstudio: 'Dolor en epigastrio y náuseas. Descarte de colelitiasis.',
    hallazgos: 'Hígado de forma y situación habitual, con incremento difuso de la ecogenicidad compatible con esteatosis hepática moderada (Grado II). No se aprecian lesiones focales ocupantes de espacio. Vesícula biliar distendida, de paredes finas y regulares (2.1 mm), lumen anecoico sin evidencia de litiasis ni barro biliar. Vía biliar intra y extrahepática de calibre normal. Páncreas y bazo de características ecográficas conservadas.',
    impresionDiagnostica: '1. Esteatosis Hepática Difusa Grado II. 2. Vesícula biliar alitiásica sin signos de colecistitis.',
    clasificacionEspecial: 'Esteatosis Hepática Grado II',
    imagenesUrls: [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
    ],
    prioridad: 'Urgente',
    estado: 'Informado'
  },
  {
    id: 'img-3',
    codigoEstudio: 'RAD-2025-0036',
    pacienteId: 'pac-1',
    pacienteNombre: 'José Gregorio Hernández Morillo',
    pacienteCedula: 'V-9874561',
    medicoSolicitanteId: 'emp-2',
    medicoSolicitanteNombre: 'Dr. Carlos Mendoza',
    modalidad: 'Electrocardiograma (ECG)',
    regionAnatomica: 'ECG Estándar de 12 Derivaciones',
    fechaSolicitud: '2025-02-15 09:00',
    fechaRealizacion: '2025-02-15 09:20',
    radiologoResponsable: 'Dr. Carlos Mendoza (Cardiólogo)',
    motivoEstudio: 'Chequeo cardiológico anual.',
    hallazgos: 'Ritmo sinusal regular. Frecuencia cardíaca en 72 latidos por minuto. Onda P de morfología normal (80 ms). Intervalo PR de 160 ms. Complejo QRS de 90 ms con eje eléctrico en +45°. Criterios de voltaje de Sokolow-Lyon positivos (SV1 + RV5 = 37 mm) compatibles con hipertrofia ventricular izquierda. Segmento ST isoeléctrico sin elevación ni infradesnivel patológico. Ondas T positivas asimétricas.',
    impresionDiagnostica: 'Ritmo Sinusal a 72 lpm. Signos electrocardiográficos de Sobrecarga Sistólica e Hipertrofia Ventricular Izquierda (HVI). Sin isquemia aguda.',
    clasificacionEspecial: 'Sokolow-Lyon: 37 mm (+)',
    imagenesUrls: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'
    ],
    prioridad: 'Programada',
    estado: 'Informado'
  },
  {
    id: 'img-4',
    codigoEstudio: 'RAD-2025-0037',
    pacienteId: 'pac-4',
    pacienteNombre: 'Ana Victoria Rangel Mendoza',
    pacienteCedula: 'V-28491023',
    medicoSolicitanteId: 'emp-1',
    medicoSolicitanteNombre: 'Dra. Elena Ramos',
    modalidad: 'Tomografía Axial (TAC)',
    regionAnatomica: 'Cráneo Simple',
    fechaSolicitud: '2025-02-15 12:00',
    radiologoResponsable: 'Dr. Fernando Ruiz',
    motivoEstudio: 'Cefalea intensa refractaria y antecedente de traumatismo menor.',
    hallazgos: 'En proceso de adquisición y reconstrucción tomográfica.',
    impresionDiagnostica: 'Estudio pendiente de informe radiológico definitivo.',
    imagenesUrls: [],
    prioridad: 'Urgente',
    estado: 'Pendiente'
  }
];

// ============================================================================
// 3. HOSPITALIZACIÓN, CENSO Y GESTIÓN DE CAMAS
// ============================================================================
export const initialCamasHospitalarias: CamaHospitalaria[] = [
  {
    id: 'cam-1',
    codigoCama: 'OBS-01',
    departamentoId: 'dep-1',
    departamentoNombre: 'Emergencia y Triaje',
    salaNombre: 'Sala de Observación A',
    tipoCama: 'Observación Urgencias',
    estado: 'Ocupada',
    pacienteActualId: 'pac-3',
    pacienteActualNombre: 'Luis Alejandro Castillo Colmenares',
    pacienteCedula: 'V-23114589',
    fechaIngreso: '2025-02-15 08:30',
    medicoTratante: 'Dr. Roberto Gómez',
    diagnosticoActual: 'Dengue clásico con dolor abdominal en estudio'
  },
  {
    id: 'cam-2',
    codigoCama: 'OBS-02',
    departamentoId: 'dep-1',
    departamentoNombre: 'Emergencia y Triaje',
    salaNombre: 'Sala de Observación A',
    tipoCama: 'Observación Urgencias',
    estado: 'Disponible'
  },
  {
    id: 'cam-3',
    codigoCama: 'OBS-03',
    departamentoId: 'dep-1',
    departamentoNombre: 'Emergencia y Triaje',
    salaNombre: 'Sala de Observación A',
    tipoCama: 'Observación Urgencias',
    estado: 'En Limpieza'
  },
  {
    id: 'cam-4',
    codigoCama: 'MED-01',
    departamentoId: 'dep-2',
    departamentoNombre: 'Medicina General y Hospitalización',
    salaNombre: 'Pabellón Medicina Interna',
    tipoCama: 'General Adulto',
    estado: 'Ocupada',
    pacienteActualId: 'pac-1',
    pacienteActualNombre: 'José Gregorio Hernández Morillo',
    pacienteCedula: 'V-9874561',
    fechaIngreso: '2025-02-14 16:00',
    medicoTratante: 'Dr. Carlos Mendoza',
    diagnosticoActual: 'Crisis hipertensiva en descenso / Descompensación metabólica'
  },
  {
    id: 'cam-5',
    codigoCama: 'MED-02',
    departamentoId: 'dep-2',
    departamentoNombre: 'Medicina General y Hospitalización',
    salaNombre: 'Pabellón Medicina Interna',
    tipoCama: 'General Adulto',
    estado: 'Disponible'
  },
  {
    id: 'cam-6',
    codigoCama: 'MED-03',
    departamentoId: 'dep-2',
    departamentoNombre: 'Medicina General y Hospitalización',
    salaNombre: 'Pabellón Medicina Interna',
    tipoCama: 'General Adulto',
    estado: 'Disponible'
  },
  {
    id: 'cam-7',
    codigoCama: 'MED-04',
    departamentoId: 'dep-2',
    departamentoNombre: 'Medicina General y Hospitalización',
    salaNombre: 'Pabellón Medicina Interna',
    tipoCama: 'General Adulto',
    estado: 'Mantenimiento'
  },
  {
    id: 'cam-8',
    codigoCama: 'UCI-01',
    departamentoId: 'dep-3',
    departamentoNombre: 'Cardiología y Cuidados Críticos',
    salaNombre: 'Unidad de Terapia Intensiva',
    tipoCama: 'Cuidados Intensivos (UCI)',
    estado: 'Disponible'
  },
  {
    id: 'cam-9',
    codigoCama: 'UCI-02',
    departamentoId: 'dep-3',
    departamentoNombre: 'Cardiología y Cuidados Críticos',
    salaNombre: 'Unidad de Terapia Intensiva',
    tipoCama: 'Cuidados Intensivos (UCI)',
    estado: 'Disponible'
  },
  {
    id: 'cam-10',
    codigoCama: 'AIS-01',
    departamentoId: 'dep-1',
    departamentoNombre: 'Emergencia y Triaje',
    salaNombre: 'Módulo de Aislamiento',
    tipoCama: 'Aislamiento Respiratorio',
    estado: 'Disponible'
  },
  {
    id: 'cam-11',
    codigoCama: 'TS-01',
    departamentoId: 'dep-1',
    departamentoNombre: 'Emergencia y Triaje',
    salaNombre: 'Trauma Shock / Reanimación',
    tipoCama: 'Trauma Shock',
    estado: 'Disponible'
  },
  {
    id: 'cam-12',
    codigoCama: 'TS-02',
    departamentoId: 'dep-1',
    departamentoNombre: 'Emergencia y Triaje',
    salaNombre: 'Trauma Shock / Reanimación',
    tipoCama: 'Trauma Shock',
    estado: 'Disponible'
  }
];

export const initialAdmisionesHospitalarias: AdmisionHospitalaria[] = [
  {
    id: 'adm-1',
    codigoAdmision: 'ADM-2025-0012',
    pacienteId: 'pac-1',
    pacienteNombre: 'José Gregorio Hernández Morillo',
    pacienteCedula: 'V-9874561',
    camaId: 'cam-4',
    camaCodigo: 'MED-01',
    salaNombre: 'Pabellón Medicina Interna',
    fechaIngreso: '2025-02-14 16:00',
    fechaAltaEstimada: '2025-02-17',
    diagnosticoIngreso: 'I10 - Emergencia Hipertensiva tipo Urgencia / Hiperglucemia reactiva',
    medicoTratanteId: 'emp-2',
    medicoTratanteNombre: 'Dr. Carlos Mendoza',
    estado: 'Ingresado',
    notasEvolucionSOAP: [
      {
        id: 'soap-1',
        fechaHora: '2025-02-14 20:00',
        medicoNombre: 'Dr. Carlos Mendoza',
        subjetivo: 'Paciente refiere disminución progresiva de la cefalea holocraneana. Niega visión borrosa, acúfenos o dolor torácico.',
        objetivo: 'Paciente consciente, orientado en tiempo, espacio y persona. Ruidos cardíacos rítmicos normofonéticos sin soplos. Murmullo vesicular conservado en ambos hemitórax.',
        analisis: 'Evolución clínica favorable tras inicio de terapia antihipertensiva oral combinada y reposo.',
        plan: '1. Mantener Losartán 50mg VO c/12h. 2. Dieta hiposódica estricta. 3. Monitorización de PA cada 4 horas. 4. Control de glucemia preprandial.',
        signosVitales: { pa: '135/85 mmHg', fc: 74, fr: 18, temp: 36.6, spo2: 98 }
      },
      {
        id: 'soap-2',
        fechaHora: '2025-02-15 08:30',
        medicoNombre: 'Dr. Carlos Mendoza',
        subjetivo: 'Paciente durmió bien durante la noche, asintomático cardiovascular.',
        objetivo: 'PA 130/80 mmHg, FC 70 lpm, afebril. Glucemia en ayunas 142 mg/dL. Buena diuresis.',
        analisis: 'Cifras tensionales controladas dentro de metas de seguridad.',
        plan: 'Continuar plan actual. Valorar alta médica en 24-48 horas con récipe y cita en consulta externa.',
        signosVitales: { pa: '130/80 mmHg', fc: 70, fr: 16, temp: 36.5, spo2: 98 }
      }
    ],
    ordenesEnfermeria: [
      { id: 'ord-1', fechaHora: '2025-02-14 16:30', enfermeroNombre: 'Lic. Patricia Silva', indicacion: 'Losartán 50 mg vía oral', via: 'Oral', horario: '08:00 - 20:00', estado: 'Cumplida' },
      { id: 'ord-2', fechaHora: '2025-02-14 16:30', enfermeroNombre: 'Lic. Patricia Silva', indicacion: 'Control de Signos Vitales y Escala de Bristol', via: 'Monitorización', horario: 'Cada 4 Horas', estado: 'Cumplida' },
      { id: 'ord-3', fechaHora: '2025-02-15 08:00', enfermeroNombre: 'Lic. Patricia Silva', indicacion: 'Glucemia capilar matutina en ayunas', via: 'Capilar', horario: '07:00 AM', estado: 'Cumplida' }
    ]
  },
  {
    id: 'adm-2',
    codigoAdmision: 'ADM-2025-0013',
    pacienteId: 'pac-3',
    pacienteNombre: 'Luis Alejandro Castillo Colmenares',
    pacienteCedula: 'V-23114589',
    camaId: 'cam-1',
    camaCodigo: 'OBS-01',
    salaNombre: 'Sala de Observación A',
    fechaIngreso: '2025-02-15 08:30',
    diagnosticoIngreso: 'A90 - Dengue sin signos de alarma en observación / Hidratación parenteral',
    medicoTratanteId: 'emp-3',
    medicoTratanteNombre: 'Dr. Roberto Gómez',
    estado: 'En Observación',
    notasEvolucionSOAP: [
      {
        id: 'soap-3',
        fechaHora: '2025-02-15 09:00',
        medicoNombre: 'Dr. Roberto Gómez',
        subjetivo: 'Paciente con cuadro febril de 72 horas, mialgias intensas y leve dolor abdominal difuso.',
        objetivo: 'Paciente hidratado, facies febril. Abdomen blando, depresible, no dolor a la descompresión. Plaquetas en 210,000.',
        analisis: 'Dengue serológicamente confirmado (NS1 +). Requiere observación estrecha de hematocrito y signos de alarma.',
        plan: '1. Solución Fisiológica 0.9% 1000cc a 80 cc/hora. 2. Paracetamol 500mg VO si temp > 38.5°C. 3. Repetir hematología en 12 horas.',
        signosVitales: { pa: '115/75 mmHg', fc: 88, fr: 19, temp: 38.2, spo2: 97 }
      }
    ],
    ordenesEnfermeria: [
      { id: 'ord-4', fechaHora: '2025-02-15 09:15', enfermeroNombre: 'Lic. Patricia Silva', indicacion: 'Solución Fisiológica 0.9% EV a goteo continuo', via: 'Intravenosa', horario: 'Continuo', estado: 'Cumplida' },
      { id: 'ord-5', fechaHora: '2025-02-15 09:15', enfermeroNombre: 'Lic. Patricia Silva', indicacion: 'Paracetamol 500mg VO condicional a fiebre', via: 'Oral', horario: 'PRN', estado: 'Cumplida' }
    ]
  }
];

// ============================================================================
// 4. TRIAJE DE URGENCIAS Y SISTEMA DE ALERTA TEMPRANA NEWS2
// ============================================================================
export const initialRegistrosTriaje: RegistroTriaje[] = [
  {
    id: 'tri-1',
    codigoTriaje: 'TRJ-2025-0145',
    pacienteId: 'pac-3',
    pacienteNombre: 'Luis Alejandro Castillo Colmenares',
    pacienteCedula: 'V-23114589',
    fechaHora: '2025-02-15 08:15',
    enfermeroTriaje: 'Lic. Patricia Silva',
    nivelTriaje: 'Nivel 3 - Urgencia (Amarillo)',
    signosVitales: {
      pas: 115,
      pad: 75,
      fc: 88,
      fr: 19,
      spo2: 97,
      oxigenoSuplementario: false,
      temperatura: 38.2,
      escalaAVPU: 'Alerta (A)',
      escalaDolorEva: 6
    },
    scoreNEWS2: 2,
    nivelRiesgoNEWS2: 'Bajo (0-4)',
    motivoUrgencia: 'Fiebre alta persistente, dolor retroocular y mialgias generalizadas.',
    destinoRecomendado: 'Observación',
    tiempoEsperaMinutos: 15,
    estado: 'Hospitalizado'
  },
  {
    id: 'tri-2',
    codigoTriaje: 'TRJ-2025-0146',
    pacienteId: 'pac-4',
    pacienteNombre: 'Ana Victoria Rangel Mendoza',
    pacienteCedula: 'V-28491023',
    fechaHora: '2025-02-15 10:20',
    enfermeroTriaje: 'Lic. Patricia Silva',
    nivelTriaje: 'Nivel 4 - Menor (Verde)',
    signosVitales: {
      pas: 110,
      pad: 70,
      fc: 76,
      fr: 16,
      spo2: 99,
      oxigenoSuplementario: false,
      temperatura: 36.8,
      escalaAVPU: 'Alerta (A)',
      escalaDolorEva: 4
    },
    scoreNEWS2: 0,
    nivelRiesgoNEWS2: 'Bajo (0-4)',
    motivoUrgencia: 'Disuria y ardor miccional sin fiebre ni compromiso sistémico.',
    destinoRecomendado: 'Consulta de Urgencias',
    tiempoEsperaMinutos: 25,
    estado: 'En Atención'
  },
  {
    id: 'tri-3',
    codigoTriaje: 'TRJ-2025-0147',
    pacienteId: 'pac-2',
    pacienteNombre: 'María Corina Machado Pérez',
    pacienteCedula: 'V-15894230',
    fechaHora: '2025-02-15 11:00',
    enfermeroTriaje: 'Lic. Patricia Silva',
    nivelTriaje: 'Nivel 2 - Emergencia (Naranja)',
    signosVitales: {
      pas: 175,
      pad: 105,
      fc: 102,
      fr: 22,
      spo2: 95,
      oxigenoSuplementario: false,
      temperatura: 37.1,
      escalaAVPU: 'Alerta (A)',
      escalaDolorEva: 7
    },
    scoreNEWS2: 5,
    nivelRiesgoNEWS2: 'Medio (5-6 / Monoparámetro 3)',
    motivoUrgencia: 'Cefalea pulsátil de inicio brusco y cifras tensionales severas.',
    destinoRecomendado: 'Observación',
    tiempoEsperaMinutos: 5,
    estado: 'En Espera'
  }
];

// ============================================================================
// 5. ODONTOLOGÍA Y ODONTOGRAMA ANATÓMICO (FDI)
// ============================================================================
export const initialOdontogramas: OdontogramaPaciente[] = [
  {
    id: 'odo-1',
    pacienteId: 'pac-2',
    pacienteNombre: 'María Corina Machado Pérez',
    pacienteCedula: 'V-15894230',
    odontologoId: 'emp-9',
    odontologoNombre: 'Dra. Valeria Fuentes (Odontóloga Integral)',
    fechaEvaluacion: '2025-02-10',
    indiceHigieneOral: 'Bueno',
    diagnosticoPeriodontal: 'Gingivitis marginal inducida por placa bacteriana en sector anteroinferior. Sin pérdida de inserción ósea.',
    estado: 'Activo',
    dientes: {
      18: { numeroDiente: 18, estadoGeneral: 'Ausente', caras: {} },
      17: { numeroDiente: 17, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      16: { numeroDiente: 16, estadoGeneral: 'Sano', caras: { oclusal: 'Obturacion Resina', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      15: { numeroDiente: 15, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      14: { numeroDiente: 14, estadoGeneral: 'Sano', caras: { oclusal: 'Caries', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' }, notas: 'Caries de esmalte y dentina superficial' },
      13: { numeroDiente: 13, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      12: { numeroDiente: 12, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      11: { numeroDiente: 11, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Obturacion Resina', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      21: { numeroDiente: 21, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      22: { numeroDiente: 22, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      23: { numeroDiente: 23, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      24: { numeroDiente: 24, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      25: { numeroDiente: 25, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      26: { numeroDiente: 26, estadoGeneral: 'Corona', caras: { oclusal: 'Obturacion Resina', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' }, notas: 'Corona metal-porcelana adaptada' },
      27: { numeroDiente: 27, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      28: { numeroDiente: 28, estadoGeneral: 'Ausente', caras: {} },
      38: { numeroDiente: 38, estadoGeneral: 'Ausente', caras: {} },
      37: { numeroDiente: 37, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      36: { numeroDiente: 36, estadoGeneral: 'Endodoncia', caras: { oclusal: 'Obturacion Resina', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' }, notas: 'Tratamiento de conducto satisfactorio' },
      35: { numeroDiente: 35, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      34: { numeroDiente: 34, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      33: { numeroDiente: 33, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      32: { numeroDiente: 32, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      31: { numeroDiente: 31, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      41: { numeroDiente: 41, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      42: { numeroDiente: 42, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      43: { numeroDiente: 43, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      44: { numeroDiente: 44, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      45: { numeroDiente: 45, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      46: { numeroDiente: 46, estadoGeneral: 'Sano', caras: { oclusal: 'Caries', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' }, notas: 'Foseta oclusal pigmentada con reblandecimiento' },
      47: { numeroDiente: 47, estadoGeneral: 'Sano', caras: { oclusal: 'Sana', vestibular: 'Sana', lingual: 'Sana', mesial: 'Sana', distal: 'Sana' } },
      48: { numeroDiente: 48, estadoGeneral: 'Ausente', caras: {} }
    },
    planTratamiento: [
      { id: 'td-1', dienteNumero: 14, procedimiento: 'Restauración con Resina Fotocurada (1 superficie)', costoEstimadoUSD: 15, estado: 'Planificado' },
      { id: 'td-2', dienteNumero: 46, procedimiento: 'Restauración con Resina Fotocurada (Oclusal)', costoEstimadoUSD: 15, estado: 'Planificado' },
      { id: 'td-3', procedimiento: 'Profilaxis Dental y Destartraje Ultrasónico General', costoEstimadoUSD: 10, estado: 'Planificado' }
    ]
  }
];

// ============================================================================
// 6. TELEMEDICINA E INTERCONSULTAS CLÍNICAS
// ============================================================================
export const initialTeleconsultas: Teleconsulta[] = [
  {
    id: 'tel-1',
    codigoConsulta: 'TEL-2025-0019',
    pacienteId: 'pac-2',
    pacienteNombre: 'María Corina Machado Pérez',
    pacienteCedula: 'V-15894230',
    medicoId: 'emp-1',
    medicoNombre: 'Dra. Elena Ramos',
    especialidad: 'Medicina General y Preventiva',
    fechaProgramada: '2025-02-16',
    horaProgramada: '15:30',
    enlaceSalaVirtual: 'https://cdi-salud.telemed/sala-pac-2-0019',
    motivo: 'Revisión y ajuste de resultados de laboratorio de hematología.',
    resumenClinico: 'Paciente en seguimiento ambulatorio. Se evalúa reporte de laboratorio sin alteraciones relevantes.',
    planTerapeutico: 'Recomendaciones nutricionales con ingesta adecuada de hierro vegetal y animal. Próxima evaluación en 6 meses.',
    estadoLlamada: 'Programada',
    chatMensajes: [
      { id: 'msg-1', remitente: 'medico', remitenteNombre: 'Dra. Elena Ramos', texto: 'Buenas tardes María, bienvenida a la sala virtual del CDI. Ya tengo tus resultados de laboratorio en pantalla.', fechaHora: '2025-02-16 15:31' },
      { id: 'msg-2', remitente: 'paciente', remitenteNombre: 'María Machado', texto: 'Buenas tardes Dra. Ramos, muchas gracias. Quería saber si los niveles de hemoglobina están bien.', fechaHora: '2025-02-16 15:32' },
      { id: 'msg-3', remitente: 'medico', remitenteNombre: 'Dra. Elena Ramos', texto: 'Sí, tu hemoglobina está en 12.8 g/dL, perfectamente dentro del rango normal para tu edad. No hay signos de anemia.', fechaHora: '2025-02-16 15:33' }
    ]
  }
];

export const initialInterconsultas: InterconsultaMedica[] = [
  {
    id: 'int-1',
    codigoInterconsulta: 'ITC-2025-0008',
    pacienteId: 'pac-1',
    pacienteNombre: 'José Gregorio Hernández Morillo',
    pacienteCedula: 'V-9874561',
    medicoSolicitanteId: 'emp-1',
    medicoSolicitanteNombre: 'Dra. Elena Ramos',
    departamentoOrigen: 'Medicina General',
    especialidadDestino: 'Cardiología',
    medicoConsultadoId: 'emp-2',
    medicoConsultadoNombre: 'Dr. Carlos Mendoza',
    prioridad: 'Alta',
    motivoConsulta: 'Paciente masculino de 54 años con cifras tensionales de difícil control y sospecha de HVI en ECG.',
    antecedentesRelevantes: 'Hipertensión arterial estadio II de 8 años de evolución, Diabetes Mellitus Tipo 2.',
    respuestaEspecialista: 'Evaluado paciente en conjunto con reporte de Rayos X de tórax y ECG. Se confirma patrón de hipertrofia ventricular concéntrica leve. Sugiero asociar Amlodipino 5mg VO/día al esquema de Losartán 50mg c/12h y solicitar ecocardiograma transtorácico Doppler.',
    fechaSolicitud: '2025-02-14 11:00',
    fechaRespuesta: '2025-02-14 15:30',
    estado: 'Respondida'
  }
];

// ============================================================================
// 7. FACTURACIÓN, BAREMOS Y SERVICIOS HOSPITALARIOS
// ============================================================================
export const initialServiciosTarifas: ServicioTarifa[] = [
  { id: 'srv-1', codigo: 'SRV-001', nombre: 'Consulta Médica General / Triaje', categoria: 'Consulta Médica', precioBaseUSD: 10, precioBs: 550, estado: 'Activo' },
  { id: 'srv-2', codigo: 'SRV-002', nombre: 'Consulta Médica Especializada (Cardiología)', categoria: 'Consulta Médica', precioBaseUSD: 20, precioBs: 1100, estado: 'Activo' },
  { id: 'srv-3', codigo: 'SRV-003', nombre: 'Hematología Completa Automatizada', categoria: 'Laboratorio', precioBaseUSD: 8, precioBs: 440, estado: 'Activo' },
  { id: 'srv-4', codigo: 'SRV-004', nombre: 'Perfil Bioquímico (Glicemia, Urea, Creatinina, Ácido Úrico)', categoria: 'Laboratorio', precioBaseUSD: 12, precioBs: 660, estado: 'Activo' },
  { id: 'srv-5', codigo: 'SRV-005', nombre: 'Perfil Lipídico Completo', categoria: 'Laboratorio', precioBaseUSD: 10, precioBs: 550, estado: 'Activo' },
  { id: 'srv-6', codigo: 'SRV-006', nombre: 'Uroanálisis / Examen General de Orina', categoria: 'Laboratorio', precioBaseUSD: 5, precioBs: 275, estado: 'Activo' },
  { id: 'srv-7', codigo: 'SRV-007', nombre: 'Prueba Serológica Dengue NS1 / IgM / IgG', categoria: 'Laboratorio', precioBaseUSD: 15, precioBs: 825, estado: 'Activo' },
  { id: 'srv-8', codigo: 'SRV-008', nombre: 'Radiografía de Tórax Digital (PA y Lateral)', categoria: 'Imagenología', precioBaseUSD: 18, precioBs: 990, estado: 'Activo' },
  { id: 'srv-9', codigo: 'SRV-009', nombre: 'Ecografía Abdominal Superior Integral', categoria: 'Imagenología', precioBaseUSD: 25, precioBs: 1375, estado: 'Activo' },
  { id: 'srv-10', codigo: 'SRV-010', nombre: 'Electrocardiograma de 12 Derivaciones con Informe', categoria: 'Imagenología', precioBaseUSD: 12, precioBs: 660, estado: 'Activo' },
  { id: 'srv-11', codigo: 'SRV-011', nombre: 'Tomografía Axial Computarizada (TAC) Cráneo Simple', categoria: 'Imagenología', precioBaseUSD: 65, precioBs: 3575, estado: 'Activo' },
  { id: 'srv-12', codigo: 'SRV-012', nombre: 'Día Cama - Sala de Observación de Urgencias', categoria: 'Hospitalización', precioBaseUSD: 20, precioBs: 1100, estado: 'Activo' },
  { id: 'srv-13', codigo: 'SRV-013', nombre: 'Día Cama - Hospitalización General Medicina Interna', categoria: 'Hospitalización', precioBaseUSD: 35, precioBs: 1925, estado: 'Activo' },
  { id: 'srv-14', codigo: 'SRV-014', nombre: 'Profilaxis y Limpieza Dental Ultrasónica', categoria: 'Odontología', precioBaseUSD: 12, precioBs: 660, estado: 'Activo' },
  { id: 'srv-15', codigo: 'SRV-015', nombre: 'Restauración Estética con Resina Fotocurada', categoria: 'Odontología', precioBaseUSD: 15, precioBs: 825, estado: 'Activo' }
];

export const initialFacturas: FacturaHospitalaria[] = [
  {
    id: 'fac-1',
    numeroFactura: 'FAC-2025-00412',
    pacienteId: 'pac-1',
    pacienteNombre: 'José Gregorio Hernández Morillo',
    pacienteCedula: 'V-9874561',
    fechaEmision: '2025-02-14',
    modalidadCobertura: 'CDI Gratuito (Sistema Público)',
    subtotalUSD: 85,
    descuentoUSD: 85,
    totalUSD: 0,
    totalBs: 0,
    estadoPago: 'Exonerada / 100% Cubierta',
    notas: 'Atención 100% gratuita por el Sistema Nacional Público de Salud (Misión Barrio Adentro / CDI).',
    items: [
      { servicioId: 'srv-2', concepto: 'Consulta Médica Especializada (Cardiología)', cantidad: 1, precioUnitarioUSD: 20, totalUSD: 20 },
      { servicioId: 'srv-4', concepto: 'Perfil Bioquímico General', cantidad: 1, precioUnitarioUSD: 12, totalUSD: 12 },
      { servicioId: 'srv-8', concepto: 'Radiografía de Tórax Digital', cantidad: 1, precioUnitarioUSD: 18, totalUSD: 18 },
      { servicioId: 'srv-13', concepto: 'Día Cama Hospitalización Medicina Interna', cantidad: 1, precioUnitarioUSD: 35, totalUSD: 35 }
    ]
  },
  {
    id: 'fac-2',
    numeroFactura: 'FAC-2025-00413',
    pacienteId: 'pac-3',
    pacienteNombre: 'Luis Alejandro Castillo Colmenares',
    pacienteCedula: 'V-23114589',
    fechaEmision: '2025-02-15',
    modalidadCobertura: 'CDI Gratuito (Sistema Público)',
    subtotalUSD: 50,
    descuentoUSD: 50,
    totalUSD: 0,
    totalBs: 0,
    estadoPago: 'Exonerada / 100% Cubierta',
    notas: 'Cobertura Integral Gratuita CDI.',
    items: [
      { servicioId: 'srv-1', concepto: 'Atención de Emergencia y Triaje', cantidad: 1, precioUnitarioUSD: 10, totalUSD: 10 },
      { servicioId: 'srv-7', concepto: 'Prueba Serológica Dengue NS1 / IgM', cantidad: 1, precioUnitarioUSD: 15, totalUSD: 15 },
      { servicioId: 'srv-9', concepto: 'Ecografía Abdominal de Urgencia', cantidad: 1, precioUnitarioUSD: 25, totalUSD: 25 }
    ]
  }
];

// ============================================================================
// 8. AUDITORÍA CLÍNICA Y SEGURIDAD (HIPAA AUDIT LOG)
// ============================================================================
export const initialRegistrosAuditoria: RegistroAuditoria[] = [
  {
    id: 'aud-1',
    fechaHora: '2025-02-15 08:30:14',
    usuarioId: 'usr-1',
    nombreUsuario: 'admin',
    rolNombre: 'Administrador',
    modulo: 'usuarios',
    accion: 'VER',
    detalle: 'Consulta del listado general de usuarios y auditoría de permisos',
    direccionIP: '192.168.1.10',
    dispositivo: 'PC Escritorio (Windows / Chrome)',
    severidad: 'INFO'
  },
  {
    id: 'aud-2',
    fechaHora: '2025-02-15 09:15:22',
    usuarioId: 'usr-2',
    nombreUsuario: 'dr.carlos',
    rolNombre: 'Médico',
    modulo: 'pacientes',
    accion: 'ACCESO_HISTORIAL',
    detalle: 'Apertura de Expediente Clínico de José Gregorio Hernández (V-9874561)',
    direccionIP: '192.168.1.24',
    dispositivo: 'Tablet Consultorio 2 (Android / PWA)',
    severidad: 'INFO'
  },
  {
    id: 'aud-3',
    fechaHora: '2025-02-15 09:40:05',
    usuarioId: 'usr-2',
    nombreUsuario: 'dr.carlos',
    rolNombre: 'Médico',
    modulo: 'tratamientos',
    accion: 'CREAR',
    detalle: 'Emisión de Récipe y Prescripción Médica TRAT-2025-0045',
    direccionIP: '192.168.1.24',
    dispositivo: 'Tablet Consultorio 2 (Android / PWA)',
    severidad: 'INFO'
  },
  {
    id: 'aud-4',
    fechaHora: '2025-02-15 10:12:44',
    usuarioId: 'usr-5',
    nombreUsuario: 'farm.luisana',
    rolNombre: 'Farmacéutico/a',
    modulo: 'farmacia',
    accion: 'DESPACHO_FARMACIA',
    detalle: 'Despacho de medicamentos a paciente según tratamiento TRAT-2025-0045 (Losartán 50mg)',
    direccionIP: '192.168.1.45',
    dispositivo: 'PC Farmacia Central (Linux / Firefox)',
    severidad: 'INFO'
  },
  {
    id: 'aud-5',
    fechaHora: '2025-02-15 11:30:10',
    usuarioId: 'usr-7',
    nombreUsuario: 'bio.mariana',
    rolNombre: 'Bioanalista',
    modulo: 'laboratorio',
    accion: 'EDITAR',
    detalle: 'Validación técnica y firma electrónica de resultados orden LAB-2025-0091 (Dengue NS1 Positivo)',
    direccionIP: '192.168.1.30',
    dispositivo: 'Terminal Laboratorio (Windows)',
    severidad: 'AVISO'
  }
];

// ============================================================================
// 9. EPIDEMIOLOGÍA Y VIGILANCIA EN SALUD PÚBLICA (EPI-12)
// ============================================================================
export const initialCasosEpidemiologicos: CasoEpidemiologico[] = [
  {
    id: 'epi-1',
    codigoNotificacion: 'EPI-2025-W07-001',
    pacienteId: 'pac-3',
    pacienteNombre: 'Luis Alejandro Castillo Colmenares',
    pacienteCedula: 'V-23114589',
    edad: 29,
    genero: 'Masculino',
    comunidadSector: 'Sector 23 de Enero, Bloque 4',
    diagnosticoCIE10: 'A90 - Dengue sin signos de alarma',
    enfermedadNotificable: 'Dengue',
    fechaNotificacion: '2025-02-15',
    semanaEpidemiologica: 7,
    estadoCaso: 'Confirmado',
    hospitalizado: true,
    clasificacionGravedad: 'Moderada'
  },
  {
    id: 'epi-2',
    codigoNotificacion: 'EPI-2025-W07-002',
    pacienteId: 'pac-1',
    pacienteNombre: 'José Gregorio Hernández Morillo',
    pacienteCedula: 'V-9874561',
    edad: 54,
    genero: 'Masculino',
    comunidadSector: 'Sector San Bernardino, Calle Los Rosales',
    diagnosticoCIE10: 'I10 - Hipertensión arterial descompensada',
    enfermedadNotificable: 'Hipertensión / Cardiopatía',
    fechaNotificacion: '2025-02-14',
    semanaEpidemiologica: 7,
    estadoCaso: 'Confirmado',
    hospitalizado: true,
    clasificacionGravedad: 'Moderada'
  },
  {
    id: 'epi-3',
    codigoNotificacion: 'EPI-2025-W07-003',
    pacienteId: 'pac-4',
    pacienteNombre: 'Ana Victoria Rangel Mendoza',
    pacienteCedula: 'V-28491023',
    edad: 22,
    genero: 'Femenino',
    comunidadSector: 'Sector El Paraíso, Edf. Centenario',
    diagnosticoCIE10: 'J06.9 - Infección aguda de las vías respiratorias superiores',
    enfermedadNotificable: 'Infección Respiratoria Aguda',
    fechaNotificacion: '2025-02-13',
    semanaEpidemiologica: 7,
    estadoCaso: 'Confirmado',
    hospitalizado: false,
    clasificacionGravedad: 'Leve'
  },
  {
    id: 'epi-4',
    codigoNotificacion: 'EPI-2025-W07-004',
    pacienteId: 'pac-2',
    pacienteNombre: 'María Corina Machado Pérez',
    pacienteCedula: 'V-15894230',
    edad: 41,
    genero: 'Femenino',
    comunidadSector: 'Urb. Cumbres de Curumo, Calle B',
    diagnosticoCIE10: 'E11 - Diabetes Mellitus Tipo 2 en control',
    enfermedadNotificable: 'Diabetes Mellitus',
    fechaNotificacion: '2025-02-12',
    semanaEpidemiologica: 7,
    estadoCaso: 'Confirmado',
    hospitalizado: false,
    clasificacionGravedad: 'Leve'
  }
];
