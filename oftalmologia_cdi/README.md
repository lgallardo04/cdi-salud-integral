# Módulo Clínico de Oftalmología - Centro de Diagnóstico Integral (CDI)
### Sistema Público Nacional de Salud (MPPS) / Fundación Misión Barrio Adentro / Misión Milagro

Este sistema es una solución integral y autónoma desarrollada para la consulta médica especializada de **Oftalmología y Cirugía Ocular Comunitaria** en un Centro de Diagnóstico Integral (CDI) venezolano.

---

## 🌟 Características Principales

### 1. Gestión de Pacientes e Historia Clínica
- Registro con validación de **Cédula de Identidad (V- / E-)**.
- Datos demográficos venezolanos: Estado, Municipio, Parroquia, Comunidad y Consejo Comunal.
- Antecedentes sistémicos y oculares (Diabetes Mellitus, Hipertensión Arterial, Glaucoma familiar).
- Historial acumulativo de consultas por paciente con acceso inmediato a evoluciones previas.

### 2. Examen Físico Oftalmológico Completo (OD vs OS)
- **Agudeza Visual (AV)**:
  - Escalas Snellen (20/20 a 20/400, Cuenta Dedos, Movimiento de Manos, Percepción de Luz).
  - Medición Sin Corrección (SC), Con Corrección (CC) y Agujero Estenopeico (PH).
  - Visión cercana en escala Jaeger (J1 a J6).
  - **Cartilla Snellen Digital Interactiva**: Accesible en pantalla para toma rápida de agudeza visual.
- **Refracción Computarizada / Subjetiva**:
  - Esfera, Cilindro, Eje (°), Adición y Distancia Pupilar (DP).
  - Prescripción para taller de óptica (Monofocales, Bifocales, Lectura, Filtro UV400).
- **Tonometría de Aplanación (PIO)**:
  - Registro en mmHg con indicador cromático de alerta:
    - 🟢 Normal (10 - 21 mmHg)
    - 🟡 Sospecha de Hipertensión Ocular (22 - 24 mmHg)
    - 🔴 Alerta Crítica de Glaucoma (> 25 mmHg)
- **Biomicroscopía con Lámpara de Hendidura**:
  - Segmento anterior, córnea, cámara anterior y cristalino (Grados de catarata I - IV).
- **Fondo de Ojo / Oftalmoscopía**:
  - Evaluación de disco óptico (relación excavación/papila E/P), mácula y retina.

### 3. Módulo de Captación y Censo Quirúrgico "Misión Milagro"
- Protocolo para Catarata (Facoemulsificación / Extracapsular), Pterigión con Autoinjerto, Chalazión y Glaucoma.
- Cálculo de Biometría y Poder de LIO (Lente Intraocular).
- Checklist preoperatorio integral: Hematología, Glicemia, Tiempos de Coagulación (TP/TPT), EKG y Riesgo Quirúrgico Cardiovascular.
- Control de estados del paciente: *Pendiente por Laboratorio*, *Apto para Quirófano*, *Programado para Jornada*, *Operado / Control Postoperatorio*.
- Exportación del censo quirúrgico a formato Excel / CSV.

### 4. Farmacia Oftalmológica (SUMED / Red CDI)
- Catálogo de colirios hipotensores (Timolol, Latanoprost, Brimonidina).
- Antibióticos y corticoides oftálmicos (Ciprofloxacino, Tobramicina, Dexametasona).
- Lubricantes oculares (Carboximetilcelulosa, Hipromelosa).
- Generación automática de récipe con posología guiada y recomendaciones de uso.

### 5. Morbilidad y Epidemiología MPPS (EPI CDI)
- Tablero de control con métricas en tiempo real.
- Gráfica interactiva de distribución diagnóstica (CIE-10).
- Exportación del reporte epidemiológico a CSV para la Dirección del ASIC y MPPS.

### 6. Impresión de Documentos Oficiales Venezolanos
Formato listo para imprimir (Ctrl + P) con membrete oficial del MPPS, ASIC y CDI:
1. **Historia Clínica Oftalmológica Especializada**
2. **Récipe Médico e Indicaciones Oftalmológicas**
3. **Ficha de Captación y Referencia Quirúrgica - Misión Milagro**
4. **Orden de Prescripción Óptica (Lentes y Cristales)**

---

## 🚀 Cómo Ejecutar el Sistema

1. **Abrir directamente en el navegador**:
   Haga doble clic en el archivo `index.html` (funciona en Google Chrome, Microsoft Edge, Mozilla Firefox o Brave).

2. **Ejecutar como servidor local** (opcional):
   En una terminal dentro de la carpeta:
   ```bash
   python -m http.server 8080
   ```
   Luego abra en su navegador: `http://localhost:8080`

---

## 💾 Respaldo y Autonomía
- Todos los datos se guardan en el navegador de manera local y persistente (`localStorage`).
- Puede respaldar y transferir la información a otra computadora mediante el botón **"Exportar Respaldo Completo (JSON)"** en la pestaña *Ajustes CDI*.
