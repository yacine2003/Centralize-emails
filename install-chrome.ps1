# ============================================
# Script d'Installation de Chrome pour Puppeteer
# ============================================

Write-Host "================================================" -ForegroundColor Green
Write-Host "  INSTALLATION DE CHROME POUR PUPPETEER" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Vérifier que nous sommes dans le bon dossier
if (-not (Test-Path "app")) {
    Write-Host "ERREUR: Ce script doit etre execute depuis le dossier racine de LBC-Automation" -ForegroundColor Red
    Write-Host "Le dossier 'app' est introuvable." -ForegroundColor Red
    exit 1
}

# Vérifier que node-portable existe
if (-not (Test-Path "node-portable")) {
    Write-Host "ERREUR: Le dossier 'node-portable' est introuvable." -ForegroundColor Red
    Write-Host "Executez d'abord setup-portable.ps1" -ForegroundColor Red
    exit 1
}

Write-Host "Installation de Chrome pour Puppeteer..." -ForegroundColor Cyan
Write-Host "(Cela peut prendre quelques minutes, Chrome est volumineux...)" -ForegroundColor Yellow
Write-Host ""

$env:PATH = "$PWD\node-portable;$env:PATH"
Set-Location "app"

try {
    Write-Host "Telechargement de Chrome via Puppeteer..." -ForegroundColor Yellow
    & "..\node-portable\npx.cmd" puppeteer browsers install chrome --no-progress
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  CHROME INSTALLE AVEC SUCCES!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez maintenant lancer LBC-Automation.bat" -ForegroundColor White
} catch {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "  ERREUR LORS DE L'INSTALLATION" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "L'installation automatique a echoue: $_" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SOLUTIONS ALTERNATIVES:" -ForegroundColor Cyan
    Write-Host "  1. Installez Google Chrome manuellement depuis:" -ForegroundColor White
    Write-Host "     https://www.google.com/chrome/" -ForegroundColor Gray
    Write-Host "  2. L'application utilisera Chrome systeme si disponible" -ForegroundColor White
    Write-Host ""
}

Set-Location ".."
