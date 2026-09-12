-- ============================================================================
-- MÓDULO DE OFTALMOLOGÍA & MISIÓN MILAGRO - CDI VENEZUELA
-- DATOS SEMILLA (SEEDS)
-- ============================================================================

INSERT INTO consultas_oftalmicas (
    paciente_nombre,
    paciente_cedula,
    fecha,
    medico_tratante,
    av_od,
    av_os,
    pio_od,
    pio_os,
    biomicroscopia,
    fondo_ojo,
    diagnostico,
    plan_tratamiento
) VALUES
(
    'Yelitza Rodríguez',
    'V-15842931',
    '2026-09-10',
    'Dra. Elena Ramos (Oftalmóloga CDI)',
    '20/40 (SC) / 20/20 (CC)',
    '20/60 (SC) / 20/25 (CC)',
    16,
    18,
    'Córnea transparente, cámara anterior amplia sin células. Cristalino con esclerosis nuclear incipiente OD.',
    'Papila de bordes netos, relación E/P 0.3 en ambos ojos. Mácula normal con brillo foveal conservado.',
    'Presbicia y Catarata senil incipiente OD',
    'Lágrimas artificiales 1 gota c/6h y control anual.'
),
(
    'Carlos Ramón Mendoza',
    'V-12948112',
    '2026-09-08',
    'Dra. Elena Ramos (Oftalmóloga CDI)',
    '20/30 (SC) / 20/20 (CC)',
    '20/80 (SC) / 20/40 (CC)',
    15,
    17,
    'Pterigión nasal grado III que invade eje pupilar OS. OD sin alteraciones.',
    'Retina aplicada, papila normal.',
    'Pterigión Grado III OS con astigmatismo inducido',
    'Remisión a Misión Milagro para resección con autoinjerto conjuntival.'
);

INSERT INTO candidatos_mision_milagro (
    paciente_nombre,
    paciente_cedula,
    edad,
    ojo,
    patologia,
    poder_lio,
    checklist_laboratorio,
    checklist_cardio,
    estado,
    fecha_jornada
) VALUES
(
    'Yelitza Rodríguez',
    'V-15842931',
    64,
    'OD',
    'Catarata Senil Grado III',
    '+21.5 D',
    'Completo (Glicemia, TP/TPT, Serología)',
    'Apto Quirúrgico Clase II',
    'Apto para Quirófano',
    '2026-09-25'
),
(
    'Carlos Ramón Mendoza',
    'V-12948112',
    58,
    'OS',
    'Pterigión Grado III con Astigmatismo',
    'N/A (Autoinjerto conjuntival)',
    'Pendiente Hematología',
    'En Espera EKG',
    'Pendiente Laboratorio',
    '2026-10-02'
),
(
    'Mercedes Valera',
    'V-8451203',
    71,
    'OU (Bilateral)',
    'Catarata Madura Bilateral',
    'OD: +22.0 D / OS: +22.5 D',
    'Completo',
    'Apto Quirúrgico',
    'Programado para Jornada',
    '2026-09-18'
);
