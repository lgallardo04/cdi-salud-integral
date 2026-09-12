import { 
  CitaNutricionDTO, 
  EvaluacionAntropometricaDTO, 
  DiagnosticoNutricionalResult,
  PlanAlimentarioDTO,
  EntregaSuplementoDTO 
} from './nutrition.types';

// Interfaz para la abstracción del Pool de base de datos relacional (PostgreSQL / pg)
export interface IDatabaseClient {
  query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }>;
}

export class NutritionService {
  constructor(private db: IDatabaseClient) {}

  /**
   * 1. GESTIÓN Y ASIGNACIÓN DE CITAS
   */
  async agendarCita(data: CitaNutricionDTO) {
    // Validar disponibilidad de cupos por turno (ej. máx 15 pacientes por turno mañana/tarde en CDI)
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM citas_nutricion 
      WHERE fecha_cita = $1 AND turno = $2 AND estado != 'CANCELADA'
    `;
    const countResult = await this.db.query(countQuery, [data.fechaCita, data.turno]);
    const citasAgendadas = parseInt(countResult.rows[0].total, 10);

    const LIMITE_POR_TURNO = 15;
    if (citasAgendadas >= LIMITE_POR_TURNO) {
      throw new Error(`El turno de la ${data.turno} para la fecha ${data.fechaCita} ya ha alcanzado el cupo máximo (${LIMITE_POR_TURNO} pacientes).`);
    }

    const insertQuery = `
      INSERT INTO citas_nutricion (
        paciente_id, fecha_cita, hora_cita, turno, tipo_consulta, motivo_consulta, profesional_nombre, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PROGRAMADA')
      RETURNING *;
    `;
    const res = await this.db.query(insertQuery, [
      data.pacienteId,
      data.fechaCita,
      data.horaCita,
      data.turno,
      data.tipoConsulta,
      data.motivoConsulta,
      data.profesionalNombre
    ]);

    return res.rows[0];
  }

  async listarCitasPorFecha(fecha: string, turno?: string) {
    let query = `
      SELECT c.*, p.cedula, p.primer_nombre, p.primer_apellido, p.telefono, p.comunidad_consejo_comunal
      FROM citas_nutricion c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      WHERE c.fecha_cita = $1
    `;
    const params: any[] = [fecha];

    if (turno) {
      params.push(turno);
      query += ` AND c.turno = $2`;
    }
    query += ` ORDER BY c.hora_cita ASC`;

    const res = await this.db.query(query, params);
    return res.rows;
  }

  /**
   * 2. EVALUACIÓN ANTROPOMÉTRICA Y CÁLCULO DE IMC / CRITERIOS INN & OMS
   */
  calcularDiagnosticoAntropometrico(data: EvaluacionAntropometricaDTO): DiagnosticoNutricionalResult {
    const alturaMetros = data.tallaCm / 100.0;
    const imc = parseFloat((data.pesoKg / (alturaMetros * alturaMetros)).toFixed(2));

    // Regla especial venezolana INN: Circunferencia de Brazo en niños (MUAC)
    if (data.circunferenciaBrazoCm !== undefined && data.edadMesesOAnos?.unidad === 'MESES') {
      if (data.circunferenciaBrazoCm < 11.5) {
        return {
          imc,
          clasificacion: 'Desnutrición Aguda Severa (Cinta Braquial Roja)',
          diagnosticoDetallado: 'Emergencia Nutricional Comunitaria. Iniciar protocolo F-75/F-100 y suplementación con Micronutrientes Chispitas.',
          alertaRiesgo: 'ROJO',
          requiereSuplementacionUrgente: true
        };
      } else if (data.circunferenciaBrazoCm >= 11.5 && data.circunferenciaBrazoCm < 12.5) {
        return {
          imc,
          clasificacion: 'Desnutrición Aguda Moderada (Cinta Braquial Amarilla)',
          diagnosticoDetallado: 'Riesgo inminente de desnutrición. Incorporar Nutrichicha enriquecida y seguimiento semanal.',
          alertaRiesgo: 'AMARILLO',
          requiereSuplementacionUrgente: true
        };
      }
    }

    // Evaluación Estándar Adulto según Rangos OMS/INN
    let clasificacion = '';
    let alertaRiesgo: 'VERDE' | 'AMARILLO' | 'ROJO' = 'VERDE';
    let requiereSuplementacionUrgente = false;

    if (imc < 16.0) {
      clasificacion = 'Bajo Peso Severo (Desnutrición Grado III)';
      alertaRiesgo = 'ROJO';
      requiereSuplementacionUrgente = true;
    } else if (imc >= 16.0 && imc < 17.0) {
      clasificacion = 'Bajo Peso Moderado (Desnutrición Grado II)';
      alertaRiesgo = 'AMARILLO';
      requiereSuplementacionUrgente = true;
    } else if (imc >= 17.0 && imc < 18.5) {
      clasificacion = 'Bajo Peso Leve (Riesgo Nutricional)';
      alertaRiesgo = 'AMARILLO';
      requiereSuplementacionUrgente = false;
    } else if (imc >= 18.5 && imc < 25.0) {
      clasificacion = 'Normopeso (Estado Nutricional Adecuado)';
      alertaRiesgo = 'VERDE';
      requiereSuplementacionUrgente = false;
    } else if (imc >= 25.0 && imc < 30.0) {
      clasificacion = 'Sobrepeso (Pre-obesidad)';
      alertaRiesgo = 'AMARILLO';
      requiereSuplementacionUrgente = false;
    } else if (imc >= 30.0 && imc < 35.0) {
      clasificacion = 'Obesidad Grado I';
      alertaRiesgo = 'AMARILLO';
      requiereSuplementacionUrgente = false;
    } else if (imc >= 35.0 && imc < 40.0) {
      clasificacion = 'Obesidad Grado II (Severa)';
      alertaRiesgo = 'ROJO';
      requiereSuplementacionUrgente = false;
    } else {
      clasificacion = 'Obesidad Grado III (Mórbida)';
      alertaRiesgo = 'ROJO';
      requiereSuplementacionUrgente = false;
    }

    return {
      imc,
      clasificacion,
      diagnosticoDetallado: `Paciente con IMC de ${imc} kg/m². Diagnóstico clínico: ${clasificacion}.`,
      alertaRiesgo,
      requiereSuplementacionUrgente
    };
  }

  async registrarEvaluacion(data: EvaluacionAntropometricaDTO) {
    const diagnostico = this.calcularDiagnosticoAntropometrico(data);

    const query = `
      INSERT INTO evaluaciones_antropometricas (
        historia_id, cita_id, peso_kg, talla_cm, circunferencia_brazo_cm,
        circunferencia_cintura_cm, pliegue_tricipital_mm, clasificacion_nutricional,
        diagnostico_inn_oms, observaciones_clinicas, evaluador_nombre
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const res = await this.db.query(query, [
      data.historiaId,
      data.citaId || null,
      data.pesoKg,
      data.tallaCm,
      data.circunferenciaBrazoCm || null,
      data.circunferenciaCinturaCm || null,
      data.pliegueTricipitalMm || null,
      diagnostico.clasificacion,
      diagnostico.diagnosticoDetallado,
      data.observacionesClinicas || null,
      data.evaluadorNombre
    ]);

    // Si la evaluación proviene de una cita agendada, actualizar el estado de la cita a 'ATENDIDA'
    if (data.citaId) {
      await this.db.query(`UPDATE citas_nutricion SET estado = 'ATENDIDA', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [data.citaId]);
    }

    return {
      evaluacion: res.rows[0],
      diagnostico
    };
  }

  /**
   * 3. PLANES DE ALIMENTACIÓN PERSONALIZADOS CON CONTEXTO LOCAL VENEZOLANO
   */
  async crearPlanAlimentario(data: PlanAlimentarioDTO) {
    const query = `
      INSERT INTO planes_alimentarios (
        evaluacion_id, paciente_id, requerimiento_calorico_kcal,
        porcentaje_carbohidratos, porcentaje_proteinas, porcentaje_grasas,
        desayuno_guia, merienda_manana_guia, almuerzo_guia, merienda_tarde_guia,
        cena_guia, recomendaciones_locales, fecha_proximo_control
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    const res = await this.db.query(query, [
      data.evaluacionId,
      data.pacienteId,
      data.requerimientoCaloricoKcal,
      data.porcentajeCarbohidratos ?? 55,
      data.porcentajeProteinas ?? 15,
      data.porcentajeGrasas ?? 30,
      data.desayunoGuia,
      data.meriendaMananaGuia || null,
      data.almuerzoGuia,
      data.meriendaTardeGuia || null,
      data.cenaGuia,
      data.recomendacionesLocales,
      data.fechaProximoControl || null
    ]);

    return res.rows[0];
  }

  /**
   * 4. PRESCRIPCIÓN Y ENTREGA DE SUPLEMENTOS NUTRICIONALES DEL CDI (INN)
   */
  async prescribirYEntregarSuplemento(data: EntregaSuplementoDTO) {
    // Verificar stock del suplemento en el catálogo
    const checkStock = await this.db.query(
      `SELECT stock_actual, nombre FROM suplementos_catalogo WHERE id = $1 AND activo = TRUE`,
      [data.suplementoId]
    );

    if (checkStock.rows.length === 0) {
      throw new Error(`El suplemento solicitado no existe o no está activo.`);
    }

    const stockActual = checkStock.rows[0].stock_actual;
    if (data.cantidadEntregada > stockActual) {
      throw new Error(`Stock insuficiente de ${checkStock.rows[0].nombre}. Stock disponible: ${stockActual}, solicitado: ${data.cantidadEntregada}`);
    }

    const estado = data.cantidadEntregada >= data.cantidadPrescrita ? 'ENTREGADO_TOTAL' : 
                   data.cantidadEntregada > 0 ? 'ENTREGADO_PARCIAL' : 'PENDIENTE';

    // Descontar del inventario de suplementos
    if (data.cantidadEntregada > 0) {
      await this.db.query(
        `UPDATE suplementos_catalogo SET stock_actual = stock_actual - $1 WHERE id = $2`,
        [data.cantidadEntregada, data.suplementoId]
      );
    }

    const query = `
      INSERT INTO prescripciones_suplementos (
        evaluacion_id, suplemento_id, dosis_diaria, duracion_dias, cantidad_prescrita,
        cantidad_entregada, fecha_entrega, lote_entregado, responsable_entrega,
        estado, observaciones
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const res = await this.db.query(query, [
      data.evaluacionId,
      data.suplementoId,
      data.dosisDiaria,
      data.duracionDias,
      data.cantidadPrescrita,
      data.cantidadEntregada,
      data.cantidadEntregada > 0 ? new Date().toISOString().split('T')[0] : null,
      data.loteEntregado || null,
      data.responsableEntrega,
      estado,
      data.observaciones || null
    ]);

    return res.rows[0];
  }
}
