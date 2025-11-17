# Script robusto para iniciar o servidor Next.js com auto-restart
$ErrorActionPreference = "Continue"

# Define variáveis de ambiente
$env:WATCHPACK_POLLING = "true"
$env:NODE_OPTIONS = "--no-warnings --max-old-space-size=4096 --no-deprecation"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SERVIDOR NEXT.JS - MODO ROBUSTO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Limpa cache apenas na primeira execução
if (-not (Test-Path ".next")) {
    Write-Host "Limpando cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
}

Write-Host "Iniciando servidor em http://localhost:3000" -ForegroundColor Green
Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Yellow
Write-Host ""

$maxRestarts = 10
$restartCount = 0

while ($restartCount -lt $maxRestarts) {
    try {
        # Inicia o servidor
        npm.cmd run dev
        
        # Se chegou aqui, o servidor foi parado normalmente
        break
    }
    catch {
        $restartCount++
        Write-Host ""
        Write-Host "Servidor parou inesperadamente. Reiniciando... ($restartCount/$maxRestarts)" -ForegroundColor Red
        Start-Sleep -Seconds 2
    }
}

if ($restartCount -ge $maxRestarts) {
    Write-Host ""
    Write-Host "Muitas tentativas de reinício. Parando." -ForegroundColor Red
}

