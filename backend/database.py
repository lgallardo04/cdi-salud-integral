import os
import logging
from typing import Dict, Any, Tuple
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configuración de logging para trazabilidad de base de datos
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cdi.database")

load_dotenv()

# Identificadores institucionales y referencia de Supabase para CDI Salud Integral
SUPABASE_PROJECT_REF = os.getenv("SUPABASE_PROJECT_REF", "oqlgfjtbjpmgpvqhvllz")
SUPABASE_DEFAULT_URL = os.getenv("SUPABASE_URL", f"https://{SUPABASE_PROJECT_REF}.supabase.co")
SUPABASE_DB_HOST = os.getenv("SUPABASE_DB_HOST", f"db.{SUPABASE_PROJECT_REF}.supabase.co")

# Ruta absoluta al archivo SQLite local por defecto (garantiza consistencia sin importar el CWD)
DEFAULT_SQLITE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "cdi_salud.db"))


def resolve_database_url() -> Tuple[str, bool]:
    """
    Resuelve la URL de la base de datos evaluando variables de entorno en orden de prioridad:
    1. DATABASE_URL
    2. SUPABASE_DB_URL / SUPABASE_DATABASE_URL
    3. POSTGRES_URL
    4. Ensamblado automático si existen credenciales directas de Supabase
    5. Fallback a SQLite local si no está configurada o está vacía.

    Retorna:
        Tuple[str, bool]: (url_resuelta, es_fallback_sqlite)
    """
    raw_url = (
        os.getenv("DATABASE_URL")
        or os.getenv("SUPABASE_DB_URL")
        or os.getenv("SUPABASE_DATABASE_URL")
        or os.getenv("POSTGRES_URL")
    )

    # Si no hay URL directa pero se suministran credenciales de Supabase
    if (not raw_url or not raw_url.strip()) and os.getenv("SUPABASE_DB_PASSWORD"):
        password = os.getenv("SUPABASE_DB_PASSWORD")
        user = os.getenv("SUPABASE_DB_USER", "postgres")
        port = os.getenv("SUPABASE_DB_PORT", "5432")
        database = os.getenv("SUPABASE_DB_NAME", "postgres")
        raw_url = f"postgresql://{user}:{password}@{SUPABASE_DB_HOST}:{port}/{database}?sslmode=require"
        logger.info(f"URL de Supabase auto-construida para proyecto [{SUPABASE_PROJECT_REF}].")

    # Fallback a SQLite si no está configurada, está vacía o es un valor nulo
    if not raw_url or raw_url.strip() in ("", "None", "null", "undefined"):
        sqlite_url = f"sqlite:///{DEFAULT_SQLITE_PATH}"
        logger.info(f"DATABASE_URL no configurada. Usando SQLite local: {DEFAULT_SQLITE_PATH}")
        return sqlite_url, True

    cleaned_url = raw_url.strip()

    # Normalización: postgres:// -> postgresql:// (requerido por SQLAlchemy >= 1.4 / 2.0)
    if cleaned_url.startswith("postgres://"):
        cleaned_url = cleaned_url.replace("postgres://", "postgresql://", 1)

    return cleaned_url, False


DATABASE_URL, IS_SQLITE_FALLBACK = resolve_database_url()

# Construcción de parámetros del motor SQLAlchemy
engine_kwargs: Dict[str, Any] = {}

if "sqlite" in DATABASE_URL:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Configuración de pooling empresarial y conexión segura para PostgreSQL / Supabase
    pool_size = int(os.getenv("DB_POOL_SIZE", "10"))
    max_overflow = int(os.getenv("DB_MAX_OVERFLOW", "20"))
    pool_recycle = int(os.getenv("DB_POOL_RECYCLE", "300"))
    pool_timeout = int(os.getenv("DB_POOL_TIMEOUT", "30"))

    connect_args: Dict[str, Any] = {}
    # Asegurar SSL mode require si no está ya explicitado en el query string
    if "sslmode" not in DATABASE_URL:
        connect_args["sslmode"] = "require"

    engine_kwargs.update({
        "pool_size": pool_size,
        "max_overflow": max_overflow,
        "pool_recycle": pool_recycle,
        "pool_pre_ping": True,  # Pre-ping activo para descartar conexiones caídas o reiniciadas por el pooler
        "pool_timeout": pool_timeout,
        "connect_args": connect_args,
    })
    logger.info("Engine PostgreSQL configurado con pooling activo, pre_ping y SSL mode.")

try:
    engine = create_engine(DATABASE_URL, **engine_kwargs)
except Exception as exc:
    logger.error(f"Error al instanciar create_engine para {DATABASE_URL}: {exc}. Aplicando fallback a SQLite.")
    DATABASE_URL = f"sqlite:///{DEFAULT_SQLITE_PATH}"
    IS_SQLITE_FALLBACK = True
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Generador de sesiones de base de datos para inyección de dependencias en FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> Dict[str, Any]:
    """
    Comprueba activamente la conectividad con la base de datos ejecutando SELECT 1.
    Retorna métricas de diagnóstico sobre el motor, dialecto y Supabase.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        dialect = engine.dialect.name
        url_str = str(engine.url)
        is_supabase = "supabase" in url_str or SUPABASE_PROJECT_REF in url_str
        return {
            "status": "connected",
            "dialect": dialect,
            "is_supabase": is_supabase,
            "supabase_project": SUPABASE_PROJECT_REF if is_supabase else None,
            "is_sqlite_fallback": IS_SQLITE_FALLBACK,
            "pool_size": getattr(engine.pool, "size", lambda: None)() if hasattr(engine.pool, "size") else None,
            "checked": True,
        }
    except Exception as exc:
        logger.warning(f"Error en healthcheck de base de datos: {exc}")
        return {
            "status": "error",
            "error": str(exc),
            "dialect": engine.dialect.name if hasattr(engine, "dialect") else "unknown",
            "is_sqlite_fallback": IS_SQLITE_FALLBACK,
            "checked": False,
        }
