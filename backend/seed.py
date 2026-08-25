from database import engine, SessionLocal, Base
import models

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    def safe_seed(model_cls, items):
        try:
            if db.query(model_cls).count() == 0:
                db.add_all(items)
                db.commit()
        except Exception as err:
            db.rollback()
            print(f"Error seeding {model_cls.__name__}: {err}")

    try:
        print("Poblando base de datos con datos médicos iniciales del CDI...")

        # 1. Roles
        roles_data = [
            models.RoleModel(
                id="rol-1",
                nombre="Administrador",
                descripcion="Acceso total y configuración del CDI",
                permisos={mod: {"ver": True, "crear": True, "editar": True, "eliminar": True, "exportar": True} for mod in [
                    "dashboard", "farmacia", "proveedores", "pacientes", "empleados", "cargos", "usuarios", "departamentos", "horarios", "medicamentos", "tratamientos", "citas", "roles"
                ]}
            ),
            models.RoleModel(
                id="rol-2",
                nombre="Médico",
                descripcion="Gestión clínica, consultas, citas y tratamientos",
                permisos={
                    "dashboard": {"ver": True, "crear": False, "editar": False, "eliminar": False, "exportar": True},
                    "pacientes": {"ver": True, "crear": True, "editar": True, "eliminar": False, "exportar": True},
                    "citas": {"ver": True, "crear": True, "editar": True, "eliminar": False, "exportar": True},
                    "tratamientos": {"ver": True, "crear": True, "editar": True, "eliminar": False, "exportar": True},
                    "medicamentos": {"ver": True, "crear": False, "editar": False, "eliminar": False, "exportar": True},
                    "farmacia": {"ver": True, "crear": False, "editar": False, "eliminar": False, "exportar": False}
                }
            ),
            models.RoleModel(
                id="rol-3",
                nombre="Enfermero/a",
                descripcion="Triaje, signos vitales y suministros asistenciales",
                permisos={
                    "dashboard": {"ver": True, "crear": False, "editar": False, "eliminar": False, "exportar": False},
                    "pacientes": {"ver": True, "crear": True, "editar": True, "eliminar": False, "exportar": False},
                    "citas": {"ver": True, "crear": True, "editar": True, "eliminar": False, "exportar": False},
                    "farmacia": {"ver": True, "crear": True, "editar": False, "eliminar": False, "exportar": False}
                }
            ),
            models.RoleModel(
                id="rol-4",
                nombre="Farmacéutico/a",
                descripcion="Control de stock, lotes, vencimientos y dispensación",
                permisos={
                    "dashboard": {"ver": True, "crear": False, "editar": False, "eliminar": False, "exportar": True},
                    "farmacia": {"ver": True, "crear": True, "editar": True, "eliminar": True, "exportar": True},
                    "medicamentos": {"ver": True, "crear": True, "editar": True, "eliminar": True, "exportar": True},
                    "proveedores": {"ver": True, "crear": True, "editar": True, "eliminar": False, "exportar": True}
                }
            )
        ]
        safe_seed(models.RoleModel, roles_data)

        # 2. Departamentos
        deps_data = [
            models.DepartamentoModel(
                id="dep-1",
                codigo="EMERG",
                nombre="Emergencia y Triaje",
                descripcion="Atención médica inmediata y estabilización de urgencias",
                piso="Planta Baja - Ala Norte",
                responsable="Dr. Roberto Gómez",
                capacidadCamas=14,
                consultorios=3,
                telefonoInterno="101"
            ),
            models.DepartamentoModel(
                id="dep-2",
                codigo="MEDGEN",
                nombre="Medicina General y Consulta Externa",
                descripcion="Consultas médicas integrales y seguimiento",
                piso="Piso 1 - Módulo A",
                responsable="Dra. Elena Ramos",
                capacidadCamas=0,
                consultorios=6,
                telefonoInterno="102"
            ),
            models.DepartamentoModel(
                id="dep-3",
                codigo="CARDIO",
                nombre="Cardiología y Electrocardiografía",
                descripcion="Evaluación cardiovascular, ecocardiogramas",
                piso="Piso 1 - Módulo B",
                responsable="Dr. Carlos Mendoza",
                capacidadCamas=4,
                consultorios=2,
                telefonoInterno="103"
            ),
            models.DepartamentoModel(
                id="dep-6",
                codigo="FARM",
                nombre="Farmacia Central y Dispensación",
                descripcion="Almacén y despacho gratuito de medicamentos",
                piso="Planta Baja - Pasillo Central",
                responsable="Farm. Luisana Soto",
                capacidadCamas=0,
                consultorios=1,
                telefonoInterno="106"
            )
        ]
        safe_seed(models.DepartamentoModel, deps_data)

        # 3. Cargos
        cargos_data = [
            models.CargoModel(
                id="car-1",
                titulo="Director Médico de CDI",
                departamentoId="dep-2",
                departamentoNombre="Medicina General y Consulta Externa",
                nivelJerarquico="Directivo",
                salarioBase=1200.0,
                requisitos="Médico Especialista con +5 años en gestión sanitaria",
                descripcion="Dirección técnica y operativa del centro"
            ),
            models.CargoModel(
                id="car-2",
                titulo="Médico Especialista en Cardiología",
                departamentoId="dep-3",
                departamentoNombre="Cardiología y Electrocardiografía",
                nivelJerarquico="Médico Especialista",
                salarioBase=950.0,
                requisitos="Postgrado en Cardiología y colegiatura",
                descripcion="Atención cardiológica y lectura de ECG"
            ),
            models.CargoModel(
                id="car-5",
                titulo="Farmacéutico/a Regente",
                departamentoId="dep-6",
                departamentoNombre="Farmacia Central y Dispensación",
                nivelJerarquico="Técnico",
                salarioBase=700.0,
                requisitos="Licenciatura en Farmacia",
                descripcion="Control de stock y dispensación"
            )
        ]
        safe_seed(models.CargoModel, cargos_data)

        # 4. Empleados
        empleados_data = [
            models.EmpleadoModel(
                id="emp-1",
                cedula="V-14285701",
                nombres="Elena Beatriz",
                apellidos="Ramos Salazar",
                genero="Femenino",
                fechaNacimiento="1984-06-14",
                email="elena.ramos@cdisalud.gob",
                telefono="+58 414-2345678",
                direccion="Av. Libertador, Caracas",
                cargoId="car-1",
                cargoTitulo="Director Médico de CDI",
                departamentoId="dep-2",
                departamentoNombre="Medicina General y Consulta Externa",
                fechaIngreso="2020-02-15",
                colegiaturaMedica="MPPS-58492 / CMD-1420"
            ),
            models.EmpleadoModel(
                id="emp-2",
                cedula="V-16982341",
                nombres="Carlos Eduardo",
                apellidos="Mendoza Vivas",
                genero="Masculino",
                fechaNacimiento="1986-11-22",
                email="carlos.mendoza@cdisalud.gob",
                telefono="+58 412-8765432",
                direccion="Urb. Santa Mónica, Caracas",
                cargoId="car-2",
                cargoTitulo="Médico Especialista en Cardiología",
                departamentoId="dep-3",
                departamentoNombre="Cardiología y Electrocardiografía",
                fechaIngreso="2021-04-10",
                colegiaturaMedica="MPPS-67231 / CMD-1904"
            )
        ]
        safe_seed(models.EmpleadoModel, empleados_data)

        # 5. Usuarios
        usuarios_data = [
            models.UsuarioModel(
                id="usr-1",
                nombreUsuario="admin",
                nombreCompleto="Administrador Principal",
                email="admin@cdisalud.gob",
                telefono="+58 414-0000001",
                rolId="rol-1",
                rolNombre="Administrador",
                estado="Activo"
            ),
            models.UsuarioModel(
                id="usr-2",
                nombreUsuario="drelena",
                nombreCompleto="Dra. Elena Ramos",
                email="elena.ramos@cdisalud.gob",
                telefono="+58 414-2345678",
                rolId="rol-2",
                rolNombre="Médico",
                empleadoId="emp-1",
                estado="Activo"
            )
        ]
        safe_seed(models.UsuarioModel, usuarios_data)

        # 6. Pacientes
        pacientes_data = [
            models.PacienteModel(
                id="pac-1",
                cedula="V-9874561",
                nombres="José Gregorio",
                apellidos="Hernández Morillo",
                fechaNacimiento="1966-10-26",
                edad=58,
                genero="Masculino",
                tipoSangre="O+",
                telefono="+58 412-5551234",
                email="jose.hernandez@correo.com",
                direccion="Parroquia Sucre, Sector Pérez Bonalde, Casa 45, Catia, Caracas",
                contactoEmergencia={"nombre": "Carmen Morillo", "telefono": "+58 416-8889900", "parentesco": "Esposa"},
                alergias=["Penicilina", "Sulfamidas"],
                antecedentes=["Hipertensión Arterial (2015)", "Diabetes Mellitus Tipo 2 (2019)"],
                fechaRegistro="2024-01-15",
                estado="Activo"
            ),
            models.PacienteModel(
                id="pac-2",
                cedula="V-14523698",
                nombres="María Alejandra",
                apellidos="Rodríguez Páez",
                fechaNacimiento="1980-04-12",
                edad=44,
                genero="Femenino",
                tipoSangre="A+",
                telefono="+58 414-7774433",
                email="maria.rodriguez@correo.com",
                direccion="Av. San Martín, Edif. Los Andes, Apto 4-B, Caracas",
                contactoEmergencia={"nombre": "Luis Rodríguez", "telefono": "+58 424-3332211", "parentesco": "Hermano"},
                alergias=["Aspirina / AINEs"],
                antecedentes=["Asma Bronquial"],
                fechaRegistro="2024-02-20",
                estado="Activo"
            )
        ]
        safe_seed(models.PacienteModel, pacientes_data)

        # 7. Proveedores
        proveedores_data = [
            models.ProveedorModel(
                id="prov-1",
                rif="J-00031456-0",
                razonSocial="Laboratorios Venezolanos S.A. (LABOVEN)",
                nombreComercial="LABOVEN Farmacéutica",
                contactoPrincipal="Lic. Ricardo Morales",
                telefono="+58 212-2003300",
                email="ventas@laboven.com.ve",
                direccion="Zona Industrial La Yaguara, Calle 3, Galpón 12, Caracas",
                ciudad="Caracas",
                categoria="Medicamentos",
                plazoPagoDias=45,
                calificacion=5,
                estado="Activo"
            )
        ]
        safe_seed(models.ProveedorModel, proveedores_data)

        # 8. Medicamentos
        medicamentos_data = [
            models.MedicamentoModel(
                id="med-1",
                codigo="MED-HTA-001",
                nombreComercial="Losartán Potásico 50mg",
                principioActivo="Losartán Potásico",
                concentracion="50 mg",
                presentacion="Tabletas",
                viaAdministracion="Oral",
                categoriaTerapeutica="Cardiovascular / Antihipertensivo",
                stockActual=420,
                stockMinimo=100,
                stockMaximo=1000,
                ubicacionEstante="Estante A-01, Nivel 2",
                requiereReceta=True,
                temperaturaAlmacenamiento="Ambiente (15-25°C)",
                estado="Disponible"
            ),
            models.MedicamentoModel(
                id="med-2",
                codigo="MED-DBT-002",
                nombreComercial="Metformina Clorhidrato 850mg",
                principioActivo="Metformina Clorhidrato",
                concentracion="850 mg",
                presentacion="Tabletas Recubiertas",
                viaAdministracion="Oral",
                categoriaTerapeutica="Endocrino / Antidiabético",
                stockActual=310,
                stockMinimo=80,
                stockMaximo=800,
                ubicacionEstante="Estante A-02, Nivel 1",
                requiereReceta=True,
                temperaturaAlmacenamiento="Ambiente (15-25°C)",
                estado="Disponible"
            )
        ]
        safe_seed(models.MedicamentoModel, medicamentos_data)

        # 9. Movimientos Farmacia
        movimientos_data = [
            models.MovimientoFarmaciaModel(
                id="mov-1",
                numeroTransaccion="TRX-2025-0012",
                tipoMovimiento="Salida por Consulta",
                medicamentoId="med-1",
                medicamentoNombre="Losartán Potásico 50mg",
                cantidad=60,
                lote="LOT-LOS-2024-08",
                fechaVencimiento="2026-08-30",
                pacienteId="pac-1",
                pacienteNombre="José Gregorio Hernández Morillo",
                tratamientoId="tra-1",
                responsableEmpleadoId="emp-1",
                responsableNombre="Farm. Luisana Soto",
                fechaHora="2025-02-15 10:45",
                motivo="Dispensación gratuita por programa de crónicos",
                observaciones="Se orienta al paciente sobre la toma matutina"
            )
        ]
        safe_seed(models.MovimientoFarmaciaModel, movimientos_data)

        # 10. Citas
        citas_data = [
            models.CitaModel(
                id="cit-1",
                codigoCita="CIT-2025-0101",
                pacienteId="pac-1",
                pacienteNombre="José Gregorio Hernández Morillo",
                pacienteCedula="V-9874561",
                medicoId="emp-2",
                medicoNombre="Dr. Carlos Mendoza",
                departamentoId="dep-3",
                departamentoNombre="Cardiología y Electrocardiografía",
                fecha="2025-02-15",
                hora="08:30",
                motivoConsulta="Control semestral de tensión arterial y ajuste de dosis",
                triajePrioridad="Consulta Regular",
                signosVitales={"ta": "135/85", "fc": 74, "fr": 18, "temp": 36.6, "saturacion": 98, "peso": 78.5, "talla": 1.72},
                estado="Completada",
                diagnosticoPreliminar="Hipertensión Arterial Grado 1 controlada",
                notas="Paciente refiere buena tolerancia a la medicación sin efectos secundarios."
            )
        ]
        safe_seed(models.CitaModel, citas_data)

        # 11. Tratamientos
        tratamientos_data = [
            models.TratamientoModel(
                id="tra-1",
                codigoTratamiento="TRAT-2025-0045",
                citaId="cit-1",
                pacienteId="pac-1",
                pacienteNombre="José Gregorio Hernández Morillo",
                pacienteCedula="V-9874561",
                medicoId="emp-2",
                medicoNombre="Dr. Carlos Mendoza",
                diagnosticoCIE="I10 - Hipertensión esencial",
                diagnosticoDescripcion="Tratamiento de mantenimiento tensional",
                prescripciones=[
                    {
                        "medicamentoId": "med-1",
                        "medicamentoNombre": "Losartán Potásico 50mg",
                        "dosis": "50 mg (1 tableta)",
                        "frecuencia": "Cada 12 horas",
                        "duracionDias": 60,
                        "cantidadTotal": 120
                    }
                ],
                indicacionesGenerales="Reducir consumo de sodio y caminata 30 min diarios",
                fechaInicio="2025-02-15",
                fechaFin="2025-04-15",
                estado="Activo"
            )
        ]
        safe_seed(models.TratamientoModel, tratamientos_data)

        # 12. Horarios
        horarios_data = [
            models.HorarioModel(
                id="hor-1",
                nombreTurno="Mañana - Cardiología",
                empleadoId="emp-2",
                empleadoNombre="Dr. Carlos Mendoza",
                departamentoId="dep-3",
                departamentoNombre="Cardiología y Electrocardiografía",
                tipoTurno="Matutino",
                horaInicio="07:00",
                horaFin="13:00",
                diasSemana=["Lunes", "Miércoles", "Viernes"],
                estado="Activo"
            )
        ]
        safe_seed(models.HorarioModel, horarios_data)


        # 13. Órdenes de Laboratorio (LIS)
        labs_data = [
            models.OrdenLaboratorioModel(
                id="lab-1",
                codigoOrden="LAB-2025-001",
                pacienteId="pac-1",
                pacienteNombre="José Gregorio Hernández",
                pacienteCedula="V-9874561",
                pacienteEdad=58,
                pacienteGenero="Masculino",
                medicoId="emp-2",
                medicoNombre="Dr. Carlos Mendoza",
                fechaOrden="2025-02-15",
                fechaResultado="2025-02-15",
                prioridad="Rutina",
                perfil="Hematología Completa",
                muestra="Sangre Total con EDTA",
                resultados=[
                    {"parametro": "Leucocitos Totales", "valor": 7.4, "unidad": "10^3/uL", "rangoReferencia": "4.5 - 11.0", "estado": "Normal"},
                    {"parametro": "Hemoglobina", "valor": 14.8, "unidad": "g/dL", "rangoReferencia": "13.5 - 17.5", "estado": "Normal"},
                    {"parametro": "Hematocrito", "valor": 44.2, "unidad": "%", "rangoReferencia": "41.0 - 50.0", "estado": "Normal"},
                    {"parametro": "Plaquetas", "valor": 245.0, "unidad": "10^3/uL", "rangoReferencia": "150 - 450", "estado": "Normal"}
                ],
                bioanalistaResponsable="Lic. Coromoto Sánchez",
                observacionesClinicas="Fórmula leucocitaria dentro de parámetros fisiológicos normales.",
                codigoValidacionQR="https://cdi-salud.gob.ve/val/LAB-2025-001",
                estado="Validado"
            )
        ]
        safe_seed(models.OrdenLaboratorioModel, labs_data)

        # 14. Estudios de Imagenología (RIS/PACS)
        imagenes_data = [
            models.EstudioImagenModel(
                id="rad-1",
                codigoEstudio="RX-2025-001",
                pacienteId="pac-1",
                pacienteNombre="José Gregorio Hernández",
                pacienteCedula="V-9874561",
                medicoSolicitanteId="emp-2",
                medicoSolicitanteNombre="Dr. Carlos Mendoza",
                modalidad="Rayos X",
                regionAnatomica="Tórax PA",
                fechaSolicitud="2025-02-15",
                fechaRealizacion="2025-02-15",
                radiologoResponsable="Dra. Valentina Briceño",
                motivoEstudio="Control cardiovascular",
                hallazgos="Campos pulmonares libres de infiltrados o consolidaciones. Silueta cardíaca con leve elongación aórtica sin cardiomegalia franca.",
                impresionDiagnostica="Radiografía de tórax dentro de límites normales para la edad.",
                clasificacionEspecial="Estándar",
                imagenesUrls=["/images/radiografia_torax_demo.svg"],
                prioridad="Programada",
                estado="Informado"
            )
        ]
        safe_seed(models.EstudioImagenModel, imagenes_data)

        # 15. Camas Hospitalarias
        camas_data = [
            models.CamaHospitalariaModel(
                id="cam-1",
                codigoCama="OBS-01",
                salaNombre="Observación Adultos",
                tipoCama="Observación",
                estado="Disponible"
            ),
            models.CamaHospitalariaModel(
                id="cam-2",
                codigoCama="OBS-02",
                salaNombre="Observación Adultos",
                tipoCama="Observación",
                estado="Ocupada",
                pacienteActualId="pac-2",
                pacienteActualNombre="María Alejandra Rodríguez",
                pacienteCedula="V-14523698",
                fechaIngreso="2025-02-15 08:30",
                medicoTratante="Dr. Roberto Gómez",
                diagnosticoActual="Crisis asmática moderada"
            ),
            models.CamaHospitalariaModel(
                id="cam-3",
                codigoCama="UCI-01",
                salaNombre="Cuidados Intensivos",
                tipoCama="UCI",
                estado="Disponible"
            )
        ]
        safe_seed(models.CamaHospitalariaModel, camas_data)

        # 16. Admisiones Hospitalarias
        admisiones_data = [
            models.AdmisionHospitalariaModel(
                id="adm-1",
                codigoAdmision="HOSP-2025-001",
                pacienteId="pac-2",
                pacienteNombre="María Alejandra Rodríguez",
                pacienteCedula="V-14523698",
                camaId="cam-2",
                camaCodigo="OBS-02",
                salaNombre="Observación Adultos",
                fechaIngreso="2025-02-15 08:30",
                diagnosticoIngreso="Crisis asmática moderada en resolución",
                medicoTratanteId="emp-1",
                medicoTratanteNombre="Dr. Roberto Gómez",
                notasEvolucionSOAP=[
                    {
                        "fechaHora": "2025-02-15 14:00",
                        "medicoNombre": "Dr. Roberto Gómez",
                        "subjetivo": "Paciente refiere franca mejoría disneica.",
                        "objetivo": "SpO2: 98% con aire ambiente, FC: 78 lpm, Murmullo vesicular conservado.",
                        "analisis": "Buena respuesta a broncodilatadores y corticoides.",
                        "plan": "Mantener observación 6 horas más y considerar egreso."
                    }
                ],
                ordenesEnfermeria=[
                    {
                        "id": "ord-1",
                        "medicamento": "Hidrocortisona 100mg IV",
                        "dosis": "100 mg",
                        "frecuencia": "Cada 8 horas",
                        "proximaDosis": "2025-02-15 16:00",
                        "estado": "Administrado"
                    }
                ],
                estado="Ingresado"
            )
        ]
        safe_seed(models.AdmisionHospitalariaModel, admisiones_data)

        # 17. Registros de Triaje (NEWS2)
        triaje_data = [
            models.RegistroTriajeModel(
                id="tri-1",
                codigoTriaje="TRI-2025-001",
                pacienteId="pac-1",
                pacienteNombre="José Gregorio Hernández",
                pacienteCedula="V-9874561",
                fechaHora="2025-02-15 09:15",
                enfermeroTriaje="Lic. Carmen Salazar",
                nivelTriaje="Nivel 4 - Menor Urgencia (Verde)",
                signosVitales={"ta": "130/80", "fc": 72, "fr": 16, "spo2": 98, "temp": 36.6, "escalaDolor": 1},
                scoreNEWS2=0,
                nivelRiesgoNEWS2="Bajo (0-4)",
                motivoUrgencia="Control de presión arterial de rutina",
                destinoRecomendado="Consulta Externa / Medicina General",
                tiempoEsperaMinutos=45,
                estado="Atendido y Egresado"
            )
        ]
        safe_seed(models.RegistroTriajeModel, triaje_data)

        # 18. Odontogramas
        odontologia_data = [
            models.OdontogramaModel(
                id="odo-1",
                pacienteId="pac-1",
                pacienteNombre="José Gregorio Hernández",
                pacienteCedula="V-9874561",
                odontologoId="emp-1",
                odontologoNombre="Dra. Patricia Silva",
                fechaEvaluacion="2025-02-14",
                dientes={
                    "16": {"estado": "caries", "superficies": ["Oclusal"], "notas": "Caries de esmalte y dentina"},
                    "26": {"estado": "resina", "superficies": ["Oclusal"], "notas": "Restauración previa íntegra"}
                },
                indiceHigieneOral="Bueno",
                diagnosticoPeriodontal="Gingivitis marginal inducida por placa",
                planTratamiento=[
                    {"tratamiento": "Profilaxis y Tartrectomía Ultrasonido", "pieza": "General", "costoUSD": 0, "estado": "Completado"},
                    {"tratamiento": "Restauración con Resina Fotocurada", "pieza": "16", "costoUSD": 0, "estado": "Planificado"}
                ],
                estado="Activo"
            )
        ]
        safe_seed(models.OdontogramaModel, odontologia_data)

        # 19. Teleconsultas e Interconsultas
        teleconsultas_data = [
            models.TeleconsultaModel(
                id="tel-1",
                codigoConsulta="TEL-2025-001",
                pacienteId="pac-1",
                pacienteNombre="José Gregorio Hernández",
                pacienteCedula="V-9874561",
                medicoId="emp-2",
                medicoNombre="Dr. Carlos Mendoza",
                especialidad="Cardiología",
                fechaProgramada="2025-02-20",
                horaProgramada="10:00",
                enlaceSalaVirtual="https://cdi-salud.gob.ve/telemedicina/SALA-CARDIO-882",
                motivo="Seguimiento de tratamiento antihipertensivo y ajuste de dosis",
                estadoLlamada="Programada",
                chatMensajes=[]
            )
        ]
        safe_seed(models.TeleconsultaModel, teleconsultas_data)

        interconsultas_data = [
            models.InterconsultaModel(
                id="itc-1",
                codigoInterconsulta="ITC-2025-001",
                pacienteId="pac-2",
                pacienteNombre="María Alejandra Rodríguez",
                pacienteCedula="V-14523698",
                medicoSolicitanteId="emp-1",
                medicoSolicitanteNombre="Dr. Roberto Gómez",
                departamentoOrigen="Emergencia y Triaje",
                especialidadDestino="Neumonología",
                medicoConsultadoNombre="Dra. Laura Morales",
                prioridad="Alta",
                motivoConsulta="Evaluación por crisis asmáticas recurrentes",
                fechaSolicitud="2025-02-15",
                estado="Solicitada"
            )
        ]
        safe_seed(models.InterconsultaModel, interconsultas_data)

        # 20. Baremos y Tarifas
        tarifas_data = [
            models.ServicioTarifaModel(
                id="tar-1",
                codigo="MED-001",
                nombre="Consulta Médica General",
                categoria="Consultas",
                descripcion="Atención médica general preventiva y curativa",
                precioBaseUSD=0.0,
                exoneradoCDI=True,
                estado="Activo"
            ),
            models.ServicioTarifaModel(
                id="tar-2",
                codigo="LAB-001",
                nombre="Perfil 20 / Rutina Completa",
                categoria="Laboratorio",
                descripcion="Hematología, Química Sanguínea, Examen de Orina",
                precioBaseUSD=0.0,
                exoneradoCDI=True,
                estado="Activo"
            ),
            models.ServicioTarifaModel(
                id="tar-3",
                codigo="IMG-001",
                nombre="Radiografía de Tórax Digital",
                categoria="Imagenología",
                descripcion="Estudio radiográfico con informe digital",
                precioBaseUSD=0.0,
                exoneradoCDI=True,
                estado="Activo"
            )
        ]
        safe_seed(models.ServicioTarifaModel, tarifas_data)

        # 21. Facturación Hospitalaria
        facturas_data = [
            models.FacturaModel(
                id="fac-1",
                codigoFactura="FAC-2025-0001",
                pacienteId="pac-1",
                pacienteNombre="José Gregorio Hernández",
                pacienteCedula="V-9874561",
                fechaEmision="2025-02-15",
                items=[
                    {"servicioId": "tar-1", "concepto": "Consulta Médica General", "cantidad": 1, "precioUnitarioUSD": 0, "totalUSD": 0}
                ],
                totalUSD=0.0,
                totalBs=0.0,
                tasaCambioBs=39.5,
                modalidadPago="100% Gratuito CDI (Exonerado)",
                coberturaSeguroPorcentaje=100,
                estadoPago="Exonerado / Gratuito",
                notas="Atención integral gratuita garantizada por el Sistema Público Nacional de Salud."
            )
        ]
        safe_seed(models.FacturaModel, facturas_data)

        # 22. Auditoría HIPAA
        auditoria_data = [
            models.RegistroAuditoriaModel(
                id="aud-1",
                fechaHora="2025-02-15 08:00:00",
                usuarioId="usr-1",
                usuarioNombre="Admin General",
                rol="Administrador",
                accion="INICIO_SESION",
                modulo="Seguridad",
                detalles="Acceso exitoso al sistema hospitalario CDI.",
                ipAddress="192.168.1.100",
                severidad="INFO"
            )
        ]
        safe_seed(models.RegistroAuditoriaModel, auditoria_data)

        # 23. Casos Epidemiológicos (EPI-12)
        casos_data = [
            models.CasoEpidemiologicoModel(
                id="epi-1",
                codigoCaso="EPI-2025-014",
                pacienteId="pac-1",
                pacienteNombre="José Gregorio Hernández",
                pacienteCedula="V-9874561",
                pacienteEdad=58,
                enfermedad="Dengue Clásico",
                semanaEpidemiologica=7,
                ano=2025,
                fechaNotificacion="2025-02-14",
                canalEndemicoZona="Zona de Seguridad",
                sectorComunidad="Sector 23 de Enero - Bloque 12",
                estadoCaso="Confirmado",
                notificadoMPPS=True,
                medidasTomadas="Abatización comunitaria y charla preventiva sobre eliminación de criaderos."
            )
        ]
        safe_seed(models.CasoEpidemiologicoModel, casos_data)


        db.commit()
        print("Base de datos SQLite inicializada y poblada con todos los 24 módulos clínicos exitosamente!")
    except Exception as e:
        db.rollback()
        print(f"Error al poblar base de datos: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

