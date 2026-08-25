# CDI - Sistema Integral de Gestión de Salud

Sistema hospitalario moderno, multiplataforma, 100% responsivo y de alta fidelidad clínica para **Centros de Diagnóstico Integral (CDI)**.

Diseñado para funcionar en computadoras de escritorio (**PC/Mac**), tabletas, teléfonos inteligentes (**Web / PWA**) y compilable como aplicación móvil nativa **Android (APK)** mediante Capacitor y Android Studio.

---

## 📱 Experiencia Móvil de Primera Clase (Mobile-First)

- **Diseño Responsivo con Stitch MCP**: Basado en el sistema de diseño *"Clinical Precision"* con tokens Deep Navy (`#0f172a`), Healthcare Blue (`#2563eb`), Soft Teal (`#0d9488`) y semántica médica de urgencias.
- **Navegación Inferior (Bottom Navigation Bar)**: Acceso con 1 toque con el pulgar a Inicio, Triaje Urgencias (NEWS2), Pacientes, Citas, Farmacia y Menú Completo de Módulos.
- **Botón de Acción Rápida (Speed Dial FAB)**: Acciones clínicas instantáneas desde cualquier pantalla:
  - 🩺 Triaje de Urgencia (NEWS2)
  - 👤 Registrar Nuevo Paciente
  - 📅 Agendar Cita Médica
  - 💊 Dispensar Fármaco / Farmacia
  - 🔬 Crear Orden de Laboratorio
- **Selector Rápido de Roles (Bottom Sheet)**: Permite alternar roles médicos y asistenciales en 1 toque desde la cabecera móvil.
- **Motor Adaptativo de Tarjetas Clínicas (`DataTable`)**: Convierte automáticamente tablas densas en tarjetas táctiles con badges de estado, resumen de signos vitales y botones de acción rápida en pantallas móviles.
- **Modales Deslizantes (Bottom Sheets)**: Diálogos y formularios táctiles con barra de arrastre superior (*grab handle*) y botones fijos al alcance del pulgar.
- **Soporte PWA y Safe Area Insets**: Iconos de app clínica, soporte para muescas/notches de pantalla (`viewport-fit=cover`), tema de color oscuro y funcionamiento 100% autónomo sin internet (*Offline-First*).

---

## 🏥 Módulos del Sistema (24 Módulos Clínicos y Asistenciales)

1. **Dashboard / Panel Principal**: Métricas asistenciales en tiempo real, ocupación de camas, flujo de citas, alertas de stock crítico y atajos rápidos.
2. **Triaje Urgencias (NEWS2)**: Clasificación de riesgo clínico Manchester/ESI, toma de signos vitales (PA, FC, Temp, SpO2, FR, Glasgow) y cálculo automatizado del puntaje National Early Warning Score (NEWS2).
3. **Hospitalización y Gestión de Camas**: Censo hospitalario interactivo en vivo por alas/salas, notas de evolución médica SOAP, Kardex de enfermería y control de altas.
4. **Pacientes e Historias Clínicas**: Expediente clínico electrónico, datos filiatorios, antecedentes patológicos, grupo sanguíneo, alergias, contactos de emergencia y ficha médica imprimible.
5. **Citas y Consultas**: Agenda médica inteligente, filtros por especialidad, control de estados (Pendiente, En Triaje, En Consulta, Completada) y asignación de consultorios.
6. **Tratamientos y Récipes**: Planes terapéuticos, constructor de prescripciones con múltiples medicamentos, dosis, frecuencias, duración e impresión de **Récipe Médico Oficial con QR y sello**.
7. **Laboratorio Clínico (LIS)**: Gestión de bioanálisis, perfiles hematológicos y bioquímicos, valores de referencia, validación de resultados y certificados con código QR.
8. **Imagenología y Radiología (RIS/PACS)**: Visor DICOM interactivo con herramientas de zoom, contraste, inversión, brillo y biblioteca de placas radiológicas, ecografías y tomografías.
9. **Odontología y Odontograma Anatómico**: Mapeo dental interactivo FDI por caras vestibulares/linguales, registro de caries, restauraciones, endodoncias y periodoncia.
10. **Telemedicina e Interconsultas**: Videoconsultas médicas simuladas en tiempo real, chat asistencial e interconsultas entre especialistas.
11. **Farmacia y Movimientos**: Control estricto de entradas/compras, salidas/despachos a pacientes, ajustes, mermas, lotes y fechas de vencimiento.
12. **Catálogo de Medicamentos**: Principio activo, presentación, vía de administración, umbrales de stock mínimo/máximo, estantería y alertas visuales de desabastecimiento.
13. **Proveedores**: Directorio de laboratorios farmacéuticos y distribuidores médicos, RIF, persona de contacto y plazos de pago.
14. **Baremos y Facturación Hospitalaria**: Tarifario de procedimientos y servicios, conversión multidivisa USD/Bs, facturación y exoneración 100% asistencial CDI.
15. **Epidemiología y Salud Pública (EPI-12)**: Vigilancia epidemiológica semanal, canales endémicos, tasas de ataque y notificación de brotes.
16. **Portal del Paciente / Kiosko Digital**: Autogestión táctil para pacientes: consulta de citas, descarga de récipes con código QR y evaluador preliminar de síntomas.
17. **Departamentos y Servicios**: Áreas médicas (Medicina General, Emergencia, Cardiología, Laboratorio, Rayos X), capacidad de camas y extensiones.
18. **Personal y Empleados**: Ficha de médicos, enfermería, técnicos y personal administrativo, número de colegiatura MPPS y vinculación departamental.
19. **Estructura de Cargos**: Organigrama de puestos, niveles jerárquicos y escalas salariales.
20. **Horarios y Turnos**: Programación de guardias (Matutino, Vespertino, Nocturno, 24 Horas) y asignación a personal.
21. **Usuarios del Sistema**: Cuentas de acceso, credenciales y estados de actividad.
22. **Roles y Permisos (RBAC)**: Matriz de seguridad granular (`Ver`, `Crear`, `Editar`, `Eliminar`, `Exportar`) para Administrador, Médico, Enfermero/a, Farmacéutico/a, Recepcionista y Auditor.
23. **Auditoría HIPAA y Trazabilidad**: Registro inmutable de seguridad de cada acción realizada en historias clínicas.
24. **Motor de Datos Dual**: Almacenamiento local reactivo (Offline-First) + Sincronización REST API con FastAPI.

---

## 🎨 Sistema de Diseño "Clinical Precision" (Stitch MCP)

- **Paleta de Colores**:
  - `Deep Navy` (`#0f172a`): Estructura, cabeceras y barra lateral de navegación.
  - `Healthcare Blue` (`#2563eb`): Botones de acción primaria, enlaces y elementos interactivos.
  - `Soft Teal` (`#0d9488`): Indicadores clínicos, tendencias positivas y badges informativos.
  - `Superficies Clínicas` (`#f8fafc` / `#ffffff`): Fondos de alto contraste con bordes limpios de 1px.
  - `Semántica de Urgencia`: Urgente (`#dc2626`), Advertencia (`#d97706`), Estable/Éxito (`#16a34a`).
- **Tipografía**:
  - `Inter`: Legibilidad óptima en pantallas móviles y textos asistenciales.
  - `JetBrains Mono`: Datos tabulares numéricos, signos vitales, lotes de medicamentos y códigos.

---

## 📂 Estructura del Proyecto

```
/home/lgallardo/Escritorio/proyectos/cdi-salud-integral/
├── frontend/                     # Aplicación React + TypeScript + Vite + Capacitor
│   ├── src/
│   │   ├── components/           # Componentes UI (Sidebar, Header, BottomNav, MobileSheet, FAB, Modal, DataTable)
│   │   ├── context/              # AuthContext (roles y permisos) y DataContext (estado global reactivo)
│   │   ├── services/             # Motor Dual: LocalDataService (Offline) + ApiService (REST)
│   │   ├── types/                # Definiciones TypeScript de las 24 entidades
│   │   ├── views/                # Vistas de los 24 módulos y Dashboard clínico
│   │   └── index.css             # Sistema de diseño CSS Clinical Precision Mobile
│   ├── public/                   # Manifiesto PWA, favicon SVG y assets
│   ├── android/                  # Proyecto nativo Android (Gradle / Android Studio)
│   └── capacitor.config.ts       # Configuración para compilación de APK
├── backend/                      # API REST Profesional (Python FastAPI + SQLAlchemy)
│   ├── routers/                  # Endpoints REST para los 24 módulos
│   ├── models.py                 # Modelos ORM relacionales
│   ├── schemas.py                # Esquemas Pydantic
│   ├── seed.py                   # Poblado de datos iniciales en español
│   ├── database.py               # Conexión SQLite / PostgreSQL
│   ├── main.py                   # Servidor FastAPI con CORS y soporte estático
│   └── test_api.py               # Suite de pruebas automatizadas
├── scripts/
│   ├── build_all.sh              # Compilación completa del proyecto
│   └── build_apk_helper.sh       # Asistente para generar el APK Android
└── README.md                     # Documentación general
```

---

## 🚀 Instrucciones de Compilación y Uso

### 1. Compilación Completa del Proyecto
Desde la terminal, ejecuta el script automatizado:
```bash
cd /home/lgallardo/Escritorio/proyectos/cdi-salud-integral
./scripts/build_all.sh
```

### 2. Generar Aplicación Móvil Android (APK)
Para generar el archivo APK instalable en cualquier teléfono o tableta Android:

**Opción A (Con Android Studio):**
```bash
cd /home/lgallardo/Escritorio/proyectos/cdi-salud-integral/frontend
npx cap open android
```
En Android Studio ve a: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

**Opción B (Línea de Comandos con Gradle):**
```bash
cd /home/lgallardo/Escritorio/proyectos/cdi-salud-integral/frontend/android
./gradlew assembleDebug
```
El archivo APK quedará generado en:
`frontend/android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Ejecutar Pruebas Automatizadas del Backend
```bash
cd /home/lgallardo/Escritorio/proyectos/cdi-salud-integral/backend
.venv/bin/python test_api.py
```

---

## 🔒 Usuarios de Prueba Preconfigurados (Simulador de Roles)

En la cabecera superior del sistema puedes alternar inmediatamente entre los diferentes roles para verificar los permisos y restricciones:

| Usuario | Nombre | Rol Asignado | Alcance |
|---|---|---|---|
| `admin` | Administrador del CDI | **Administrador** | Acceso total a los 24 módulos y configuración |
| `dr.carlos` | Dr. Carlos Mendoza | **Médico** | Pacientes, Citas, Tratamientos, Farmacia, Catálogo |
| `dra.elena` | Dra. Elena Ramos | **Médico** | Pacientes, Citas, Tratamientos, Farmacia, Catálogo |
| `enf.patricia` | Lic. Patricia Silva | **Enfermero/a** | Triaje, Signos Vitales, Pacientes, Citas, Farmacia |
| `farm.luisana` | Farm. Luisana Soto | **Farmacéutico/a** | Farmacia, Medicamentos, Lotes, Proveedores |
| `recep.carmen` | Carmen Flores | **Recepcionista** | Citas, Triaje preliminar, Pacientes |

---

## ✨ Características Destacadas

- **100% Mobile Ready**: Optimizada para uso táctil con una sola mano, bottom sheets, Speed Dial FAB, adaptabilidad de tarjetas e interfaces médicas ergonómicas.
- **Diseño Stitch MCP ("Clinical Precision")**: Paleta médica probada, contraste visual accesible, jerarquía limpia y tipografía mono para datos cuantitativos.
- **Doble Motor de Datos (Offline-First + REST API)**: Funciona de forma 100% autónoma en el navegador o en la app móvil sin necesidad de internet ni servidor externo, persistiendo datos localmente, y cuenta con un conector listo para enlazar con la API de FastAPI.
- **Exportación e Impresión Oficial**:
  - Exportación en 1 clic de cualquier módulo a formato **CSV** y copia de seguridad en **JSON**.
  - Formato oficial de **Expediente Clínico del Paciente** e impresión de **Récipe Médico con sello, firma y código QR**.
- **Control de Inventario Farmacéutico**: Descuenta automáticamente el stock de medicamentos al realizar despachos a pacientes y advierte con barras de progreso cuando el inventario cae bajo el umbral mínimo.
