import { 
  EntradaLoteDTO, 
  RecepcionRecipeDTO, 
  DispensarRecipeDTO, 
  ResultadoDispensacion,
  ItemDispensadoResultado,
  LoteDeduccion 
} from './pharmacy.types';

export interface ITransactionalDbClient {
  query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }>;
}

export class PharmacyService {
  constructor(private db: ITransactionalDbClient) {}

  /**
   * 1. REGISTRO DE ENTRADA DE MEDICAMENTOS POR LOTE Y ACTUALIZACIÓN DE KARDEX
   */
  async registrarEntradaLote(data: EntradaLoteDTO) {
    // Usamos una transacción para garantizar consistencia entre lotes, stock general y kardex
    await this.db.query('BEGIN');
    try {
      // 1. Obtener artículo actual y saldo anterior
      const artRes = await this.db.query(
        'SELECT id, stock_actual, nombre_generico FROM articulos_farmacia WHERE id = $1 FOR UPDATE',
        [data.articuloId]
      );
      if (artRes.rows.length === 0) {
        throw new Error(`Artículo con ID ${data.articuloId} no encontrado en el catálogo.`);
      }
      const articulo = artRes.rows[0];
      const saldoAnterior = articulo.stock_actual;
      const saldoPosterior = saldoAnterior + data.cantidad;

      // 2. Insertar o actualizar Lote (ON CONFLICT actualiza la cantidad si el lote ya existía)
      const loteQuery = `
        INSERT INTO lotes_farmacia (articulo_id, numero_lote, fecha_vencimiento, cantidad_inicial, cantidad_disponible, laboratorio_origen)
        VALUES ($1, $2, $3, $4, $4, $5)
        ON CONFLICT (articulo_id, numero_lote) DO UPDATE
        SET cantidad_disponible = lotes_farmacia.cantidad_disponible + EXCLUDED.cantidad_inicial,
            cantidad_inicial = lotes_farmacia.cantidad_inicial + EXCLUDED.cantidad_inicial
        RETURNING id;
      `;
      const loteRes = await this.db.query(loteQuery, [
        data.articuloId,
        data.numeroLote,
        data.fechaVencimiento,
        data.cantidad,
        data.laboratorioOrigen || 'Ministerio de Salud / Proveedor Central'
      ]);
      const loteId = loteRes.rows[0].id;

      // 3. Incrementar el stock global del artículo
      await this.db.query(
        'UPDATE articulos_farmacia SET stock_actual = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [saldoPosterior, data.articuloId]
      );

      // 4. Registrar movimiento en el libro Kardex
      await this.db.query(
        `INSERT INTO kardex_movimientos (
          articulo_id, lote_id, tipo_movimiento, cantidad, saldo_anterior, saldo_posterior, documento_soporte, usuario_responsable, justificacion
        ) VALUES ($1, $2, 'ENTRADA_DONACION_MINISTERIO', $3, $4, $5, $6, $7, $8)`,
        [
          data.articuloId,
          loteId,
          data.cantidad,
          saldoAnterior,
          saldoPosterior,
          data.documentoSoporte,
          data.usuarioResponsable,
          `Entrada de lote ${data.numeroLote} con vencimiento ${data.fechaVencimiento}`
        ]
      );

      await this.db.query('COMMIT');
      return {
        mensaje: `Lote ${data.numeroLote} de ${articulo.nombre_generico} registrado con éxito.`,
        loteId,
        saldoAnterior,
        saldoPosterior
      };
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
  }

  /**
   * 2. REPORTE DE ALERTAS: STOCK MÍNIMO Y VENCIMIENTO DE LOTES (30 / 90 DÍAS)
   */
  async obtenerAlertasInventario() {
    // Medicamentos en stock crítico
    const stockBajoQuery = `
      SELECT id, codigo_articulo, nombre_generico, concentracion, stock_actual, stock_minimo, categoria, ubicacion_estante
      FROM articulos_farmacia
      WHERE stock_actual <= stock_minimo AND activo = TRUE
      ORDER BY stock_actual ASC;
    `;
    const stockBajoRes = await this.db.query(stockBajoQuery);

    // Lotes próximos a vencer o vencidos
    const vencimientosQuery = `
      SELECT * FROM v_alertas_farmacia
      WHERE estado_vencimiento != 'OPTIMO'
      ORDER BY fecha_vencimiento ASC;
    `;
    const vencimientosRes = await this.db.query(vencimientosQuery);

    return {
      articulosBajoStock: stockBajoRes.rows,
      lotesEnRiesgoVencimiento: vencimientosRes.rows
    };
  }

  /**
   * 3. RECEPCIÓN Y VALIDACIÓN DE RÉCIPES EXTERNOS (OFTALMOLOGÍA, MEDICINA GENERAL, ETC.)
   */
  async recepcionarRecipe(data: RecepcionRecipeDTO) {
    await this.db.query('BEGIN');
    try {
      const diasValidez = data.diasValidez || 15;
      const fechaVencimientoRecipe = new Date(data.fechaEmision);
      fechaVencimientoRecipe.setDate(fechaVencimientoRecipe.getDate() + diasValidez);

      const insertRecipeQuery = `
        INSERT INTO recipes_medicos (
          numero_recipe, paciente_id, cedula_paciente, nombre_paciente,
          servicio_emisor, medico_tratante, matricula_mpes, diagnostico_presuntivo,
          fecha_emision, fecha_vencimiento_recipe, estado, observaciones
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDIENTE', $11)
        RETURNING *;
      `;

      const recipeRes = await this.db.query(insertRecipeQuery, [
        data.numeroRecipe,
        data.pacienteId || null,
        data.cedulaPaciente,
        data.nombrePaciente,
        data.servicioEmisor,
        data.medicoTratante,
        data.matriculaMpps,
        data.diagnosticoPresuntivo,
        data.fechaEmision,
        fechaVencimientoRecipe.toISOString().split('T')[0],
        data.observaciones || null
      ]);

      const recipe = recipeRes.rows[0];

      // Insertar cada medicamento indicado en el récipe
      for (const med of data.medicamentos) {
        await this.db.query(
          `INSERT INTO recipe_detalles (
            recipe_id, articulo_id, posologia, duracion_tratamiento_dias, cantidad_prescrita, cantidad_despachada, estado_item
          ) VALUES ($1, $2, $3, $4, $5, 0, 'PENDIENTE')`,
          [
            recipe.id,
            med.articuloId,
            med.posologia,
            med.duracionTratamientoDias,
            med.cantidadPrescrita
          ]
        );
      }

      await this.db.query('COMMIT');
      return recipe;
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
  }

  /**
   * 4. DISPENSACIÓN ATÓMICA CON POLÍTICA FEFO (FIRST EXPIRED, FIRST OUT)
   */
  async dispensarMedicamentosRecipe(data: DispensarRecipeDTO): Promise<ResultadoDispensacion> {
    await this.db.query('BEGIN');
    try {
      // 1. Verificar existencia y vigencia del récipe
      const recipeRes = await this.db.query(
        'SELECT * FROM recipes_medicos WHERE id = $1 FOR UPDATE',
        [data.recipeId]
      );
      if (recipeRes.rows.length === 0) {
        throw new Error(`El récipe médico ${data.recipeId} no existe.`);
      }
      const recipe = recipeRes.rows[0];

      if (recipe.estado === 'DISPENSADO_TOTAL') {
        throw new Error(`El récipe ${recipe.numero_recipe} ya se encuentra totalmente dispensado.`);
      }
      if (recipe.estado === 'ANULADO' || recipe.estado === 'VENCIDO') {
        throw new Error(`El récipe ${recipe.numero_recipe} está en estado ${recipe.estado} y no puede despacharse.`);
      }

      // Validar fecha de vencimiento del récipe
      const hoy = new Date().toISOString().split('T')[0];
      if (recipe.fecha_vencimiento_recipe < hoy) {
        await this.db.query(`UPDATE recipes_medicos SET estado = 'VENCIDO' WHERE id = $1`, [recipe.id]);
        throw new Error(`El récipe ${recipe.numero_recipe} ha caducado el ${recipe.fecha_vencimiento_recipe}. Debe ser reevaluado.`);
      }

      // 2. Crear cabecera de dispensación
      const codigoDispensacion = `DISP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const dispHeaderRes = await this.db.query(
        `INSERT INTO dispensaciones (
          codigo_dispensacion, recipe_id, paciente_id, persona_que_retira,
          cedula_persona_que_retira, parentesco, farmaceuta_despachador, observaciones
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [
          codigoDispensacion,
          recipe.id,
          recipe.paciente_id,
          data.personaQueRetira,
          data.cedulaPersonaQueRetira,
          data.parentesco || 'TITULAR',
          data.farmaceutaDespachador,
          data.observaciones || null
        ]
      );
      const dispensacionId = dispHeaderRes.rows[0].id;

      const detallesResultado: ItemDispensadoResultado[] = [];

      // 3. Procesar cada medicamento solicitado
      for (const item of data.items) {
        if (item.cantidadADespachar <= 0) continue;

        // Obtener el detalle del récipe para validar lo que queda pendiente
        const detRes = await this.db.query(
          `SELECT rd.*, a.nombre_generico, a.stock_actual
           FROM recipe_detalles rd
           INNER JOIN articulos_farmacia a ON rd.articulo_id = a.id
           WHERE rd.id = $1 AND rd.recipe_id = $2 FOR UPDATE`,
          [item.recipeDetalleId, recipe.id]
        );
        if (detRes.rows.length === 0) {
          throw new Error(`El ítem prescrito no corresponde a este récipe.`);
        }
        const recipeDet = detRes.rows[0];
        const pendientePorDespachar = recipeDet.cantidad_prescrita - recipeDet.cantidad_despachada;

        if (item.cantidadADespachar > pendientePorDespachar) {
          throw new Error(`Cantidad a despachar (${item.cantidadADespachar}) excede lo pendiente (${pendientePorDespachar}) para ${recipeDet.nombre_generico}.`);
        }

        // Obtener lotes disponibles ordenados por FEFO (First-Expired, First-Out)
        const lotesRes = await this.db.query(
          `SELECT id, numero_lote, fecha_vencimiento, cantidad_disponible
           FROM lotes_farmacia
           WHERE articulo_id = $1 AND cantidad_disponible > 0 AND fecha_vencimiento >= CURRENT_DATE
           ORDER BY fecha_vencimiento ASC FOR UPDATE`,
          [item.articuloId]
        );

        let cantidadRestantePorDespachar = item.cantidadADespachar;
        const lotesAfectados: LoteDeduccion[] = [];

        for (const lote of lotesRes.rows) {
          if (cantidadRestantePorDespachar <= 0) break;

          const cantidadDelLote = Math.min(lote.cantidad_disponible, cantidadRestantePorDespachar);

          // Reducir stock del lote
          await this.db.query(
            `UPDATE lotes_farmacia 
             SET cantidad_disponible = cantidad_disponible - $1,
                 estado = CASE WHEN cantidad_disponible - $1 = 0 THEN 'AGOTADO' ELSE estado END
             WHERE id = $2`,
            [cantidadDelLote, lote.id]
          );

          // Registrar en dispensacion_detalles
          await this.db.query(
            `INSERT INTO dispensacion_detalles (
              dispensacion_id, recipe_detalle_id, articulo_id, lote_id, cantidad_entregada
            ) VALUES ($1, $2, $3, $4, $5)`,
            [dispensacionId, item.recipeDetalleId, item.articuloId, lote.id, cantidadDelLote]
          );

          lotesAfectados.push({
            loteId: lote.id,
            numeroLote: lote.numero_lote,
            fechaVencimiento: lote.fecha_vencimiento,
            cantidadDeducida: cantidadDelLote
          });

          cantidadRestantePorDespachar -= cantidadDelLote;
        }

        if (cantidadRestantePorDespachar > 0) {
          throw new Error(`Stock insuficiente en lotes para despachar ${item.cantidadADespachar} de ${recipeDet.nombre_generico}. Faltaron ${cantidadRestantePorDespachar} unidades.`);
        }

        // Reducir stock general del artículo
        const stockPrevio = recipeDet.stock_actual;
        const nuevoStock = stockPrevio - item.cantidadADespachar;
        await this.db.query(
          `UPDATE articulos_farmacia SET stock_actual = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [nuevoStock, item.articuloId]
        );

        // Registrar en Kardex
        await this.db.query(
          `INSERT INTO kardex_movimientos (
            articulo_id, lote_id, tipo_movimiento, cantidad, saldo_anterior, saldo_posterior, documento_soporte, usuario_responsable, justificacion
          ) VALUES ($1, $2, 'SALIDA_DISPENSACION_RECIPE', $3, $4, $5, $6, $7, $8)`,
          [
            item.articuloId,
            lotesAfectados[0].loteId,
            -item.cantidadADespachar,
            stockPrevio,
            nuevoStock,
            recipe.numero_recipe,
            data.farmaceutaDespachador,
            `Dispensación a paciente CI: ${recipe.cedula_paciente} (${recipe.nombre_paciente})`
          ]
        );

        // Actualizar el estado de este ítem en el récipe
        const totalDespachadoItem = recipeDet.cantidad_despachada + item.cantidadADespachar;
        const estadoItem = totalDespachadoItem >= recipeDet.cantidad_prescrita ? 'COMPLETO' : 'PARCIAL';

        await this.db.query(
          `UPDATE recipe_detalles SET cantidad_despachada = $1, estado_item = $2 WHERE id = $3`,
          [totalDespachadoItem, estadoItem, item.recipeDetalleId]
        );

        detallesResultado.push({
          articuloId: item.articuloId,
          nombreGenerico: recipeDet.nombre_generico,
          cantidadDespachada: item.cantidadADespachar,
          lotesAfectados,
          estadoItem
        });
      }

      // 4. Evaluar el estado global final del récipe (TOTAL o PARCIAL)
      const todosItemsRes = await this.db.query(
        `SELECT COUNT(*) as pendientes FROM recipe_detalles WHERE recipe_id = $1 AND estado_item != 'COMPLETO'`,
        [recipe.id]
      );
      const itemsPendientes = parseInt(todosItemsRes.rows[0].pendientes, 10);
      const estadoFinalRecipe = itemsPendientes === 0 ? 'DISPENSADO_TOTAL' : 'DISPENSADO_PARCIAL';

      await this.db.query(
        `UPDATE recipes_medicos SET estado = $1 WHERE id = $2`,
        [estadoFinalRecipe, recipe.id]
      );

      await this.db.query('COMMIT');

      return {
        dispensacionId,
        codigoDispensacion,
        recipeId: recipe.id,
        estadoRecipeFinal: estadoFinalRecipe,
        fechaDispensacion: new Date().toISOString(),
        detalles: detallesResultado
      };
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
  }
}
