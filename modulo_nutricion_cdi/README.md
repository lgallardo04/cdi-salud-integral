# Módulo de Nutrición - CDI (Centro de Diagnóstico Integral) Venezuela

Este paquete contiene la solución integral para el área de Nutrición y Dietética en un Centro de Diagnóstico Integral venezolano.

## Contenido del Módulo

- **Base de Datos Relacional (`database/`):**
  - `schema_nutricion.sql`: DDL en PostgreSQL para citas, historias, evaluaciones antropométricas con cálculo automático de IMC, planes alimentarios y suplementación INN.
  - `seeds_nutricion.sql`: Catálogo precargado de suplementos (Nutrichicha, Sulfato Ferroso, Vitamina A, Micronutrientes Chispitas) y pacientes.
- **Backend (`backend/src/`):**
  - `nutrition.types.ts`: Tipos e interfaces TypeScript.
  - `nutrition.service.ts`: Lógica de aforo de citas, cálculo antropométrico (criterios OMS y cinta braquial MUAC del INN para niños), generador de planes y entrega de suplementos.
  - `nutrition.controller.ts`: Controladores REST.
  - `server.ts`: Servidor Express independiente.
- **Frontend (`frontend/src/components/`):**
  - `AgendaCitas.tsx`: Asignación y control de citas por turno (Mañana / Tarde).
  - `FichaAntropometrica.tsx`: Toma de medidas físicas y diagnóstico interactivo de IMC en vivo.
  - `PlanesYSuplementos.tsx`: Planificador dietético con alimentos locales venezolanos y entrega de suplementos.
