from fastapi.testclient import TestClient
from main import app
from database import Base, engine, SessionLocal
import models

client = TestClient(app)

def test_healthcheck():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["modules_active"] == 26

def test_get_roles():
    response = client.get("/api/roles")
    assert response.status_code == 200

def test_get_pacientes():
    response = client.get("/api/pacientes")
    assert response.status_code == 200

def test_get_medicamentos():
    response = client.get("/api/medicamentos")
    assert response.status_code == 200

def test_clinical_enterprise_endpoints():
    endpoints = [
        "/api/ordenesLaboratorio",
        "/api/estudiosImagen",
        "/api/camasHospitalarias",
        "/api/admisionesHospitalarias",
        "/api/registrosTriaje",
        "/api/odontogramas",
        "/api/teleconsultas",
        "/api/interconsultas",
        "/api/serviciosTarifas",
        "/api/facturas",
        "/api/registrosAuditoria",
        "/api/casosEpidemiologicos",
        "/api/evaluacionesNutricionales",
        "/api/consultasOftalmicas",
        "/api/candidatosMisionMilagro"
    ]
    for ep in endpoints:
        res = client.get(ep)
        assert res.status_code == 200, f"Error en endpoint {ep}: {res.text}"

def test_create_and_delete_paciente():
    new_patient = {
        "id": "pac-test-1",
        "cedula": "V-99999999",
        "nombres": "Paciente",
        "apellidos": "Prueba Automatizada",
        "edad": 30,
        "genero": "Masculino",
        "tipoSangre": "O+",
        "telefono": "+58 414-0000000",
        "direccion": "Sector Pruebas",
        "alergias": ["Ninguna"],
        "antecedentes": ["Ninguno"],
        "estado": "Activo"
    }
    # Create
    res_create = client.post("/api/pacientes", json=new_patient)
    assert res_create.status_code == 201
    created_id = res_create.json()["id"]

    # Read
    res_get = client.get(f"/api/pacientes/{created_id}")
    assert res_get.status_code == 200
    assert res_get.json()["cedula"] == "V-99999999"

    # Delete
    res_del = client.delete(f"/api/pacientes/{created_id}")
    assert res_del.status_code == 204

def test_kpis():
    response = client.get("/api/kpis")
    assert response.status_code == 200
    kpis = response.json()
    assert "totalPacientes" in kpis
    assert "citasHoy" in kpis
    assert "medicamentosCriticos" in kpis
    assert "ocupacionCamasPorcentaje" in kpis

def test_root():
    response = client.get("/", headers={"Accept": "application/json"})
    assert response.status_code == 200
    data = response.json()
    assert "database" in data
    assert data["database"]["project_ref"] == "oqlgfjtbjpmgpvqhvllz"
    assert data["database"]["status"] == "connected"

    # También verificar /api
    res_api = client.get("/api")
    assert res_api.status_code == 200
    data_api = res_api.json()
    assert data_api["database"]["status"] == "connected"

def test_database_health_and_config():
    from database import check_db_connection, resolve_database_url, SUPABASE_PROJECT_REF
    health = check_db_connection()
    assert health["status"] == "connected"
    assert health["checked"] is True
    assert SUPABASE_PROJECT_REF == "oqlgfjtbjpmgpvqhvllz"

def test_supabase_url_resolution():
    import os
    from database import resolve_database_url
    
    # Test fallback a SQLite
    orig_env = os.environ.get("DATABASE_URL")
    try:
        os.environ.pop("DATABASE_URL", None)
        url, is_sqlite = resolve_database_url()
        assert is_sqlite is True
        assert "sqlite:///" in url

        # Test normalización postgres://
        os.environ["DATABASE_URL"] = "postgres://user:pass@db.oqlgfjtbjpmgpvqhvllz.supabase.co:5432/postgres"
        url, is_sqlite = resolve_database_url()
        assert is_sqlite is False
        assert url.startswith("postgresql://")
    finally:
        if orig_env is not None:
            os.environ["DATABASE_URL"] = orig_env
        else:
            os.environ.pop("DATABASE_URL", None)

if __name__ == "__main__":
    print("Ejecutando suite de pruebas automatizadas del backend CDI...")
    test_healthcheck()
    test_root()
    test_database_health_and_config()
    test_supabase_url_resolution()
    test_get_roles()
    test_get_pacientes()
    test_get_medicamentos()
    test_clinical_enterprise_endpoints()
    test_create_and_delete_paciente()
    test_kpis()
    print("✓ ¡Todas las pruebas del backend pasaron exitosamente!")
