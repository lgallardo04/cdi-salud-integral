from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RoleSchema(BaseModel):
    id: Optional[str] = None
    nombre: str
    descripcion: Optional[str] = None
    permisos: Dict[str, Any] = Field(default_factory=dict)
    estado: str = "Activo"
    fechaCreacion: Optional[str] = None

    class Config:
        from_attributes = True

class UsuarioSchema(BaseModel):
    id: Optional[str] = None
    nombreUsuario: str
    nombreCompleto: str
    email: Optional[str] = None
    telefono: Optional[str] = None
    rolId: str
    rolNombre: Optional[str] = None
    empleadoId: Optional[str] = None
    estado: str = "Activo"
    ultimoAcceso: Optional[str] = None
    fechaCreacion: Optional[str] = None

    class Config:
        from_attributes = True

class DepartamentoSchema(BaseModel):
    id: Optional[str] = None
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    piso: Optional[str] = None
    responsable: Optional[str] = None
    capacidadCamas: int = 0
    consultorios: int = 1
    telefonoInterno: Optional[str] = None
    estado: str = "Activo"

    class Config:
        from_attributes = True

class CargoSchema(BaseModel):
    id: Optional[str] = None
    titulo: str
    departamentoId: Optional[str] = None
    departamentoNombre: Optional[str] = None
    nivelJerarquico: str = "Asistencial"
    salarioBase: float = 0.0
    requisitos: Optional[str] = None
    descripcion: Optional[str] = None
    estado: str = "Activo"

    class Config:
        from_attributes = True

class EmpleadoSchema(BaseModel):
    id: Optional[str] = None
    cedula: str
    nombres: str
    apellidos: str
    genero: str = "Femenino"
    fechaNacimiento: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    cargoId: Optional[str] = None
    cargoTitulo: Optional[str] = None
    departamentoId: Optional[str] = None
    departamentoNombre: Optional[str] = None
    fechaIngreso: Optional[str] = None
    colegiaturaMedica: Optional[str] = None
    estado: str = "Activo"

    class Config:
        from_attributes = True

class HorarioSchema(BaseModel):
    id: Optional[str] = None
    nombreTurno: str
    empleadoId: str
    empleadoNombre: Optional[str] = None
    departamentoId: Optional[str] = None
    departamentoNombre: Optional[str] = None
    tipoTurno: str = "Matutino"
    horaInicio: str = "07:00"
    horaFin: str = "13:00"
    diasSemana: List[str] = Field(default_factory=list)
    estado: str = "Activo"
    observaciones: Optional[str] = None

    class Config:
        from_attributes = True

class PacienteSchema(BaseModel):
    id: Optional[str] = None
    cedula: str
    nombres: str
    apellidos: str
    fechaNacimiento: Optional[str] = None
    edad: int = 0
    genero: str = "Masculino"
    tipoSangre: str = "O+"
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None
    contactoEmergencia: Dict[str, Any] = Field(default_factory=dict)
    alergias: List[str] = Field(default_factory=list)
    antecedentes: List[str] = Field(default_factory=list)
    fechaRegistro: Optional[str] = None
    estado: str = "Activo"

    class Config:
        from_attributes = True

class ProveedorSchema(BaseModel):
    id: Optional[str] = None
    rif: str
    razonSocial: str
    nombreComercial: str
    contactoPrincipal: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: str = "Caracas"
    categoria: str = "Medicamentos"
    plazoPagoDias: int = 30
    calificacion: int = 5
    estado: str = "Activo"

    class Config:
        from_attributes = True

class MedicamentoSchema(BaseModel):
    id: Optional[str] = None
    codigo: str
    nombreComercial: str
    principioActivo: str
    concentracion: Optional[str] = None
    presentacion: str = "Tabletas"
    viaAdministracion: str = "Oral"
    categoriaTerapeutica: Optional[str] = None
    stockActual: int = 0
    stockMinimo: int = 10
    stockMaximo: int = 500
    ubicacionEstante: Optional[str] = None
    requiereReceta: bool = True
    temperaturaAlmacenamiento: str = "Ambiente (15-25°C)"
    estado: str = "Disponible"

    class Config:
        from_attributes = True

class MovimientoFarmaciaSchema(BaseModel):
    id: Optional[str] = None
    numeroTransaccion: str
    tipoMovimiento: str
    medicamentoId: str
    medicamentoNombre: Optional[str] = None
    cantidad: int
    lote: str
    fechaVencimiento: str
    proveedorId: Optional[str] = None
    proveedorNombre: Optional[str] = None
    pacienteId: Optional[str] = None
    pacienteNombre: Optional[str] = None
    tratamientoId: Optional[str] = None
    responsableEmpleadoId: str
    responsableNombre: Optional[str] = None
    fechaHora: Optional[str] = None
    motivo: str
    observaciones: Optional[str] = None

    class Config:
        from_attributes = True

class CitaSchema(BaseModel):
    id: Optional[str] = None
    codigoCita: str
    pacienteId: str
    pacienteNombre: Optional[str] = None
    pacienteCedula: Optional[str] = None
    medicoId: str
    medicoNombre: Optional[str] = None
    departamentoId: Optional[str] = None
    departamentoNombre: Optional[str] = None
    fecha: str
    hora: str
    motivoConsulta: str
    triajePrioridad: str = "Consulta Regular"
    signosVitales: Dict[str, Any] = Field(default_factory=dict)
    estado: str = "Pendiente"
    diagnosticoPreliminar: Optional[str] = None
    notas: Optional[str] = None

    class Config:
        from_attributes = True

class PrescripcionItemSchema(BaseModel):
    medicamentoId: str
    medicamentoNombre: str
    dosis: str
    frecuencia: str
    duracionDias: int
    cantidadTotal: int
    instruccionesEspeciales: Optional[str] = None

class TratamientoSchema(BaseModel):
    id: Optional[str] = None
    codigoTratamiento: str
    citaId: Optional[str] = None
    pacienteId: str
    pacienteNombre: Optional[str] = None
    pacienteCedula: Optional[str] = None
    medicoId: str
    medicoNombre: Optional[str] = None
    diagnosticoCIE: str
    diagnosticoDescripcion: Optional[str] = None
    prescripciones: List[PrescripcionItemSchema] = Field(default_factory=list)
    indicacionesGenerales: Optional[str] = None
    fechaInicio: str
    fechaFin: str
    proximoControl: Optional[str] = None
    estado: str = "Activo"

    class Config:
        from_attributes = True


# ==========================================
# NUEVOS SCHEMAS CLÍNICOS ENTERPRISE
# ==========================================

class OrdenLaboratorioSchema(BaseModel):
    id: Optional[str] = None
    codigoOrden: str
    pacienteId: str
    pacienteNombre: Optional[str] = None
    pacienteCedula: Optional[str] = None
    pacienteEdad: int = 0
    pacienteGenero: str = "Otro"
    medicoId: Optional[str] = None
    medicoNombre: Optional[str] = None
    fechaOrden: str
    fechaResultado: Optional[str] = None
    prioridad: str = "Rutina"
    perfil: str = "Hematología Completa"
    muestra: str = "Sangre Total"
    resultados: List[Dict[str, Any]] = Field(default_factory=list)
    bioanalistaResponsable: Optional[str] = None
    observacionesClinicas: Optional[str] = None
    codigoValidacionQR: Optional[str] = None
    estado: str = "Solicitado"

    class Config:
        from_attributes = True


class EstudioImagenSchema(BaseModel):
    id: Optional[str] = None
    codigoEstudio: str
    pacienteId: str
    pacienteNombre: Optional[str] = None
    pacienteCedula: Optional[str] = None
    medicoSolicitanteId: Optional[str] = None
    medicoSolicitanteNombre: Optional[str] = None
    modalidad: str = "Rayos X"
    regionAnatomica: str
    fechaSolicitud: str
    fechaRealizacion: Optional[str] = None
    radiologoResponsable: Optional[str] = None
    motivoEstudio: Optional[str] = None
    hallazgos: Optional[str] = None
    impresionDiagnostica: Optional[str] = None
    clasificacionEspecial: Optional[str] = None
    imagenesUrls: List[str] = Field(default_factory=list)
    prioridad: str = "Programada"
    estado: str = "Pendiente"

    class Config:
        from_attributes = True


class CamaHospitalariaSchema(BaseModel):
    id: Optional[str] = None
    codigoCama: str
    salaNombre: str
    tipoCama: str = "Observación"
    estado: str = "Disponible"
    pacienteActualId: Optional[str] = None
    pacienteActualNombre: Optional[str] = None
    pacienteCedula: Optional[str] = None
    fechaIngreso: Optional[str] = None
    medicoTratante: Optional[str] = None
    diagnosticoActual: Optional[str] = None

    class Config:
        from_attributes = True


class AdmisionHospitalariaSchema(BaseModel):
    id: Optional[str] = None
    codigoAdmision: str
    pacienteId: str
    pacienteNombre: Optional[str] = None
    pacienteCedula: Optional[str] = None
    camaId: str
    camaCodigo: Optional[str] = None
    salaNombre: Optional[str] = None
    fechaIngreso: str
    fechaAltaPrevista: Optional[str] = None
    fechaAltaReal: Optional[str] = None
    diagnosticoIngreso: str
    diagnosticoEgreso: Optional[str] = None
    medicoTratanteId: Optional[str] = None
    medicoTratanteNombre: Optional[str] = None
    notasEvolucionSOAP: List[Dict[str, Any]] = Field(default_factory=list)
    ordenesEnfermeria: List[Dict[str, Any]] = Field(default_factory=list)
    estado: str = "Ingresado"

    class Config:
        from_attributes = True


class RegistroTriajeSchema(BaseModel):
    id: Optional[str] = None
    codigoTriaje: str
    pacienteId: str
    pacienteNombre: Optional[str] = None
    pacienteCedula: Optional[str] = None
    fechaHora: str
    enfermeroTriaje: str
    nivelTriaje: str = "Nivel 3 - Urgencia (Amarillo)"
    signosVitales: Dict[str, Any] = Field(default_factory=dict)
    scoreNEWS2: int = 0
    nivelRiesgoNEWS2: str = "Bajo (0-4)"
    motivoUrgencia: str
    destinoRecomendado: str = "Consulta de Urgencias"
    tiempoEsperaMinutos: int = 10
    estado: str = "En Espera"

    class Config:
        from_attributes = True


class OdontogramaSchema(BaseModel):
    id: Optional[str] = None
    pacienteId: str
    pacienteNombre: Optional[str] = None
    pacienteCedula: Optional[str] = None
    odontologoId: Optional[str] = None
    odontologoNombre: Optional[str] = None
    fechaEvaluacion: str
    dientes: Dict[str, Any] = Field(default_factory=dict)
    indiceHigieneOral: str = "Bueno"
    diagnosticoPeriodontal: Optional[str] = None
    planTratamiento: List[Dict[str, Any]] = Field(default_factory=list)
    estado: str = "Activo"

    class Config:
        from_attributes = True


class TeleconsultaSchema(BaseModel):
    id: Optional[str] = None
    codigoConsulta: str
    pacienteId: str
    pacienteNombre: Optional[str] = None
    pacienteCedula: Optional[str] = None
    medicoId: str
    medicoNombre: Optional[str] = None
    especialidad: str = "Medicina General"
    fechaProgramada: str
    horaProgramada: str
    enlaceSalaVirtual: str
    motivo: str
    estadoLlamada: str = "Programada"
    resumenClinico: Optional[str] = None
    chatMensajes: List[Dict[str, Any]] = Field(default_factory=list)

    class Config:
        from_attributes = True


class InterconsultaSchema(BaseModel):
    id: Optional[str] = None
    codigoInterconsulta: str
    pacienteId: str
    pacienteNombre: Optional[str] = None
    pacienteCedula: Optional[str] = None
    medicoSolicitanteId: str
    medicoSolicitanteNombre: Optional[str] = None
    departamentoOrigen: str
    especialidadDestino: str
    medicoConsultadoId: Optional[str] = None
    medicoConsultadoNombre: Optional[str] = None
    prioridad: str = "Alta"
    motivoConsulta: str
    antecedentesRelevantes: Optional[str] = None
    fechaSolicitud: str
    fechaRespuesta: Optional[str] = None
    respuestaEspecialista: Optional[str] = None
    estado: str = "Solicitada"

    class Config:
        from_attributes = True


class ServicioTarifaSchema(BaseModel):
    id: Optional[str] = None
    codigo: str
    nombre: str
    categoria: str = "Consultas"
    descripcion: Optional[str] = None
    precioBaseUSD: float = 0.0
    exoneradoCDI: bool = True
    estado: str = "Activo"

    class Config:
        from_attributes = True


class FacturaSchema(BaseModel):
    id: Optional[str] = None
    codigoFactura: str
    pacienteId: str
    pacienteNombre: Optional[str] = None
    pacienteCedula: Optional[str] = None
    fechaEmision: str
    items: List[Dict[str, Any]] = Field(default_factory=list)
    totalUSD: float = 0.0
    totalBs: float = 0.0
    tasaCambioBs: float = 39.5
    modalidadPago: str = "100% Gratuito CDI (Exonerado)"
    coberturaSeguroPorcentaje: int = 0
    nombreAseguradora: Optional[str] = None
    estadoPago: str = "Exonerado / Gratuito"
    notas: Optional[str] = None

    class Config:
        from_attributes = True


class RegistroAuditoriaSchema(BaseModel):
    id: Optional[str] = None
    fechaHora: str
    usuarioId: str
    usuarioNombre: str
    rol: str
    accion: str
    modulo: str
    registroId: Optional[str] = None
    detalles: str
    ipAddress: str = "127.0.0.1"
    userAgent: Optional[str] = None
    severidad: str = "INFO"

    class Config:
        from_attributes = True


class CasoEpidemiologicoSchema(BaseModel):
    id: Optional[str] = None
    codigoCaso: str
    pacienteId: str
    pacienteNombre: Optional[str] = None
    pacienteCedula: Optional[str] = None
    pacienteEdad: int = 0
    enfermedad: str
    semanaEpidemiologica: int = 33
    ano: int = 2025
    fechaNotificacion: str
    canalEndemicoZona: str = "Zona de Seguridad"
    sectorComunidad: str
    estadoCaso: str = "En Investigación"
    notificadoMPPS: bool = True
    medidasTomadas: Optional[str] = None

    class Config:
        from_attributes = True

