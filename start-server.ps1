# Script para iniciar o servidor Next.js ignorando erros do VirtualBox
$ErrorActionPreference = "SilentlyContinue"

# Define variáveis de ambiente
$env:WATCHPACK_POLLING = "true"
$env:NODE_OPTIONS = "--no-warnings --max-old-space-size=4096"

# Limpa cache
Write-Host "Limpando cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

Write-Host "Iniciando servidor..." -ForegroundColor Green
Write-Host "Acesse http://localhost:3000 quando estiver pronto" -ForegroundColor Cyan

# Inicia o servidor
npm.cmd run dev


