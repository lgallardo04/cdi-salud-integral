-- ============================================================================
-- MÓDULO DE OFTALMOLOGÍA & MISIÓN MILAGRO - CDI VENEZUELA
-- ESQUEMA RELACIONAL POSTGRESQL (DDL)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Consultas Oftalmológicas Especializadas
CREATE TABLE IF NOT EXISTS consultas_oftalmicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id VARCHAR(64),
    paciente_nombre VARCHAR(150) NOT NULL,
    paciente_cedula VARCHAR(30),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    medico_tratante VARCHAR(150) NOT NULL DEFAULT 'Dra. Elena Ramos (Oftalmóloga CDI)',
    av_od VARCHAR(50) DEFAULT '20/40 (SC) / 20/20 (CC)',
    av_os VARCHAR(50) DEFAULT '20/60 (SC) / 20/25 (CC)',
    pio_od INT NOT NULL DEFAULT 16,
    pio_os INT NOT NULL DEFAULT 18,
    biomicroscopia TEXT,
    fondo_ojo TEXT,
    diagnostico TEXT NOT NULL,
    plan_tratamiento TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consultas_oftalmo_paciente ON consultas_oftalmicas(paciente_id, fecha);

-- 2. Censo Quirúrgico - Misión Milagro
CREATE TABLE IF NOT EXISTS candidatos_mision_milagro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id VARCHAR(64),
    paciente_nombre VARCHAR(150) NOT NULL,
    paciente_cedula VARCHAR(30) NOT NULL,
    edad INT DEFAULT 60,
    ojo VARCHAR(20) NOT NULL CHECK (ojo IN ('OD', 'OS', 'OU (Bilateral)')),
    patologia VARCHAR(150) NOT NULL,
    poder_lio VARCHAR(50) DEFAULT '+21.5 D',
    checklist_laboratorio VARCHAR(120) DEFAULT 'Completo',
    checklist_cardio VARCHAR(120) DEFAULT 'Apto Clase I/II',
    estado VARCHAR(80) NOT NULL DEFAULT 'Apto para Quirófano',
    fecha_jornada DATE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_milagro_censo ON candidatos_mision_milagro(estado, fecha_jornada);
