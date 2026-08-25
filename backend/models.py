from sqlalchemy import Column, String, Integer, Float, Boolean, Text, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class RoleModel(Base):
    __tablename__ = "roles"

    id = Column(String, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True, nullable=False)
    descripcion = Column(String, nullable=True)
    permisos = Column(JSON, nullable=False, default=dict)
    estado = Column(String, default="Activo")
    fechaCreacion = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))

    usuarios = relationship("UsuarioModel", back_populates="rol")


class UsuarioModel(Base):
    __tablename__ = "usuarios"

    id = Column(String, primary_key=True, index=True)
    nombreUsuario = Column(String, unique=True, index=True, nullable=False)
    nombreCompleto = Column(String, nullable=False)
    email = Column(String, nullable=True)
    telefono = Column(String, nullable=True)
    rolId = Column(String, ForeignKey("roles.id"), nullable=False)
    rolNombre = Column(String, nullable=True)
    empleadoId = Column(String, nullable=True)
    estado = Column(String, default="Activo")
    ultimoAcceso = Column(String, nullable=True)
    fechaCreacion = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))

    rol = relationship("RoleModel", back_populates="usuarios")


class DepartamentoModel(Base):
    __tablename__ = "departamentos"

    id = Column(String, primary_key=True, index=True)
    codigo = Column(String, unique=True, index=True, nullable=False)
    nombre = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    piso = Column(String, nullable=True)
    responsable = Column(String, nullable=True)
    capacidadCamas = Column(Integer, default=0)
    consultorios = Column(Integer, default=1)
    telefonoInterno = Column(String, nullable=True)
    estado = Column(String, default="Activo")


class CargoModel(Base):
    __tablename__ = "cargos"

    id = Column(String, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    departamentoId = Column(String, nullable=True)
    departamentoNombre = Column(String, nullable=True)
    nivelJerarquico = Column(String, default="Asistencial")
    salarioBase = Column(Float, default=0.0)
    requisitos = Column(Text, nullable=True)
    descripcion = Column(Text, nullable=True)
    estado = Column(String, default="Activo")


class EmpleadoModel(Base):
    __tablename__ = "empleados"

    id = Column(String, primary_key=True, index=True)
    cedula = Column(String, unique=True, index=True, nullable=False)
    nombres = Column(String, nullable=False)
    apellidos = Column(String, nullable=False)
    genero = Column(String, default="Femenino")
    fechaNacimiento = Column(String, nullable=True)
    email = Column(String, nullable=True)
    telefono = Column(String, nullable=True)
    direccion = Column(Text, nullable=True)
    cargoId = Column(String, nullable=True)
    cargoTitulo = Column(String, nullable=True)
    departamentoId = Column(String, nullable=True)
    departamentoNombre = Column(String, nullable=True)
    fechaIngreso = Column(String, nullable=True)
    colegiaturaMedica = Column(String, nullable=True)
    estado = Column(String, default="Activo")


class HorarioModel(Base):
    __tablename__ = "horarios"

    id = Column(String, primary_key=True, index=True)
    nombreTurno = Column(String, nullable=False)
    empleadoId = Column(String, nullable=False)
    empleadoNombre = Column(String, nullable=True)
    departamentoId = Column(String, nullable=True)
    departamentoNombre = Column(String, nullable=True)
    tipoTurno = Column(String, default="Matutino")
    horaInicio = Column(String, default="07:00")
    horaFin = Column(String, default="13:00")
    diasSemana = Column(JSON, default=list)
    estado = Column(String, default="Activo")
    observaciones = Column(Text, nullable=True)


class PacienteModel(Base):
    __tablename__ = "pacientes"

    id = Column(String, primary_key=True, index=True)
    cedula = Column(String, unique=True, index=True, nullable=False)
    nombres = Column(String, nullable=False)
    apellidos = Column(String, nullable=False)
    fechaNacimiento = Column(String, nullable=True)
    edad = Column(Integer, default=0)
    genero = Column(String, default="Masculino")
    tipoSangre = Column(String, default="O+")
    telefono = Column(String, nullable=True)
    email = Column(String, nullable=True)
    direccion = Column(Text, nullable=True)
    contactoEmergencia = Column(JSON, default=dict)
    alergias = Column(JSON, default=list)
    antecedentes = Column(JSON, default=list)
    fechaRegistro = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    estado = Column(String, default="Activo")


class ProveedorModel(Base):
    __tablename__ = "proveedores"

    id = Column(String, primary_key=True, index=True)
    rif = Column(String, unique=True, index=True, nullable=False)
    razonSocial = Column(String, nullable=False)
    nombreComercial = Column(String, nullable=False)
    contactoPrincipal = Column(String, nullable=True)
    telefono = Column(String, nullable=True)
    email = Column(String, nullable=True)
    direccion = Column(Text, nullable=True)
    ciudad = Column(String, default="Caracas")
    categoria = Column(String, default="Medicamentos")
    plazoPagoDias = Column(Integer, default=30)
    calificacion = Column(Integer, default=5)
    estado = Column(String, default="Activo")


class MedicamentoModel(Base):
    __tablename__ = "medicamentos"

    id = Column(String, primary_key=True, index=True)
    codigo = Column(String, unique=True, index=True, nullable=False)
    nombreComercial = Column(String, nullable=False)
    principioActivo = Column(String, nullable=False)
    concentracion = Column(String, nullable=True)
    presentacion = Column(String, default="Tabletas")
    viaAdministracion = Column(String, default="Oral")
    categoriaTerapeutica = Column(String, nullable=True)
    stockActual = Column(Integer, default=0)
    stockMinimo = Column(Integer, default=10)
    stockMaximo = Column(Integer, default=500)
    ubicacionEstante = Column(String, nullable=True)
    requiereReceta = Column(Boolean, default=True)
    temperaturaAlmacenamiento = Column(String, default="Ambiente (15-25°C)")
    estado = Column(String, default="Disponible")


class MovimientoFarmaciaModel(Base):
    __tablename__ = "movimientos_farmacia"

    id = Column(String, primary_key=True, index=True)
    numeroTransaccion = Column(String, unique=True, index=True, nullable=False)
    tipoMovimiento = Column(String, nullable=False)
    medicamentoId = Column(String, ForeignKey("medicamentos.id"), nullable=False)
    medicamentoNombre = Column(String, nullable=True)
    cantidad = Column(Integer, nullable=False)
    lote = Column(String, nullable=False)
    fechaVencimiento = Column(String, nullable=False)
    proveedorId = Column(String, nullable=True)
    proveedorNombre = Column(String, nullable=True)
    pacienteId = Column(String, nullable=True)
    pacienteNombre = Column(String, nullable=True)
    tratamientoId = Column(String, nullable=True)
    responsableEmpleadoId = Column(String, nullable=False)
    responsableNombre = Column(String, nullable=True)
    fechaHora = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d %H:%M"))
    motivo = Column(String, nullable=False)
    observaciones = Column(Text, nullable=True)


class CitaModel(Base):
    __tablename__ = "citas"

    id = Column(String, primary_key=True, index=True)
    codigoCita = Column(String, unique=True, index=True, nullable=False)
    pacienteId = Column(String, ForeignKey("pacientes.id"), nullable=False)
    pacienteNombre = Column(String, nullable=True)
    pacienteCedula = Column(String, nullable=True)
    medicoId = Column(String, ForeignKey("empleados.id"), nullable=False)
    medicoNombre = Column(String, nullable=True)
    departamentoId = Column(String, nullable=True)
    departamentoNombre = Column(String, nullable=True)
    fecha = Column(String, nullable=False)
    hora = Column(String, nullable=False)
    motivoConsulta = Column(String, nullable=False)
    triajePrioridad = Column(String, default="Consulta Regular")
    signosVitales = Column(JSON, default=dict)
    estado = Column(String, default="Pendiente")
    diagnosticoPreliminar = Column(String, nullable=True)
    notas = Column(Text, nullable=True)


class TratamientoModel(Base):
    __tablename__ = "tratamientos"

    id = Column(String, primary_key=True, index=True)
    codigoTratamiento = Column(String, unique=True, index=True, nullable=False)
    citaId = Column(String, nullable=True)
    pacienteId = Column(String, ForeignKey("pacientes.id"), nullable=False)
    pacienteNombre = Column(String, nullable=True)
    pacienteCedula = Column(String, nullable=True)
    medicoId = Column(String, ForeignKey("empleados.id"), nullable=False)
    medicoNombre = Column(String, nullable=True)
    diagnosticoCIE = Column(String, nullable=False)
    diagnosticoDescripcion = Column(Text, nullable=True)
    prescripciones = Column(JSON, default=list)
    indicacionesGenerales = Column(Text, nullable=True)
    fechaInicio = Column(String, nullable=False)
    fechaFin = Column(String, nullable=False)
    proximoControl = Column(String, nullable=True)
    estado = Column(String, default="Activo")


# ==========================================
# NUEVOS MODELOS CLÍNICOS ENTERPRISE
# ==========================================

class OrdenLaboratorioModel(Base):
    __tablename__ = "ordenes_laboratorio"

    id = Column(String, primary_key=True, index=True)
    codigoOrden = Column(String, unique=True, index=True, nullable=False)
    pacienteId = Column(String, ForeignKey("pacientes.id"), nullable=False)
    pacienteNombre = Column(String, nullable=True)
    pacienteCedula = Column(String, nullable=True)
    pacienteEdad = Column(Integer, default=0)
    pacienteGenero = Column(String, default="Otro")
    medicoId = Column(String, nullable=True)
    medicoNombre = Column(String, nullable=True)
    fechaOrden = Column(String, nullable=False)
    fechaResultado = Column(String, nullable=True)
    prioridad = Column(String, default="Rutina")
    perfil = Column(String, default="Hematología Completa")
    muestra = Column(String, default="Sangre Total")
    resultados = Column(JSON, default=list)
    bioanalistaResponsable = Column(String, nullable=True)
    observacionesClinicas = Column(Text, nullable=True)
    codigoValidacionQR = Column(String, nullable=True)
    estado = Column(String, default="Solicitado")


class EstudioImagenModel(Base):
    __tablename__ = "estudios_imagen"

    id = Column(String, primary_key=True, index=True)
    codigoEstudio = Column(String, unique=True, index=True, nullable=False)
    pacienteId = Column(String, ForeignKey("pacientes.id"), nullable=False)
    pacienteNombre = Column(String, nullable=True)
    pacienteCedula = Column(String, nullable=True)
    medicoSolicitanteId = Column(String, nullable=True)
    medicoSolicitanteNombre = Column(String, nullable=True)
    modalidad = Column(String, default="Rayos X")
    regionAnatomica = Column(String, nullable=False)
    fechaSolicitud = Column(String, nullable=False)
    fechaRealizacion = Column(String, nullable=True)
    radiologoResponsable = Column(String, nullable=True)
    motivoEstudio = Column(Text, nullable=True)
    hallazgos = Column(Text, nullable=True)
    impresionDiagnostica = Column(Text, nullable=True)
    clasificacionEspecial = Column(String, nullable=True)
    imagenesUrls = Column(JSON, default=list)
    prioridad = Column(String, default="Programada")
    estado = Column(String, default="Pendiente")


class CamaHospitalariaModel(Base):
    __tablename__ = "camas_hospitalarias"

    id = Column(String, primary_key=True, index=True)
    codigoCama = Column(String, unique=True, index=True, nullable=False)
    salaNombre = Column(String, nullable=False)
    tipoCama = Column(String, default="Observación")
    estado = Column(String, default="Disponible")
    pacienteActualId = Column(String, nullable=True)
    pacienteActualNombre = Column(String, nullable=True)
    pacienteCedula = Column(String, nullable=True)
    fechaIngreso = Column(String, nullable=True)
    medicoTratante = Column(String, nullable=True)
    diagnosticoActual = Column(String, nullable=True)


class AdmisionHospitalariaModel(Base):
    __tablename__ = "admisiones_hospitalarias"

    id = Column(String, primary_key=True, index=True)
    codigoAdmision = Column(String, unique=True, index=True, nullable=False)
    pacienteId = Column(String, ForeignKey("pacientes.id"), nullable=False)
    pacienteNombre = Column(String, nullable=True)
    pacienteCedula = Column(String, nullable=True)
    camaId = Column(String, ForeignKey("camas_hospitalarias.id"), nullable=False)
    camaCodigo = Column(String, nullable=True)
    salaNombre = Column(String, nullable=True)
    fechaIngreso = Column(String, nullable=False)
    fechaAltaPrevista = Column(String, nullable=True)
    fechaAltaReal = Column(String, nullable=True)
    diagnosticoIngreso = Column(Text, nullable=False)
    diagnosticoEgreso = Column(Text, nullable=True)
    medicoTratanteId = Column(String, nullable=True)
    medicoTratanteNombre = Column(String, nullable=True)
    notasEvolucionSOAP = Column(JSON, default=list)
    ordenesEnfermeria = Column(JSON, default=list)
    estado = Column(String, default="Ingresado")


class RegistroTriajeModel(Base):
    __tablename__ = "registros_triaje"

    id = Column(String, primary_key=True, index=True)
    codigoTriaje = Column(String, unique=True, index=True, nullable=False)
    pacienteId = Column(String, ForeignKey("pacientes.id"), nullable=False)
    pacienteNombre = Column(String, nullable=True)
    pacienteCedula = Column(String, nullable=True)
    fechaHora = Column(String, nullable=False)
    enfermeroTriaje = Column(String, nullable=False)
    nivelTriaje = Column(String, default="Nivel 3 - Urgencia (Amarillo)")
    signosVitales = Column(JSON, default=dict)
    scoreNEWS2 = Column(Integer, default=0)
    nivelRiesgoNEWS2 = Column(String, default="Bajo (0-4)")
    motivoUrgencia = Column(Text, nullable=False)
    destinoRecomendado = Column(String, default="Consulta de Urgencias")
    tiempoEsperaMinutos = Column(Integer, default=10)
    estado = Column(String, default="En Espera")


class OdontogramaModel(Base):
    __tablename__ = "odontogramas"

    id = Column(String, primary_key=True, index=True)
    pacienteId = Column(String, ForeignKey("pacientes.id"), nullable=False)
    pacienteNombre = Column(String, nullable=True)
    pacienteCedula = Column(String, nullable=True)
    odontologoId = Column(String, nullable=True)
    odontologoNombre = Column(String, nullable=True)
    fechaEvaluacion = Column(String, nullable=False)
    dientes = Column(JSON, default=dict)
    indiceHigieneOral = Column(String, default="Bueno")
    diagnosticoPeriodontal = Column(Text, nullable=True)
    planTratamiento = Column(JSON, default=list)
    estado = Column(String, default="Activo")


class TeleconsultaModel(Base):
    __tablename__ = "teleconsultas"

    id = Column(String, primary_key=True, index=True)
    codigoConsulta = Column(String, unique=True, index=True, nullable=False)
    pacienteId = Column(String, ForeignKey("pacientes.id"), nullable=False)
    pacienteNombre = Column(String, nullable=True)
    pacienteCedula = Column(String, nullable=True)
    medicoId = Column(String, nullable=False)
    medicoNombre = Column(String, nullable=True)
    especialidad = Column(String, default="Medicina General")
    fechaProgramada = Column(String, nullable=False)
    horaProgramada = Column(String, nullable=False)
    enlaceSalaVirtual = Column(String, nullable=False)
    motivo = Column(Text, nullable=False)
    estadoLlamada = Column(String, default="Programada")
    resumenClinico = Column(Text, nullable=True)
    chatMensajes = Column(JSON, default=list)


class InterconsultaModel(Base):
    __tablename__ = "interconsultas"

    id = Column(String, primary_key=True, index=True)
    codigoInterconsulta = Column(String, unique=True, index=True, nullable=False)
    pacienteId = Column(String, ForeignKey("pacientes.id"), nullable=False)
    pacienteNombre = Column(String, nullable=True)
    pacienteCedula = Column(String, nullable=True)
    medicoSolicitanteId = Column(String, nullable=False)
    medicoSolicitanteNombre = Column(String, nullable=True)
    departamentoOrigen = Column(String, nullable=False)
    especialidadDestino = Column(String, nullable=False)
    medicoConsultadoId = Column(String, nullable=True)
    medicoConsultadoNombre = Column(String, nullable=True)
    prioridad = Column(String, default="Alta")
    motivoConsulta = Column(Text, nullable=False)
    antecedentesRelevantes = Column(Text, nullable=True)
    fechaSolicitud = Column(String, nullable=False)
    fechaRespuesta = Column(String, nullable=True)
    respuestaEspecialista = Column(Text, nullable=True)
    estado = Column(String, default="Solicitada")


class ServicioTarifaModel(Base):
    __tablename__ = "servicios_tarifas"

    id = Column(String, primary_key=True, index=True)
    codigo = Column(String, unique=True, index=True, nullable=False)
    nombre = Column(String, nullable=False)
    categoria = Column(String, default="Consultas")
    descripcion = Column(Text, nullable=True)
    precioBaseUSD = Column(Float, default=0.0)
    exoneradoCDI = Column(Boolean, default=True)
    estado = Column(String, default="Activo")


class FacturaModel(Base):
    __tablename__ = "facturas"

    id = Column(String, primary_key=True, index=True)
    codigoFactura = Column(String, unique=True, index=True, nullable=False)
    pacienteId = Column(String, ForeignKey("pacientes.id"), nullable=False)
    pacienteNombre = Column(String, nullable=True)
    pacienteCedula = Column(String, nullable=True)
    fechaEmision = Column(String, nullable=False)
    items = Column(JSON, default=list)
    totalUSD = Column(Float, default=0.0)
    totalBs = Column(Float, default=0.0)
    tasaCambioBs = Column(Float, default=39.5)
    modalidadPago = Column(String, default="100% Gratuito CDI (Exonerado)")
    coberturaSeguroPorcentaje = Column(Integer, default=0)
    nombreAseguradora = Column(String, nullable=True)
    estadoPago = Column(String, default="Exonerado / Gratuito")
    notas = Column(Text, nullable=True)


class RegistroAuditoriaModel(Base):
    __tablename__ = "registros_auditoria"

    id = Column(String, primary_key=True, index=True)
    fechaHora = Column(String, nullable=False)
    usuarioId = Column(String, nullable=False)
    usuarioNombre = Column(String, nullable=False)
    rol = Column(String, nullable=False)
    accion = Column(String, nullable=False)
    modulo = Column(String, nullable=False)
    registroId = Column(String, nullable=True)
    detalles = Column(Text, nullable=False)
    ipAddress = Column(String, default="127.0.0.1")
    userAgent = Column(String, nullable=True)
    severidad = Column(String, default="INFO")


class CasoEpidemiologicoModel(Base):
    __tablename__ = "casos_epidemiologicos"

    id = Column(String, primary_key=True, index=True)
    codigoCaso = Column(String, unique=True, index=True, nullable=False)
    pacienteId = Column(String, ForeignKey("pacientes.id"), nullable=False)
    pacienteNombre = Column(String, nullable=True)
    pacienteCedula = Column(String, nullable=True)
    pacienteEdad = Column(Integer, default=0)
    enfermedad = Column(String, nullable=False)
    semanaEpidemiologica = Column(Integer, default=33)
    ano = Column(Integer, default=2025)
    fechaNotificacion = Column(String, nullable=False)
    canalEndemicoZona = Column(String, default="Zona de Seguridad")
    sectorComunidad = Column(String, nullable=False)
    estadoCaso = Column(String, default="En Investigación")
    notificadoMPPS = Column(Boolean, default=True)
    medidasTomadas = Column(Text, nullable=True)

