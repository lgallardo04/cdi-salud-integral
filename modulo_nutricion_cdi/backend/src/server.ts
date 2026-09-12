import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'cdi_nutricion_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const nutritionService = new NutritionService(pool);
const nutritionController = new NutritionController(nutritionService);

// Rutas del Módulo de Nutrición
app.post('/api/nutricion/citas', nutritionController.agendarCita);
app.get('/api/nutricion/citas', nutritionController.listarCitas);
app.post('/api/nutricion/evaluaciones', nutritionController.registrarEvaluacion);
app.post('/api/nutricion/planes', nutritionController.crearPlanAlimentario);
app.post('/api/nutricion/suplementos/entrega', nutritionController.entregarSuplemento);

app.get('/health', (req, res) => res.json({ status: 'UP', modulo: 'Nutrición CDI' }));

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Módulo de Nutrición CDI corriendo en puerto ${PORT}`);
});

export default app;
