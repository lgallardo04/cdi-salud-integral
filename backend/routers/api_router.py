from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database import get_db
import models
import schemas
from datetime import datetime

router = APIRouter(prefix="/api")

# Helper CRUD genérico
def build_crud_routes(router: APIRouter, path: str, model_cls, schema_cls, id_prefix: str):
    @router.get(f"/{path}", response_model=List[schema_cls])
    def get_all(db: Session = Depends(get_db)):
        return db.query(model_cls).all()

    @router.get(f"/{path}/{{item_id}}", response_model=schema_cls)
    def get_by_id(item_id: str, db: Session = Depends(get_db)):
        item = db.query(model_cls).filter(model_cls.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        return item

    @router.post(f"/{path}", response_model=schema_cls, status_code=status.HTTP_201_CREATED)
    def create(item_data: schema_cls, db: Session = Depends(get_db)):
        data_dict = item_data.model_dump(exclude_unset=True)
        if not data_dict.get("id"):
            data_dict["id"] = f"{id_prefix}-{int(datetime.utcnow().timestamp() * 1000)}"
        
        db_item = model_cls(**data_dict)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @router.put(f"/{path}/{{item_id}}", response_model=schema_cls)
    def update(item_id: str, item_data: schema_cls, db: Session = Depends(get_db)):
        db_item = db.query(model_cls).filter(model_cls.id == item_id).first()
        if not db_item:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        
        data_dict = item_data.model_dump(exclude_unset=True)
        for key, value in data_dict.items():
            if key != "id":
                setattr(db_item, key, value)
        
        db.commit()
        db.refresh(db_item)
        return db_item

    @router.delete(f"/{path}/{{item_id}}", status_code=status.HTTP_204_NO_CONTENT)
    def delete(item_id: str, db: Session = Depends(get_db)):
        db_item = db.query(model_cls).filter(model_cls.id == item_id).first()
        if not db_item:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        db.delete(db_item)
        db.commit()
        return None

# Registrar los 12 módulos existentes del CDI
build_crud_routes(router, "roles", models.RoleModel, schemas.RoleSchema, "rol")
build_crud_routes(router, "usuarios", models.UsuarioModel, schemas.UsuarioSchema, "usr")
build_crud_routes(router, "departamentos", models.DepartamentoModel, schemas.DepartamentoSchema, "dep")
build_crud_routes(router, "cargos", models.CargoModel, schemas.CargoSchema, "car")
build_crud_routes(router, "empleados", models.EmpleadoModel, schemas.EmpleadoSchema, "emp")
build_crud_routes(router, "horarios", models.HorarioModel, schemas.HorarioSchema, "hor")
build_crud_routes(router, "pacientes", models.PacienteModel, schemas.PacienteSchema, "pac")
build_crud_routes(router, "proveedores", models.ProveedorModel, schemas.ProveedorSchema, "prov")
build_crud_routes(router, "medicamentos", models.MedicamentoModel, schemas.MedicamentoSchema, "med")
build_crud_routes(router, "movimientosFarmacia", models.MovimientoFarmaciaModel, schemas.MovimientoFarmaciaSchema, "mov")
build_crud_routes(router, "citas", models.CitaModel, schemas.CitaSchema, "cit")
build_crud_routes(router, "tratamientos", models.TratamientoModel, schemas.TratamientoSchema, "tra")

# Registrar los 12 módulos clínicos enterprise nuevos
build_crud_routes(router, "ordenesLaboratorio", models.OrdenLaboratorioModel, schemas.OrdenLaboratorioSchema, "lab")
build_crud_routes(router, "estudiosImagen", models.EstudioImagenModel, schemas.EstudioImagenSchema, "rad")
build_crud_routes(router, "camasHospitalarias", models.CamaHospitalariaModel, schemas.CamaHospitalariaSchema, "cam")
build_crud_routes(router, "admisionesHospitalarias", models.AdmisionHospitalariaModel, schemas.AdmisionHospitalariaSchema, "adm")
build_crud_routes(router, "registrosTriaje", models.RegistroTriajeModel, schemas.RegistroTriajeSchema, "tri")
build_crud_routes(router, "odontogramas", models.OdontogramaModel, schemas.OdontogramaSchema, "odo")
build_crud_routes(router, "teleconsultas", models.TeleconsultaModel, schemas.TeleconsultaSchema, "tel")
build_crud_routes(router, "interconsultas", models.InterconsultaModel, schemas.InterconsultaSchema, "itc")
build_crud_routes(router, "serviciosTarifas", models.ServicioTarifaModel, schemas.ServicioTarifaSchema, "tar")
build_crud_routes(router, "facturas", models.FacturaModel, schemas.FacturaSchema, "fac")
build_crud_routes(router, "registrosAuditoria", models.RegistroAuditoriaModel, schemas.RegistroAuditoriaSchema, "aud")
build_crud_routes(router, "casosEpidemiologicos", models.CasoEpidemiologicoModel, schemas.CasoEpidemiologicoSchema, "epi")

# Endpoint Healthcheck
@router.get("/health")
def healthcheck():
    return {
        "status": "online",
        "system": "CDI Salud Integral REST API",
        "version": "2.5.0",
        "modules_active": 24,
        "timestamp": datetime.utcnow().isoformat()
    }

# Endpoint Estadísticas Clínicas
@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    total_pacientes = db.query(models.PacienteModel).count()
    total_citas = db.query(models.CitaModel).count()
    citas_pendientes = db.query(models.CitaModel).filter(models.CitaModel.estado.in_(["Pendiente", "En Triaje"])).count()
    meds = db.query(models.MedicamentoModel).all()
    criticos = sum(1 for m in meds if m.stockActual <= m.stockMinimo)
    empleados_activos = db.query(models.EmpleadoModel).filter(models.EmpleadoModel.estado == "Activo").count()

    # Métricas adicionales
    total_camas = db.query(models.CamaHospitalariaModel).count()
    camas_ocupadas = db.query(models.CamaHospitalariaModel).filter(models.CamaHospitalariaModel.estado == "Ocupada").count()
    ocupacion_pct = round((camas_ocupadas / total_camas) * 100) if total_camas > 0 else 60

    return {
        "totalPacientes": total_pacientes,
        "citasHoy": total_citas,
        "citasPendientes": citas_pendientes,
        "medicamentosCriticos": criticos,
        "despachosHoy": db.query(models.MovimientoFarmaciaModel).count(),
        "ocupacionCamasPorcentaje": ocupacion_pct,
        "empleadosActivos": empleados_activos,
        "turnosActivos": db.query(models.HorarioModel).count(),
        "urgenciasActivas": db.query(models.RegistroTriajeModel).filter(models.RegistroTriajeModel.estado == "En Espera").count(),
        "laboratoriosPendientes": db.query(models.OrdenLaboratorioModel).filter(models.OrdenLaboratorioModel.estado == "En Proceso").count(),
        "imagenesPendientes": db.query(models.EstudioImagenModel).filter(models.EstudioImagenModel.estado == "Pendiente").count(),
        "pacientesHospitalizados": camas_ocupadas,
        "teleconsultasHoy": db.query(models.TeleconsultaModel).count(),
        "casosEpidemiologicosSemana": db.query(models.CasoEpidemiologicoModel).count()
    }

