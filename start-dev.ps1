# Script para iniciar Frontend + Backend simultáneamente en Windows PowerShell

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Kairos PWA - Firebase Integration Startup" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar carpetas
if (-not (Test-Path "KairosFrontend")) {
    Write-Host "Error: Carpeta KairosFrontend no encontrada" -ForegroundColor Red
    Write-Host "Ejecuta este script desde la raiz del proyecto" -ForegroundColor Red
    exit 1
}

Write-Host "[1/2] Iniciando Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'KairosFrontend'; npm run dev"

Write-Host "[2/2] Iniciando Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'KairosPWA'; dotnet run"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Ambas aplicaciones se estan iniciando..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend:  https://localhost:7001" -ForegroundColor Yellow
Write-Host "API Docs: https://localhost:7001/swagger" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
