# Script para rodar servidor Next.js com tratamento de erros do VirtualBox
$ErrorActionPreference = "SilentlyContinue"

# Variáveis de ambiente
$env:WATCHPACK_POLLING = "true"
$env:NODE_OPTIONS = "--no-warnings --max-old-space-size=4096 --no-deprecation --disable-warning=DeprecationWarning"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  INICIANDO SERVIDOR NEXT.JS" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Servidor: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Loop infinito para reiniciar automaticamente
while ($true) {
    try {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Iniciando servidor..." -ForegroundColor Yellow
        
        # Executa o npm run dev
        npm.cmd run dev
        
        # Se chegou aqui, o servidor foi parado normalmente
        Write-Host ""
        Write-Host "Servidor parado pelo usuário." -ForegroundColor Green
        break
    }
    catch {
        Write-Host ""
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Erro detectado. Reiniciando em 3 segundos..." -ForegroundColor Red
        Start-Sleep -Seconds 3
    }
}

