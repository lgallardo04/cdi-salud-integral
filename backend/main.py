import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import engine, Base
from routers.api_router import router as cdi_router
from seed import seed_database

# Crear tablas e inicializar base de datos
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="CDI - Sistema Integral de Salud API",
    description="API RESTful para Centros de Diagnóstico Integral (CDI) con 12 módulos asistenciales y administrativos.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuración CORS para aplicaciones Web, PWA y Móviles Android (Capacitor)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar Routers de la API
app.include_router(cdi_router)

# Servir Frontend estático si existe el bundle compilado
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist"))

if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and not os.path.isdir(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

@app.get("/")
def root():
    return {
        "message": "Bienvenido al Sistema Integral de Gestión Médica CDI",
        "docs": "/docs",
        "api_health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
