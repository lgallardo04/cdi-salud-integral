#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "=========================================================="
echo "  CDI SALUD INTEGRAL - COMPILACIÓN INTEGRAL DEL SISTEMA"
echo "=========================================================="
echo "Directorio base: $PROJECT_ROOT"

echo ""
echo "[1/3] Compilando Frontend Web y PWA (Vite + React + TS)..."
cd "$PROJECT_ROOT/frontend"
npm run build

echo ""
echo "[2/3] Sincronizando activos web con Proyecto Nativo Android (Capacitor)..."
npx cap sync android

echo ""
echo "[3/3] Inicializando Base de Datos SQLite y Backend..."
cd "$PROJECT_ROOT/backend"
if [ -f "$PROJECT_ROOT/backend/.venv/bin/python" ]; then
    "$PROJECT_ROOT/backend/.venv/bin/python" seed.py
else
    python3 seed.py
fi

echo ""
echo "=========================================================="
echo " ¡COMPILACIÓN COMPLETADA SATISFACTORIAMENTE!"
echo " - Bundle Web listo en: $PROJECT_ROOT/frontend/dist"
echo " - Proyecto Android APK listo en: $PROJECT_ROOT/frontend/android"
echo " - Base de datos SQLite lista en: $PROJECT_ROOT/backend/cdi_salud.db"
echo "=========================================================="
