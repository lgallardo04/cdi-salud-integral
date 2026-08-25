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
    assert data["modules_active"] == 24

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
        "/api/casosEpidemiologicos"
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

if __name__ == "__main__":
    print("Ejecutando suite de pruebas automatizadas del backend CDI...")
    test_healthcheck()
    test_get_roles()
    test_get_pacientes()
    test_get_medicamentos()
    test_clinical_enterprise_endpoints()
    test_create_and_delete_paciente()
    test_kpis()
    print("✓ ¡Todas las pruebas del backend pasaron exitosamente!")
