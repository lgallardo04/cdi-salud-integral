# Módulo de Farmacia Comunitaria - CDI (Centro de Diagnóstico Integral) Venezuela

Este paquete contiene la solución completa para el control de inventario, recepción de récipes interdepartamentales y dispensación bajo normativa sanitaria en un Centro de Diagnóstico Integral venezolano.

## Contenido del Módulo

- **Base de Datos Relacional (`database/`):**
  - `schema_farmacia.sql`: DDL en PostgreSQL para catálogo de medicamentos, lotes, récipes interdepartamentales, dispensaciones, libro Kardex y vistas de alerta de vencimiento.
  - `seeds_farmacia.sql`: Catálogo precargado de medicamentos habituales de CDI (colirios de Oftalmología como Timolol/Tobramicina, antihipertensivos, hipoglucemiantes) y récipe de prueba.
- **Backend (`backend/src/`):**
  - `pharmacy.types.ts`: Tipos e interfaces TypeScript.
  - `pharmacy.service.ts`: Transacción atómica de dispensación con política estricta **FEFO** (*First Expired, First Out*), control de Kardex y alertas de caducidad.
  - `pharmacy.controller.ts`: Controladores REST.
  - `server.ts`: Servidor Express independiente.
- **Frontend (`frontend/src/components/`):**
  - `InventarioDashboard.tsx`: Monitor de existencias y semáforo de alertas (&lt;30d rojo, &lt;90d amarillo, quiebres de stock).
  - `RecepcionRecipe.tsx`: Radicación de órdenes médicas emitidas por Oftalmología, Medicina General Integral, Sala de Urgencias, etc.
  - `DispensacionEstacion.tsx`: Estación de entrega y confirmación de retiro a paciente o familiar.
