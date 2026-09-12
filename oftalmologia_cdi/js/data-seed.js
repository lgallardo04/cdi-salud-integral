// Datos semilla iniciales para el módulo de oftalmología CDI venezolano
const SEED_CONFIG = {
  cdiName: "CDI Dr. Salvador Allende",
  asicName: "ASIC Chuao - El Cafetal",
  estado: "Miranda",
  municipio: "Baruta",
  parroquia: "El Cafetal",
  oftalmologo: "Dra. Yuliet González (Misión Médica / MPPS)",
  registroMPPS: "MPPS-108.452",
  coordinadorCDI: "Dr. Carlos Mendoza"
};

const MEDICAMENTOS_SUMED = [
  { id: "timolol", nombre: "Maleato de Timolol 0.5%", tipo: "Hipotensor Ocular", dosis: "1 gota cada 12 horas en el ojo afectado", presentacion: "Frasco gotero 5 ml", advertencia: "No suspender sin indicación médica. Precaución en asmáticos o bradicárdicos." },
  { id: "latanoprost", nombre: "Latanoprost 0.005%", tipo: "Hipotensor Ocular", dosis: "1 gota en la noche (cada 24 horas)", presentacion: "Frasco gotero 2.5 ml", advertencia: "Mantener en refrigeración antes de abrir. Puede oscurecer el iris." },
  { id: "brimonidina", nombre: "Tartrato de Brimonidina 0.2%", tipo: "Hipotensor Ocular", dosis: "1 gota cada 12 horas", presentacion: "Frasco gotero 5 ml", advertencia: "Monitorear presión arterial." },
  { id: "ciprofloxacino", nombre: "Ciprofloxacino Oftálmico 0.3%", tipo: "Antibiótico Ocular", dosis: "1 gota cada 6 horas por 7 días", presentacion: "Frasco gotero 5 ml", advertencia: "Cumplir los 7 días completos." },
  { id: "tobramicina", nombre: "Tobramicina 0.3%", tipo: "Antibiótico Ocular", dosis: "1 gota cada 6 horas por 7 a 10 días", presentacion: "Frasco gotero 5 ml", advertencia: "Uso oftálmico estricto." },
  { id: "tobramicina_dexa", nombre: "Tobramicina + Dexametasona", tipo: "Antibiótico + Corticoide", dosis: "1 gota cada 8 horas por 5 días, luego reducir", presentacion: "Frasco gotero 5 ml", advertencia: "No usar por más de 7 días continuos sin control de PIO." },
  { id: "carboximetil", nombre: "Carboximetilcelulosa 0.5% (Lágrimas Artificiales)", tipo: "Lubricante Ocular", dosis: "1 gota cada 4 a 6 horas según necesidad", presentacion: "Frasco gotero 15 ml", advertencia: "Aplicar con las manos limpias." },
  { id: "hipromelosa", nombre: "Hipromelosa al 0.5%", tipo: "Lubricante Ocular", dosis: "1 gota 3 a 4 veces al día", presentacion: "Frasco gotero 10 ml", advertencia: "Alivia sequedad y ardor ocular." },
  { id: "diclofenaco_oft", nombre: "Diclofenaco Sódico 0.1% Colirio", tipo: "Antiinflamatorio AINE", dosis: "1 gota cada 8 horas por 5 días", presentacion: "Frasco gotero 5 ml", advertencia: "Indicado en postoperatorio o queratitis leve." }
];

const DIAGNOSTICOS_FRECUENTES = [
  { cie: "H25.9", nombre: "Catarata Senil no especificada", grupo: "Cristalino", quirurgico: true },
  { cie: "H25.1", nombre: "Catarata Senil Nuclear", grupo: "Cristalino", quirurgico: true },
  { cie: "H25.0", nombre: "Catarata Senil Cortical Incipiente", grupo: "Cristalino", quirurgico: false },
  { cie: "H11.0", nombre: "Pterigión Primario / Carnosidad", grupo: "Córnea/Conjuntiva", quirurgico: true },
  { cie: "H11.01", nombre: "Pterigión Recidivante", grupo: "Córnea/Conjuntiva", quirurgico: true },
  { cie: "H40.1", nombre: "Glaucoma Primario de Ángulo Abierto", grupo: "Glaucoma", quirurgico: false },
  { cie: "H40.2", nombre: "Glaucoma Primario de Ángulo Cerrado", grupo: "Glaucoma", quirurgico: true },
  { cie: "H52.1", nombre: "Miopía", grupo: "Refracción", quirurgico: false },
  { cie: "H52.2", nombre: "Astigmatismo", grupo: "Refracción", quirurgico: false },
  { cie: "H52.0", nombre: "Hipermetropía", grupo: "Refracción", quirurgico: false },
  { cie: "H52.4", nombre: "Presbicia", grupo: "Refracción", quirurgico: false },
  { cie: "H36.0", nombre: "Retinopatía Diabética", grupo: "Retina", quirurgico: false },
  { cie: "H35.0", nombre: "Retinopatía Hipertensiva", grupo: "Retina", quirurgico: false },
  { cie: "H10.9", nombre: "Conjuntivitis aguda", grupo: "Superficie Ocular", quirurgico: false },
  { cie: "H00.1", nombre: "Chalazión / Meibomianitis", grupo: "Párpados", quirurgico: true },
  { cie: "H04.1", nombre: "Síndrome de Ojo Seco", grupo: "Superficie Ocular", quirurgico: false }
];

const SEED_PACIENTES = [
  {
    id: "PAC-001",
    tipoDoc: "V",
    cedula: "4892150",
    nombres: "Carmen Elena",
    apellidos: "Rodríguez de Salazar",
    edad: 68,
    sexo: "F",
    fechaNac: "1958-03-14",
    telefono: "0414-2345678",
    estado: "Miranda",
    municipio: "Baruta",
    parroquia: "El Cafetal",
    comunidad: "Sector Santa Sofía, Calle 3",
    ocupacion: "Jubilada / Educadora",
    antecedentes: ["Hipertensión Arterial", "Diabetes Mellitus Tipo 2"],
    alergias: "Penicilina",
    consultas: [
      {
        id: "CONS-2026-001",
        fecha: "2026-09-02T10:30:00",
        motivo: "Disminución progresiva de la agudeza visual en ojo derecho de 1 año de evolución.",
        enfermedadActual: "Paciente femenina de 68 años con antecedente de DM2 de 12 años de data, refiere que desde hace aproximadamente 12 meses nota visión borrosa 'como si viera a través de una neblina' en ojo derecho que le impide leer y reconocer rostros.",
        agudezaVisual: {
          od: { sc: "20/200", cc: "20/100", ph: "20/80", cerca: "J5" },
          os: { sc: "20/40", cc: "20/25", ph: "20/20", cerca: "J1" }
        },
        refraccion: {
          od: { esfera: "+1.50", cilindro: "-0.75", eje: "85", adic: "+2.75" },
          os: { esfera: "+0.75", cilindro: "-0.50", eje: "90", adic: "+2.75" },
          dp: "62"
        },
        tonometria: { od: 16, os: 15, metodo: "Goldmann" },
        biomicroscopia: {
          od: "Párpados libres. Conjuntiva normocoloreada. Córnea transparente. Cámara anterior formada, Van Herick IV. Iris regular reactivo. Cristalino: Opacidad nuclear densa Grado III (LOCS III) + opacidad subcapsular posterior.",
          os: "Párpados normales. Córnea transparente. Cristalino: Esclerosis nuclear leve Grado I."
        },
        fondoOjo: {
          od: "Visibilidad disminuida por catarata nuclear. Se aprecia papila de bordes netos, relación E/P 0.3. Sin hemorragias evidentes en polo posterior.",
          os: "Papila rosada de bordes definidos, E/P 0.3. Mácula brillante. Vasos con leve cruce arteriovenoso sin retinopatía proliferativa."
        },
        diagnosticos: [
          { cie: "H25.1", nombre: "Catarata Senil Nuclear OD (Grado III)", ojo: "OD" },
          { cie: "H52.4", nombre: "Presbicia Bilateral", ojo: "OU" }
        ],
        misionMilagro: {
          candidato: true,
          ojoQuirurgico: "OD",
          cirugia: "Facoemulsificación + Implante de LIO (Catarata)",
          prioridad: "Alta",
          biometriaLIO: "+21.5 D",
          estadoProtocolo: "Apto para Quirófano",
          laboratorio: {
            hematologia: "Normal (Hb 12.8 g/dl)",
            glicemia: "110 mg/dl (Controlada)",
            tpTpt: "TP 12.5s / TPT 31s (Normal)",
            ekg: "Ritmo sinusal, sin signos de isquemia",
            riesgoCardiovascular: "Riesgo Quirúrgico Grado II (Goldman)",
            aprobadoFecha: "2026-09-04"
          }
        },
        tratamiento: [
          { medicamento: "Carboximetilcelulosa 0.5%", dosis: "1 gota cada 6 horas en ambos ojos" },
          { medicamento: "Lágrimas Artificiales", dosis: "Uso continuo para confort de superficie ocular" }
        ],
        lentesPrescritos: {
          tipo: "Lectura / Cerca",
          od: "+3.50",
          os: "+3.50",
          observaciones: "Para visión cercana mientras se realiza cirugía de OD."
        },
        observaciones: "Paciente captada formalmente para jornada quirúrgica de Misión Milagro en el CDI."
      }
    ]
  },
  {
    id: "PAC-002",
    tipoDoc: "V",
    cedula: "12345678",
    nombres: "José Gregorio",
    apellidos: "Pérez Hernández",
    edad: 52,
    sexo: "M",
    fechaNac: "1974-06-20",
    telefono: "0412-9876543",
    estado: "Miranda",
    municipio: "Baruta",
    parroquia: "El Cafetal",
    comunidad: "Barrio Santa Cruz del Este",
    ocupacion: "Obrero de Construcción / Conductor",
    antecedentes: ["Exposición solar crónica"],
    alergias: "Ninguna conocida",
    consultas: [
      {
        id: "CONS-2026-002",
        fecha: "2026-09-05T09:15:00",
        motivo: "Carnosidad en ojo derecho, enrojecimiento, ardor y sensación de cuerpo extraño.",
        enfermedadActual: "Paciente masculino de 52 años quien labora en albañilería a la intemperie. Refiere lesión en ojo derecho de más de 4 años que ha avanzado hacia la pupila con episodios frecuentes de inflamación y ardor.",
        agudezaVisual: {
          od: { sc: "20/50", cc: "20/30", ph: "20/25", cerca: "J2" },
          os: { sc: "20/25", cc: "20/20", ph: "20/20", cerca: "J1" }
        },
        refraccion: {
          od: { esfera: "+0.50", cilindro: "-2.00", eje: "15", adic: "+2.00" },
          os: { esfera: "+0.25", cilindro: "-0.50", eje: "180", adic: "+2.00" },
          dp: "64"
        },
        tonometria: { od: 14, os: 15, metodo: "Goldmann" },
        biomicroscopia: {
          od: "Párpados normales. Conjuntiva con pterigión nasal Grado III que sobrepasa el limbo corneal 3.5 mm hacia el área pupilar, vascularizado, con islotes de Fuchs. Córnea clara en periferia. Cámara anterior normal. Cristalino transparente.",
          os: "Conjuntiva con pterigión nasal Grado I (incipiente, < 1 mm). Córnea transparente. Cristalino claro."
        },
        fondoOjo: {
          od: "Papila rosada, bordes nítidos, excavación 0.2. Mácula normal. Retina aplicada sin desgarros.",
          os: "Fondo de ojo dentro de límites normales."
        },
        diagnosticos: [
          { cie: "H11.0", nombre: "Pterigión Nasal Grado III OD", ojo: "OD" },
          { cie: "H52.2", nombre: "Astigmatismo corneal inducido OD", ojo: "OD" },
          { cie: "H52.4", nombre: "Presbicia", ojo: "OU" }
        ],
        misionMilagro: {
          candidato: true,
          ojoQuirurgico: "OD",
          cirugia: "Resección de Pterigión + Autoinjerto Conjuntival con sutura nylon 10-0",
          prioridad: "Media",
          biometriaLIO: "N/A",
          estadoProtocolo: "Pendiente por Laboratorio",
          laboratorio: {
            hematologia: "Pendiente",
            glicemia: "Pendiente",
            tpTpt: "Pendiente",
            ekg: "Pendiente",
            riesgoCardiovascular: "Pendiente",
            aprobadoFecha: ""
          }
        },
        tratamiento: [
          { medicamento: "Carboximetilcelulosa 0.5%", dosis: "1 gota cada 4 horas en OD" },
          { medicamento: "Tobramicina + Dexametasona", dosis: "1 gota cada 8 horas por 4 días solo en crisis inflamatoria aguda" }
        ],
        lentesPrescritos: {
          tipo: "Gafas de sol con protección UV400 y corrección para trabajo",
          od: "Neutro / UV400",
          os: "Neutro / UV400",
          observaciones: "Uso obligatorio de lentes oscuros y visera en su trabajo."
        },
        observaciones: "Se entrega orden para laboratorios y EKG en el CDI para posterior resolución quirúrgica."
      }
    ]
  },
  {
    id: "PAC-003",
    tipoDoc: "V",
    cedula: "6781234",
    nombres: "María Auxiliadora",
    apellidos: "Gómez de Blanco",
    edad: 64,
    sexo: "F",
    fechaNac: "1962-11-10",
    telefono: "0426-5551234",
    estado: "Miranda",
    municipio: "Baruta",
    parroquia: "El Cafetal",
    comunidad: "Urb. Las Mesetas",
    ocupacion: "Costurera",
    antecedentes: ["Hipertensión Arterial", "Madre ciega por glaucoma"],
    alergias: "Sulfa",
    consultas: [
      {
        id: "CONS-2026-003",
        fecha: "2026-09-07T11:00:00",
        motivo: "Control de rutina y pesadez ocular frecuente con dolor de cabeza frontal.",
        enfermedadActual: "Paciente femenina de 64 años quien acude a despistaje ocular por antecedente familiar directo de ceguera por glaucoma.",
        agudezaVisual: {
          od: { sc: "20/40", cc: "20/20", ph: "20/20", cerca: "J1" },
          os: { sc: "20/50", cc: "20/25", ph: "20/20", cerca: "J2" }
        },
        refraccion: {
          od: { esfera: "+1.25", cilindro: "-0.50", eje: "75", adic: "+2.50" },
          os: { esfera: "+1.50", cilindro: "-0.75", eje: "105", adic: "+2.50" },
          dp: "61"
        },
        tonometria: { od: 27, os: 25, metodo: "Goldmann" },
        biomicroscopia: {
          od: "Córnea transparente, sin edema. Cámara anterior amplia, ángulo abierto Van Herick grado IV. Iris trófico. Cristalino con esclerosis nuclear leve.",
          os: "Córnea clara. Cámara anterior profunda. Cristalino transparente."
        },
        fondoOjo: {
          od: "Papila de bordes nítidos pero con excavación patológica marcada E/P 0.7, rechazo nasal de vasos, adelgazamiento del anillo neurorretiniano inferior.",
          os: "Papila con excavación E/P 0.65, relación asimétrica y muesca superior incipiente."
        },
        diagnosticos: [
          { cie: "H40.1", nombre: "Glaucoma Primario de Ángulo Abierto Bilateral (Descompensado)", ojo: "OU" },
          { cie: "H52.4", nombre: "Presbicia", ojo: "OU" }
        ],
        misionMilagro: {
          candidato: false,
          ojoQuirurgico: "Ninguno",
          cirugia: "Manejo médico hipotensor estricto (no quirúrgico por ahora)",
          prioridad: "N/A",
          biometriaLIO: "N/A",
          estadoProtocolo: "Control Clínico",
          laboratorio: {}
        },
        tratamiento: [
          { medicamento: "Maleato de Timolol 0.5%", dosis: "1 gota cada 12 horas en ambos ojos (08:00 am y 08:00 pm)" },
          { medicamento: "Tartrato de Brimonidina 0.2%", dosis: "1 gota cada 12 horas (con 10 min de separación del timolol)" },
          { medicamento: "Carboximetilcelulosa 0.5%", dosis: "1 gota cada 6 horas" }
        ],
        lentesPrescritos: {
          tipo: "Bifocales Flat-Top",
          od: "Lejos: +1.25 -0.50x75° / Cerca: +3.75",
          os: "Lejos: +1.50 -0.75x105° / Cerca: +4.00",
          observaciones: "Uso continuo para costura y descanso."
        },
        observaciones: "ALERTA: PIO elevada bilateral (>25 mmHg) con neuropatía glaucomatosa evidente. Se cita a reevaluación de PIO en 15 días."
      }
    ]
  },
  {
    id: "PAC-004",
    tipoDoc: "V",
    cedula: "24112334",
    nombres: "Andrés Eloy",
    apellidos: "Blanco Márquez",
    edad: 29,
    sexo: "M",
    fechaNac: "1997-04-18",
    telefono: "0416-7890123",
    estado: "Miranda",
    municipio: "Baruta",
    parroquia: "El Cafetal",
    comunidad: "Caurimare",
    ocupacion: "Estudiante Universitario / Diseñador Gráfico",
    antecedentes: ["Astenopia / Fatiga visual"],
    alergias: "Ninguna",
    consultas: [
      {
        id: "CONS-2026-004",
        fecha: "2026-09-08T14:20:00",
        motivo: "Visión borrosa de lejos, cefalea frontal vespertina y cansancio visual frente a pantallas.",
        enfermedadActual: "Paciente masculino de 29 años, sin antecedentes mórbidos de importancia, refiere dificultad progresiva para ver de lejos y dolor ocular tras jornadas de trabajo frente a computador.",
        agudezaVisual: {
          od: { sc: "20/100", cc: "20/20", ph: "20/20", cerca: "J1" },
          os: { sc: "20/100", cc: "20/20", ph: "20/20", cerca: "J1" }
        },
        refraccion: {
          od: { esfera: "-1.75", cilindro: "-1.25", eje: "175", adic: "0.00" },
          os: { esfera: "-2.00", cilindro: "-1.00", eje: "5", adic: "0.00" },
          dp: "65"
        },
        tonometria: { od: 13, os: 13, metodo: "Goldmann" },
        biomicroscopia: {
          od: "Segmento anterior totalmente normal. Córnea lisa y brillante. Cristalino transparente.",
          os: "Segmento anterior sin alteraciones. Cristalino transparente."
        },
        fondoOjo: {
          od: "Papila rosada de bordes nítidos, E/P 0.2. Mácula normal con brillo foveal presente. Retina aplicada.",
          os: "Fondo de ojo normal bilateral."
        },
        diagnosticos: [
          { cie: "H52.1", nombre: "Miopía Simple Bilateral", ojo: "OU" },
          { cie: "H52.2", nombre: "Astigmatismo Miópico Compuesto", ojo: "OU" },
          { cie: "H04.1", nombre: "Fatiga Visual / Ojo Seco Evaporativo", ojo: "OU" }
        ],
        misionMilagro: {
          candidato: false,
          ojoQuirurgico: "Ninguno",
          cirugia: "No quirúrgico (Manejo refractivo)",
          prioridad: "N/A",
          biometriaLIO: "N/A",
          estadoProtocolo: "Asignación de Lentes",
          laboratorio: {}
        },
        tratamiento: [
          { medicamento: "Carboximetilcelulosa 0.5%", dosis: "1 gota en ambos ojos cada 4 horas durante el uso de pantallas" }
        ],
        lentesPrescritos: {
          tipo: "Monofocal con filtro antirreflejo y luz azul (Blue Defense)",
          od: "Esf: -1.75 / Cil: -1.25 x 175°",
          os: "Esf: -2.00 / Cil: -1.00 x 5°",
          observaciones: "Aprobada solicitud de montura y cristales por programa de salud visual comunitaria CDI."
        },
        observaciones: "Se realiza entrega de orden para taller de optometría comunitaria. Control en 1 año."
      }
    ]
  }
];
