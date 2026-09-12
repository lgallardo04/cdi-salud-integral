import { Request, Response } from 'express';
import { NutritionService } from './nutrition.service';

export class NutritionController {
  constructor(private nutritionService: NutritionService) {}

  // POST /api/nutricion/citas
  agendarCita = async (req: Request, res: Response) => {
    try {
      const { pacienteId, fechaCita, horaCita, turno, tipoConsulta, motivoConsulta, profesionalNombre } = req.body;
      if (!pacienteId || !fechaCita || !horaCita || !turno || !tipoConsulta) {
        return res.status(400).json({ error: 'Faltan campos requeridos para agendar la cita.' });
      }

      const cita = await this.nutritionService.agendarCita({
        pacienteId,
        fechaCita,
        horaCita,
        turno,
        tipoConsulta,
        motivoConsulta,
        profesionalNombre
      });

      return res.status(201).json({
        mensaje: 'Cita nutricional agendada exitosamente en el CDI.',
        data: cita
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  // GET /api/nutricion/citas?fecha=2026-09-12&turno=MANANA
  listarCitas = async (req: Request, res: Response) => {
    try {
      const fecha = (req.query.fecha as string) || new Date().toISOString().split('T')[0];
      const turno = req.query.turno as string;
      const citas = await this.nutritionService.listarCitasPorFecha(fecha, turno);
      return res.json({ fecha, total: citas.length, data: citas });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  // POST /api/nutricion/evaluaciones
  registrarEvaluacion = async (req: Request, res: Response) => {
    try {
      const { historiaId, citaId, pesoKg, tallaCm, circunferenciaBrazoCm, circunferenciaCinturaCm, evaluadorNombre, observacionesClinicas, edadMesesOAnos } = req.body;
      if (!historiaId || !pesoKg || !tallaCm || !evaluadorNombre) {
        return res.status(400).json({ error: 'Historia, peso (kg), talla (cm) y evaluador son obligatorios.' });
      }

      const resultado = await this.nutritionService.registrarEvaluacion({
        historiaId,
        citaId,
        pesoKg: Number(pesoKg),
        tallaCm: Number(tallaCm),
        circunferenciaBrazoCm: circunferenciaBrazoCm ? Number(circunferenciaBrazoCm) : undefined,
        circunferenciaCinturaCm: circunferenciaCinturaCm ? Number(circunferenciaCinturaCm) : undefined,
        evaluadorNombre,
        observacionesClinicas,
        edadMesesOAnos
      });

      return res.status(201).json({
        mensaje: 'Evaluación antropométrica registrada con éxito.',
        data: resultado
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  // POST /api/nutricion/planes
  crearPlanAlimentario = async (req: Request, res: Response) => {
    try {
      const plan = await this.nutritionService.crearPlanAlimentario(req.body);
      return res.status(201).json({
        mensaje: 'Plan de alimentación personalizado generado.',
        data: plan
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  // POST /api/nutricion/suplementos/entrega
  entregarSuplemento = async (req: Request, res: Response) => {
    try {
      const { evaluacionId, suplementoId, dosisDiaria, duracionDias, cantidadPrescrita, cantidadEntregada, loteEntregado, responsableEntrega, observaciones } = req.body;
      const entrega = await this.nutritionService.prescribirYEntregarSuplemento({
        evaluacionId,
        suplementoId,
        dosisDiaria,
        duracionDias: Number(duracionDias),
        cantidadPrescrita: Number(cantidadPrescrita),
        cantidadEntregada: Number(cantidadEntregada),
        loteEntregado,
        responsableEntrega,
        observaciones
      });

      return res.status(201).json({
        mensaje: 'Entrega de suplemento nutricional asentada en el CDI.',
        data: entrega
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
