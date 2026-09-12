-- Datos Semilla para Farmacia CDI
INSERT INTO pacientes (id, tipo_documento, cedula, primer_nombre, primer_apellido, fecha_nacimiento, sexo, telefono, comunidad_consejo_comunal, asic)
VALUES 
('11111111-1111-1111-1111-111111111111', 'V', '15842931', 'Yelitza', 'Rodríguez', '1982-04-12', 'F', '0414-1234567', 'Consejo Comunal Las Flores', 'ASIC 23 de Enero')
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO articulos_farmacia (id, codigo_articulo, nombre_generico, nombre_comercial, forma_farmaceutica, concentracion, categoria, unidad_medida, es_controlado, stock_minimo, stock_actual, ubicacion_estante)
VALUES
('bbbb1111-0000-0000-0000-000000000001', 'MED-OFT-01', 'Timolol Maleato', 'GlaucoTim', 'Colirio Solución Oftálmica', '0.5%', 'OFTALMOLOGICO', 'Frasco Gotero 5ml', FALSE, 15, 60, 'Estante B-Oftalmología'),
('bbbb1111-0000-0000-0000-000000000002', 'MED-OFT-02', 'Tobramicina + Dexametasona', 'TobraDex Genérico', 'Colirio Suspensión Oftálmica', '0.3% / 0.1%', 'OFTALMOLOGICO', 'Frasco Gotero 5ml', FALSE, 10, 45, 'Estante B-Oftalmología'),
('bbbb1111-0000-0000-0000-000000000004', 'MED-GEN-02', 'Losartán Potásico', 'Cozaar Genérico', 'Tabletas', '50mg', 'ANTIHIPERTENSIVO', 'Caja 30 tabletas', FALSE, 50, 200, 'Estante C-Cardiovascular'),
('bbbb1111-0000-0000-0000-000000000006', 'MED-GEN-04', 'Metformina Clorhidrato', 'Glucophage Genérico', 'Tabletas', '850mg', 'HIPOGLUCEMIANTE', 'Caja 30 tabletas', FALSE, 40, 15, 'Estante C-Metabólicos')
ON CONFLICT (codigo_articulo) DO NOTHING;

INSERT INTO lotes_farmacia (id, articulo_id, numero_lote, fecha_vencimiento, cantidad_inicial, cantidad_disponible, laboratorio_origen)
VALUES
('cccc1111-0000-0000-0000-000000000001', 'bbbb1111-0000-0000-0000-000000000001', 'LOTE-TIM-2026A', '2026-11-30', 30, 30, 'Laboratorios Robinfarm'),
('cccc1111-0000-0000-0000-000000000002', 'bbbb1111-0000-0000-0000-000000000001', 'LOTE-TIM-2027B', '2027-05-15', 30, 30, 'Laboratorios Robinfarm'),
('cccc1111-0000-0000-0000-000000000003', 'bbbb1111-0000-0000-0000-000000000002', 'LOTE-TOB-2026F', '2026-10-15', 45, 45, 'Quimbiotec C.A.'),
('cccc1111-0000-0000-0000-000000000006', 'bbbb1111-0000-0000-0000-000000000006', 'LOTE-MET-2026X', '2026-09-30', 50, 15, 'Laboratorios Behrens')
ON CONFLICT (articulo_id, numero_lote) DO NOTHING;

INSERT INTO recipes_medicos (id, numero_recipe, paciente_id, cedula_paciente, nombre_paciente, servicio_emisor, medico_tratante, matricula_mpes, diagnostico_presuntivo, fecha_emision, fecha_vencimiento_recipe, estado)
VALUES
('dddd1111-0000-0000-0000-000000000001', 'REC-OFT-2026-0089', '11111111-1111-1111-1111-111111111111', 'V-15842931', 'Yelitza Rodríguez', 'OFTALMOLOGIA', 'Dra. María Elena Ramos', 'MPPS-78432', 'Glaucoma Primario de Ángulo Abierto', CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', 'PENDIENTE')
ON CONFLICT (numero_recipe) DO NOTHING;

INSERT INTO recipe_detalles (id, recipe_id, articulo_id, posologia, duracion_tratamiento_dias, cantidad_prescrita, cantidad_despachada, estado_item)
VALUES
('eeee1111-0000-0000-0000-000000000001', 'dddd1111-0000-0000-0000-000000000001', 'bbbb1111-0000-0000-0000-000000000001', 'Instilar 1 gota en ojo derecho cada 12 horas', 30, 1, 0, 'PENDIENTE')
ON CONFLICT (recipe_id, articulo_id) DO NOTHING;
