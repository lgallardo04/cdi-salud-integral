#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "=========================================================="
echo "  CDI SALUD INTEGRAL - GUÍA Y COMPILADOR DE APK ANDROID"
echo "=========================================================="

cd "$PROJECT_ROOT/frontend"

echo "1. Compilando la última versión del código frontend..."
npm run build

echo "2. Sincronizando con el contenedor nativo Android..."
npx cap sync android

echo ""
echo "3. Opciones para generar el archivo APK:"
echo "----------------------------------------------------------"
echo " Opción A: Abrir directamente en Android Studio:"
echo "   $ npx cap open android"
echo "   (Luego en Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s))"
echo ""
echo " Opción B: Compilar desde la línea de comandos con Gradle:"
echo "   $ cd android && ./gradlew assembleDebug"
echo "   El archivo APK generado se guardará en:"
echo "   android/app/build/outputs/apk/debug/app-debug.apk"
echo "----------------------------------------------------------"

if which javac >/dev/null 2>&1 && [ -n "$ANDROID_HOME" ]; then
    echo "Entorno Android SDK detectado. Iniciando compilación automática de APK debug..."
    cd android
    ./gradlew assembleDebug
    echo "¡APK generado con éxito en: $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "Nota: Si no tienes el JDK o Android SDK configurado en la terminal actual,"
    echo "puedes abrir el proyecto en Android Studio con: 'npx cap open android' o instalar Android Studio."
fi
