-- ============================================================================
-- MÓDULO DE NUTRICIÓN - CENTRO DE DIAGNÓSTICO INTEGRAL (CDI) VENEZUELA
-- ESQUEMA RELACIONAL POSTGRESQL (DDL)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Pacientes de la Comunidad / ASIC
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

CREATE INDEX IF NOT EXISTS idx_pacientes_nutricion_cedula ON pacientes(tipo_documento, cedula);

-- 2. Gestión y Asignación de Citas
CREATE TABLE IF NOT EXISTS citas_nutricion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
    fecha_cita DATE NOT NULL,
    hora_cita TIME NOT NULL,
    turno VARCHAR(10) NOT NULL CHECK (turno IN ('MANANA', 'TARDE')),
    tipo_consulta VARCHAR(25) NOT NULL CHECK (tipo_consulta IN ('PRIMERA_VEZ', 'CONTROL', 'EMERGENCIA_NUTRICIONAL')),
    motivo_consulta TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADA' CHECK (estado IN ('PROGRAMADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA', 'NO_ASISTIO')),
    profesional_nombre VARCHAR(120),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_citas_nutricion_fecha ON citas_nutricion(fecha_cita, turno, estado);

-- 3. Historia Clínica Nutricional
CREATE TABLE IF NOT EXISTS historias_nutricionales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
    numero_historia VARCHAR(30) UNIQUE NOT NULL,
    antecedentes_patologicos TEXT,
    antecedentes_familiares TEXT,
    habitos_alimentarios TEXT,
    alergias_alimentarias TEXT,
    embarazo BOOLEAN DEFAULT FALSE,
    semanas_gestacion INT CHECK (semanas_gestacion BETWEEN 1 AND 45),
    lactancia_materna BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_historias_nutricion_paciente ON historias_nutricionales(paciente_id);

-- 4. Evaluaciones Antropométricas y Medición de IMC / Cinta Braquial INN
CREATE TABLE IF NOT EXISTS evaluaciones_antropometricas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    historia_id UUID NOT NULL REFERENCES historias_nutricionales(id) ON DELETE CASCADE,
    cita_id UUID REFERENCES citas_nutricion(id) ON DELETE SET NULL,
    fecha_evaluacion DATE NOT NULL DEFAULT CURRENT_DATE,
    peso_kg NUMERIC(5,2) NOT NULL CHECK (peso_kg > 0),
    talla_cm NUMERIC(5,2) NOT NULL CHECK (talla_cm > 0),
    imc NUMERIC(4,2) GENERATED ALWAYS AS (peso_kg / ((talla_cm / 100.0) * (talla_cm / 100.0))) STORED,
    circunferencia_brazo_cm NUMERIC(4,1), -- Indicador clave INN (MUAC) para niños
    circunferencia_cintura_cm NUMERIC(4,1),
    pliegue_tricipital_mm NUMERIC(4,1),
    clasificacion_nutricional VARCHAR(50) NOT NULL,
    diagnostico_inn_oms TEXT NOT NULL,
    observaciones_clinicas TEXT,
    evaluador_nombre VARCHAR(120),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_antropometria_historia ON evaluaciones_antropometricas(historia_id, fecha_evaluacion);

-- 5. Planes de Alimentación Adaptados a Contexto Venezolano (Canasta Local / CLAP)
CREATE TABLE IF NOT EXISTS planes_alimentarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluacion_id UUID NOT NULL REFERENCES evaluaciones_antropometricas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
    requerimiento_calorico_kcal INT NOT NULL,
    porcentaje_carbohidratos NUMERIC(4,1) DEFAULT 55.0,
    porcentaje_proteinas NUMERIC(4,1) DEFAULT 15.0,
    porcentaje_grasas NUMERIC(4,1) DEFAULT 30.0,
    desayuno_guia TEXT NOT NULL,
    merienda_manana_guia TEXT,
    almuerzo_guia TEXT NOT NULL,
    merienda_tarde_guia TEXT,
    cena_guia TEXT NOT NULL,
    recomendaciones_locales TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_proximo_control DATE
);

-- 6. Catálogo de Suplementos Nutricionales del INN / CDI
CREATE TABLE IF NOT EXISTS suplementos_catalogo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    presentacion VARCHAR(80) NOT NULL,
    grupo_objetivo VARCHAR(50),
    stock_actual INT NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    activo BOOLEAN DEFAULT TRUE
);

-- 7. Prescripciones y Entregas de Suplementos
CREATE TABLE IF NOT EXISTS prescripciones_suplementos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluacion_id UUID NOT NULL REFERENCES evaluaciones_antropometricas(id) ON DELETE RESTRICT,
    suplemento_id UUID NOT NULL REFERENCES suplementos_catalogo(id) ON DELETE RESTRICT,
    dosis_diaria VARCHAR(100) NOT NULL,
    duracion_dias INT NOT NULL CHECK (duracion_dias > 0),
    cantidad_prescrita INT NOT NULL CHECK (cantidad_prescrita > 0),
    cantidad_entregada INT NOT NULL DEFAULT 0 CHECK (cantidad_entregada <= cantidad_prescrita),
    fecha_entrega DATE,
    lote_entregado VARCHAR(50),
    responsable_entrega VARCHAR(120),
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'ENTREGADO_PARCIAL', 'ENTREGADO_TOTAL', 'CANCELADO')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Vista Operativa
CREATE OR REPLACE VIEW v_resumen_nutricional AS
SELECT 
    p.id AS paciente_id,
    p.tipo_documento || '-' || p.cedula AS documento_identidad,
    p.primer_nombre || ' ' || p.primer_apellido AS nombre_completo,
    p.comunidad_consejo_comunal,
    e.fecha_evaluacion,
    e.peso_kg,
    e.talla_cm,
    e.imc,
    e.clasificacion_nutricional,
    e.circunferencia_brazo_cm
FROM pacientes p
INNER JOIN historias_nutricionales h ON p.id = h.paciente_id
INNER JOIN evaluaciones_antropometricas e ON h.id = e.historia_id
WHERE e.fecha_evaluacion = (
    SELECT MAX(e2.fecha_evaluacion) 
    FROM evaluaciones_antropometricas e2 
    WHERE e2.historia_id = h.id
);
