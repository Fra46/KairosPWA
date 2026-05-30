@echo off
REM Script para iniciar Frontend + Backend simultáneamente en Windows

echo ===================================================
echo  Kairos PWA - Firebase Integration Startup
echo ===================================================
echo.

REM Verificar que estamos en la carpeta correcta
if not exist "KairosFrontend" (
    echo Error: Carpeta KairosFrontend no encontrada
    echo Ejecuta este script desde la raiz del proyecto (c:\Users\andre\Desktop\KairosPWA)
    pause
    exit /b 1
)

echo [1/2] Iniciando Frontend en http://localhost:5173
start cmd /k "cd KairosFrontend && npm run dev"

echo [2/2] Iniciando Backend en https://localhost:7001
start cmd /k "cd KairosPWA && dotnet run"

echo.
echo ===================================================
echo Ambas aplicaciones se estan iniciando...
echo Frontend: http://localhost:5173
echo Backend:  https://localhost:7001
echo API Docs: https://localhost:7001/swagger
echo ===================================================
echo.
pause
