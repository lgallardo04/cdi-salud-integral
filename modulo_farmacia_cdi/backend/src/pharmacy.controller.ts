import { Request, Response } from 'express';
import { PharmacyService } from './pharmacy.service';

export class PharmacyController {
  constructor(private pharmacyService: PharmacyService) {}

  // POST /api/farmacia/lotes/entrada
  registrarEntrada = async (req: Request, res: Response) => {
    try {
      const { articuloId, numeroLote, fechaVencimiento, cantidad, laboratorioOrigen, documentoSoporte, usuarioResponsable } = req.body;
      if (!articuloId || !numeroLote || !fechaVencimiento || !cantidad || !documentoSoporte || !usuarioResponsable) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para la entrada de inventario.' });
      }

      const resultado = await this.pharmacyService.registrarEntradaLote({
        articuloId,
        numeroLote,
        fechaVencimiento,
        cantidad: Number(cantidad),
        laboratorioOrigen,
        documentoSoporte,
        usuarioResponsable
      });

      return res.status(201).json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  // GET /api/farmacia/alertas
  obtenerAlertas = async (req: Request, res: Response) => {
    try {
      const alertas = await this.pharmacyService.obtenerAlertasInventario();
      return res.json(alertas);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  // POST /api/farmacia/recipes/recepcion
  recepcionarRecipe = async (req: Request, res: Response) => {
    try {
      const { numeroRecipe, cedulaPaciente, nombrePaciente, servicioEmisor, medicoTratante, matriculaMpps, diagnosticoPresuntivo, fechaEmision, medicamentos } = req.body;
      if (!numeroRecipe || !cedulaPaciente || !nombrePaciente || !servicioEmisor || !medicoTratante || !matriculaMpps || !medicamentos?.length) {
        return res.status(400).json({ error: 'Todos los datos del récipe médico son obligatorios.' });
      }

      const recipe = await this.pharmacyService.recepcionarRecipe(req.body);
      return res.status(201).json({
        mensaje: 'Récipe médico registrado exitosamente en Farmacia CDI.',
        data: recipe
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  // POST /api/farmacia/dispensacion
  dispensarRecipe = async (req: Request, res: Response) => {
    try {
      const { recipeId, personaQueRetira, cedulaPersonaQueRetira, parentesco, farmaceutaDespachador, items, observaciones } = req.body;
      if (!recipeId || !personaQueRetira || !cedulaPersonaQueRetira || !farmaceutaDespachador || !items?.length) {
        return res.status(400).json({ error: 'Faltan datos de la persona que retira o ítems a dispensar.' });
      }

      const resultado = await this.pharmacyService.dispensarMedicamentosRecipe({
        recipeId,
        personaQueRetira,
        cedulaPersonaQueRetira,
        parentesco: parentesco || 'TITULAR',
        farmaceutaDespachador,
        items,
        observaciones
      });

      return res.status(200).json({
        mensaje: 'Medicamentos dispensados y descargados del stock FEFO exitosamente.',
        data: resultado
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
