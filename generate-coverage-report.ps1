# generate-coverage-report.ps1
# Script para automatizar la generacion del reporte de cobertura con xUnit

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Generador de Reporte de Cobertura - xUnit" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Ejecutar tests y recolectar cobertura
Write-Host "[1/3] Ejecutando tests y recolectando datos de cobertura..." -ForegroundColor Yellow
$dotnetArgs = @(
    'test',
    '.\KairosPWA.Tests\KairosPWA.Tests.csproj',
    '--collect:"XPlat Code Coverage"',
    '--results-directory',
    '.\KairosPWA.Tests\TestResults'
)
& dotnet @dotnetArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Los tests fallaron" -ForegroundColor Red
    exit 1
}

Write-Host "Tests completados exitosamente" -ForegroundColor Green
Write-Host ""

# Paso 2: Obtener la carpeta mas reciente de TestResults
Write-Host "[2/3] Localizando archivo de cobertura..." -ForegroundColor Yellow
$latestCoverage = Get-ChildItem .\KairosPWA.Tests\TestResults | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty Name

$coverageXml = ".\KairosPWA.Tests\TestResults\$latestCoverage\coverage.cobertura.xml"

if (-not (Test-Path $coverageXml)) {
    Write-Host "ERROR: No se encontro $coverageXml" -ForegroundColor Red
    exit 1
}

Write-Host "Archivo encontrado: $coverageXml" -ForegroundColor Green
Write-Host ""

# Paso 3: Generar HTML con ReportGenerator
Write-Host "[3/3] Generando reporte HTML..." -ForegroundColor Yellow
$reportGeneratorPath = "$env:USERPROFILE\.dotnet\tools\reportgenerator.exe"

if (-not (Test-Path $reportGeneratorPath)) {
    Write-Host "ERROR: ReportGenerator no esta instalado globalmente" -ForegroundColor Red
    Write-Host "Instalalo con: dotnet tool install -g dotnet-reportgenerator-globaltool" -ForegroundColor Yellow
    exit 1
}

& $reportGeneratorPath -reports:$coverageXml -targetdir:".\KairosPWA.Tests\coverage-report" -reporttypes:Html -filefilters:'+*;-*Program.cs;-*Migrations*'

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: ReportGenerator fallo" -ForegroundColor Red
    exit 1
}

Write-Host "Reporte HTML generado" -ForegroundColor Green
Write-Host ""

# Paso 4: Abrir el reporte
Write-Host "[4/4] Abriendo reporte en navegador..." -ForegroundColor Yellow
$reportPath = ".\KairosPWA.Tests\coverage-report\index.html"

if (Test-Path $reportPath) {
    Start-Process $reportPath
    Write-Host "Reporte abierto" -ForegroundColor Green
} else {
    Write-Host "ADVERTENCIA: No se pudo abrir el reporte automaticamente" -ForegroundColor Yellow
    Write-Host "Abrelo manualmente: $reportPath" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Proceso completado exitosamente" -ForegroundColor Green
Write-Host "Reporte disponible en: .\KairosPWA.Tests\coverage-report\index.html" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
