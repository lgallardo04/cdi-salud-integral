-- Datos semilla para Nutrición CDI
INSERT INTO pacientes (id, tipo_documento, cedula, primer_nombre, primer_apellido, fecha_nacimiento, sexo, telefono, comunidad_consejo_comunal, asic)
VALUES 
('11111111-1111-1111-1111-111111111111', 'V', '15842931', 'Yelitza', 'Rodríguez', '1982-04-12', 'F', '0414-1234567', 'Consejo Comunal Las Flores', 'ASIC 23 de Enero'),
('33333333-3333-3333-3333-333333333333', 'V', '32145678', 'Diego', 'Hernández', '2019-08-20', 'M', '0412-5554433', 'Consejo Comunal El Mirador', 'ASIC 23 de Enero')
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO suplementos_catalogo (id, codigo, nombre, presentacion, grupo_objetivo, stock_actual)
VALUES
('aaaa1111-0000-0000-0000-000000000001', 'SUP-SULF-01', 'Sulfato Ferroso + Ácido Fólico', 'Frasco 60 tabletas (200mg / 1mg)', 'Gestantes / Anemia', 250),
('aaaa1111-0000-0000-0000-000000000002', 'SUP-VITA-02', 'Vitamina A (Megadosis)', 'Perlas 100.000 UI', 'Infantil 6-59 meses', 180),
('aaaa1111-0000-0000-0000-000000000003', 'SUP-NUTR-03', 'Nutrichicha Enriquecida INN', 'Bolsa 1kg en polvo', 'Nutrición Infantil / Comunitario', 95),
('aaaa1111-0000-0000-0000-000000000004', 'SUP-CHIS-04', 'Micronutrientes en Polvo (Chispitas)', 'Caja 30 sobres individuales', 'Infantil 6-23 meses', 300)
ON CONFLICT (codigo) DO NOTHING;
