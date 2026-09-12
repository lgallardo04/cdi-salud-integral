-- ============================================================================
-- MÓDULO DE FARMACIA COMUNITARIA - CENTRO DE DIAGNÓSTICO INTEGRAL (CDI) VENEZUELA
-- ESQUEMA RELACIONAL POSTGRESQL (DDL)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Pacientes (Registro base para entregas de récipes)
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_documento VARCHAR(2) NOT NULL CHECK (tipo_documento IN ('V', 'E', 'P', 'MN')),
    cedula VARCHAR(15) UNIQUE,
    primer_nombre VARCHAR(60) NOT NULL,
    segundo_nombre VARCHAR(60),
    primer_apellido VARCHAR(60) NOT NULL,
    segundo_apellido VARCHAR(60),
    fecha_nacimiento DATE NOT NULL,
    sexo CHAR(1) NOT NULL CHECK (sexo IN ('M', 'F')),
    telefono VARCHAR(20),
    comunidad_consejo_comunal VARCHAR(150),
    asic VARCHAR(100) NOT NULL DEFAULT 'ASIC Territorial',
    direccion_detallada TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pacientes_farmacia_cedula ON pacientes(tipo_documento, cedula);

-- 2. Catálogo de Medicamentos e Insumos Médicos
CREATE TABLE IF NOT EXISTS articulos_farmacia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_articulo VARCHAR(30) UNIQUE NOT NULL,
    nombre_generico VARCHAR(150) NOT NULL,
    nombre_comercial VARCHAR(150),
    forma_farmaceutica VARCHAR(80) NOT NULL,
    concentracion VARCHAR(60) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN (
        'ANALGESICO_ANTIINFLAMATORIO',
        'ANTIBIOTICO',
        'ANTIHIPERTENSIVO',
        'HIPOGLUCEMIANTE',
        'OFTALMOLOGICO',
        'RESPIRATORIO',
        'INSUMO_QUIRURGICO',
        'OTRO'
    )),
    unidad_medida VARCHAR(30) NOT NULL DEFAULT 'UNIDAD',
    es_controlado BOOLEAN DEFAULT FALSE,
    stock_minimo INT NOT NULL DEFAULT 20,
    stock_actual INT NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    ubicacion_estante VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_articulos_busqueda ON articulos_farmacia(nombre_generico, categoria, activo);

-- 3. Control de Lotes (Trazabilidad y Política FEFO: First Expired, First Out)
CREATE TABLE IF NOT EXISTS lotes_farmacia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    articulo_id UUID NOT NULL REFERENCES articulos_farmacia(id) ON DELETE RESTRICT,
    numero_lote VARCHAR(50) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    cantidad_inicial INT NOT NULL CHECK (cantidad_inicial > 0),
    cantidad_disponible INT NOT NULL CHECK (cantidad_disponible >= 0),
    laboratorio_origen VARCHAR(120),
    fecha_recepcion DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'AGOTADO', 'VENCIDO', 'CUARENTENA')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_articulo_lote UNIQUE(articulo_id, numero_lote)
);

CREATE INDEX IF NOT EXISTS idx_lotes_fefo ON lotes_farmacia(articulo_id, fecha_vencimiento ASC) WHERE cantidad_disponible > 0;

-- 4. Récipes Médicos Recibidos (Oftalmología, Medicina General, Urgencias, etc.)
CREATE TABLE IF NOT EXISTS recipes_medicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_recipe VARCHAR(40) UNIQUE NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE RESTRICT,
    cedula_paciente VARCHAR(15) NOT NULL,
    nombre_paciente VARCHAR(150) NOT NULL,
    servicio_emisor VARCHAR(80) NOT NULL CHECK (servicio_emisor IN (
        'MEDICINA_GENERAL',
        'OFTALMOLOGIA',
        'URGENCIAS_TERAPIA',
        'ODONTOLOGIA',
        'TRAUMATOLOGIA',
        'GINECOLOGIA',
        'PEDIATRIA',
        'OTRO_CENTRO_SALUD'
    )),
    medico_tratante VARCHAR(120) NOT NULL,
    matricula_mpes VARCHAR(30) NOT NULL,
    diagnostico_presuntivo TEXT NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento_recipe DATE NOT NULL,
    estado VARCHAR(25) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'DISPENSADO_PARCIAL', 'DISPENSADO_TOTAL', 'ANULADO', 'VENCIDO')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recipes_estado_fecha ON recipes_medicos(estado, fecha_emision);
CREATE INDEX IF NOT EXISTS idx_recipes_cedula ON recipes_medicos(cedula_paciente);

-- 5. Ítems Prescritos en el Récipe
CREATE TABLE IF NOT EXISTS recipe_detalles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes_medicos(id) ON DELETE CASCADE,
    articulo_id UUID NOT NULL REFERENCES articulos_farmacia(id) ON DELETE RESTRICT,
    posologia TEXT NOT NULL,
    duracion_tratamiento_dias INT NOT NULL CHECK (duracion_tratamiento_dias > 0),
    cantidad_prescrita INT NOT NULL CHECK (cantidad_prescrita > 0),
    cantidad_despachada INT NOT NULL DEFAULT 0 CHECK (cantidad_despachada <= cantidad_prescrita),
    estado_item VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado_item IN ('PENDIENTE', 'PARCIAL', 'COMPLETO', 'NO_DISPONIBLE')),
    CONSTRAINT uq_recipe_articulo UNIQUE(recipe_id, articulo_id)
);

-- 6. Cabecera de Dispensación
CREATE TABLE IF NOT EXISTS dispensaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_dispensacion VARCHAR(40) UNIQUE NOT NULL,
    recipe_id UUID NOT NULL REFERENCES recipes_medicos(id) ON DELETE RESTRICT,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
    persona_que_retira VARCHAR(120) NOT NULL,
    cedula_persona_que_retira VARCHAR(15) NOT NULL,
    parentesco VARCHAR(40) DEFAULT 'TITULAR',
    farmaceuta_despachador VARCHAR(120) NOT NULL,
    fecha_dispensacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT
);

-- 7. Detalle de Dispensación por Lote (Trazabilidad FEFO)
CREATE TABLE IF NOT EXISTS dispensacion_detalles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispensacion_id UUID NOT NULL REFERENCES dispensaciones(id) ON DELETE CASCADE,
    recipe_detalle_id UUID NOT NULL REFERENCES recipe_detalles(id) ON DELETE RESTRICT,
    articulo_id UUID NOT NULL REFERENCES articulos_farmacia(id) ON DELETE RESTRICT,
    lote_id UUID NOT NULL REFERENCES lotes_farmacia(id) ON DELETE RESTRICT,
    cantidad_entregada INT NOT NULL CHECK (cantidad_entregada > 0)
);

-- 8. Libro Kardex de Movimientos de Inventario
CREATE TABLE IF NOT EXISTS kardex_movimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    articulo_id UUID NOT NULL REFERENCES articulos_farmacia(id) ON DELETE RESTRICT,
    lote_id UUID REFERENCES lotes_farmacia(id) ON DELETE RESTRICT,
    tipo_movimiento VARCHAR(35) NOT NULL CHECK (tipo_movimiento IN (
        'ENTRADA_DONACION_MINISTERIO',
        'ENTRADA_COMPRA',
        'ENTRADA_TRASPASO_CDI',
        'SALIDA_DISPENSACION_RECIPE',
        'SALIDA_EMERGENCIA_SALA',
        'SALIDA_MERMA_VENCIMIENTO',
        'AJUSTE_INVENTARIO'
    )),
    cantidad INT NOT NULL,
    saldo_anterior INT NOT NULL,
    saldo_posterior INT NOT NULL,
    documento_soporte VARCHAR(80),
    usuario_responsable VARCHAR(100) NOT NULL,
    justificacion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kardex_articulo_fecha ON kardex_movimientos(articulo_id, created_at DESC);

-- 9. Vista de Alertas de Vencimiento de Lotes y Quiebre de Stock
CREATE OR REPLACE VIEW v_alertas_farmacia AS
SELECT 
    a.id AS articulo_id,
    a.codigo_articulo,
    a.nombre_generico,
    a.concentracion,
    a.forma_farmaceutica,
    a.stock_actual,
    a.stock_minimo,
    l.numero_lote,
    l.cantidad_disponible AS stock_lote,
    l.fecha_vencimiento,
    (l.fecha_vencimiento - CURRENT_DATE) AS dias_para_vencer,
    CASE 
        WHEN l.fecha_vencimiento < CURRENT_DATE THEN 'VENCIDO'
        WHEN (l.fecha_vencimiento - CURRENT_DATE) <= 30 THEN 'CRITICO_VENCE_30_DIAS'
        WHEN (l.fecha_vencimiento - CURRENT_DATE) <= 90 THEN 'ALERTA_VENCE_90_DIAS'
        ELSE 'OPTIMO'
    END AS estado_vencimiento
FROM articulos_farmacia a
INNER JOIN lotes_farmacia l ON a.id = l.articulo_id
WHERE l.cantidad_disponible > 0
ORDER BY l.fecha_vencimiento ASC;
