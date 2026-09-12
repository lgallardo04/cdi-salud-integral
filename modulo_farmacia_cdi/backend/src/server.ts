import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'cdi_farmacia_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const pharmacyService = new PharmacyService(pool);
const pharmacyController = new PharmacyController(pharmacyService);

// Rutas del Módulo de Farmacia Comunitaria
app.post('/api/farmacia/lotes/entrada', pharmacyController.registrarEntrada);
app.get('/api/farmacia/alertas', pharmacyController.obtenerAlertas);
app.post('/api/farmacia/recipes/recepcion', pharmacyController.recepcionarRecipe);
app.post('/api/farmacia/dispensacion', pharmacyController.dispensarRecipe);

app.get('/health', (req, res) => res.json({ status: 'UP', modulo: 'Farmacia CDI' }));

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`Módulo de Farmacia CDI corriendo en puerto ${PORT}`);
});

export default app;
