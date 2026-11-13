import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import database
from database import engine, Base, check_db_connection, DEFAULT_SQLITE_PATH
from routers.api_router import router as cdi_router
from seed import seed_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cdi.api")

_db_initialized = False


def init_database():
    """
    Inicializa las tablas de la base de datos y los datos semilla del CDI.
    Cuenta con mecanismo de recuperación y fallback automático a SQLite
    en caso de que la conexión remota a PostgreSQL / Supabase sufra fallos.
    """
    global _db_initialized
    if _db_initialized:
        return

    try:
        logger.info(f"Conectando a base de datos ({database.engine.url.drivername})...")
        Base.metadata.create_all(bind=database.engine)
        seed_database()
        _db_initialized = True
        logger.info("Base de datos y esquemas del CDI inicializados con éxito.")
    except Exception as exc:
        logger.error(f"Fallo al inicializar base de datos principal: {exc}")
        # Si falló una conexión remota (ej. Supabase sin red o credenciales pendientes), recurrir a SQLite
        if "sqlite" not in str(database.engine.url):
            try:
                logger.warning("Intentando fallback de emergencia a SQLite local...")
                from sqlalchemy import create_engine
                from sqlalchemy.orm import sessionmaker
                fallback_url = f"sqlite:///{DEFAULT_SQLITE_PATH}"
                fallback_engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
                database.engine = fallback_engine
                database.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=fallback_engine)
                database.IS_SQLITE_FALLBACK = True
                Base.metadata.create_all(bind=fallback_engine)
                seed_database()
                _db_initialized = True
                logger.info(f"Fallback a SQLite completado exitosamente ({DEFAULT_SQLITE_PATH}).")
            except Exception as fb_exc:
                logger.error(f"Error crítico en fallback a SQLite: {fb_exc}")


# Inicialización temprana para garantizar disponibilidad tanto en tests
# como en ejecuciones modulares y scripts
init_database()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Asegurar inicialización durante el arranque del servidor uvicorn
    init_database()
    yield
    # Limpieza limpia del pool de conexiones al apagar el servidor
    try:
        if database.engine:
            database.engine.dispose()
            logger.info("Pool de conexiones de base de datos cerrado correctamente.")
    except Exception as err:
        logger.warning(f"Error al cerrar pool de base de datos: {err}")


app = FastAPI(
    title="CDI - Sistema Integral de Salud API",
    description="API RESTful para Centros de Diagnóstico Integral (CDI) con 26 módulos asistenciales y administrativos integrados con Supabase Cloud y PostgreSQL.",
    version="2.6.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configuración CORS para Web, PWA y Móviles Android (Capacitor)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar Routers de la API
app.include_router(cdi_router)

# Ruta informativa raíz de la API
@app.get("/api")
def api_info():
    db_info = check_db_connection()
    return {
        "message": "Bienvenido al Sistema Integral de Gestión Médica CDI",
        "docs": "/docs",
        "api_health": "/api/health",
        "database": {
            "status": db_info.get("status"),
            "dialect": db_info.get("dialect"),
            "is_supabase": db_info.get("is_supabase", False),
            "project_ref": database.SUPABASE_PROJECT_REF
        }
    }


# Servir Frontend estático si existe el bundle compilado
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist"))


@app.get("/")
def root(request: Request):
    accept = request.headers.get("accept", "")
    # Si la petición es desde un cliente API o test (solicita JSON)
    if "application/json" in accept and "text/html" not in accept:
        db_info = check_db_connection()
        return {
            "message": "Bienvenido al Sistema Integral de Gestión Médica CDI",
            "docs": "/docs",
            "api_health": "/api/health",
            "database": {
                "status": db_info.get("status"),
                "dialect": db_info.get("dialect"),
                "is_supabase": db_info.get("is_supabase", False),
                "project_ref": database.SUPABASE_PROJECT_REF
            }
        }
    # Si existe el bundle SPA compilado, servir la aplicación
    if os.path.exists(FRONTEND_DIST):
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)

    # Fallback si no hay bundle frontend compilado
    db_info = check_db_connection()
    return {
        "message": "Bienvenido al Sistema Integral de Gestión Médica CDI",
        "docs": "/docs",
        "api_health": "/api/health",
        "database": {
            "status": db_info.get("status"),
            "dialect": db_info.get("dialect"),
            "is_supabase": db_info.get("is_supabase", False),
            "project_ref": database.SUPABASE_PROJECT_REF
        }
    }


if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and not os.path.isdir(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
