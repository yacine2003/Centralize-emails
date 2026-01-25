# ============================================
# Script de Preparation Node.js Portable
# ============================================

Write-Host "================================================" -ForegroundColor Green
Write-Host "  PREPARATION DE LBC AUTOMATION PORTABLE" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Configuration
$nodeVersion = "18.19.0"
$nodeUrl = "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-win-x64.zip"
$nodeZip = "node-portable.zip"
$nodeFolder = "node-portable"

# Etape 1 : Telecharger Node.js portable
Write-Host "[1/5] Telechargement de Node.js portable v$nodeVersion..." -ForegroundColor Cyan

if (Test-Path $nodeZip) {
    Write-Host "  -> Archive deja presente, suppression..." -ForegroundColor Yellow
    Remove-Item $nodeZip -Force
}

try {
    Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeZip -UseBasicParsing
    Write-Host "  -> Telechargement termine!" -ForegroundColor Green
} catch {
    Write-Host "  -> ERREUR lors du telechargement: $_" -ForegroundColor Red
    exit 1
}

# Etape 2 : Extraire Node.js
Write-Host ""
Write-Host "[2/5] Extraction de Node.js..." -ForegroundColor Cyan

if (Test-Path $nodeFolder) {
    Write-Host "  -> Dossier existant, suppression..." -ForegroundColor Yellow
    Remove-Item $nodeFolder -Recurse -Force
}

try {
    Expand-Archive -Path $nodeZip -DestinationPath "." -Force
    
    # Renommer le dossier extrait
    $extractedFolder = "node-v$nodeVersion-win-x64"
    if (Test-Path $extractedFolder) {
        Rename-Item $extractedFolder $nodeFolder
        Write-Host "  -> Extraction terminee!" -ForegroundColor Green
    } else {
        Write-Host "  -> ERREUR: Dossier extrait non trouve" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  -> ERREUR lors de l'extraction: $_" -ForegroundColor Red
    exit 1
}

# Etape 3 : Copier le code de l'application
Write-Host ""
Write-Host "[3/5] Preparation du code de l'application..." -ForegroundColor Cyan

if (Test-Path "app") {
    Write-Host "  -> Suppression de l'ancien dossier app..." -ForegroundColor Yellow
    Remove-Item "app" -Recurse -Force
}

Write-Host "  -> Creation du dossier app..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "app" -Force | Out-Null

Write-Host "  -> Copie du backend..." -ForegroundColor Yellow
Copy-Item -Path "backend\*" -Destination "app\" -Recurse -Exclude @("node_modules","dist",".browser-data")

Write-Host "  -> Application copiee!" -ForegroundColor Green

# Etape 4 : Installer les dependances
Write-Host ""
Write-Host "[4/6] Installation des dependances Node.js..." -ForegroundColor Cyan
Write-Host "  (Cela peut prendre quelques minutes...)" -ForegroundColor Yellow
Write-Host ""

$env:PATH = "$PWD\$nodeFolder;$env:PATH"
Set-Location "app"

try {
    & "..\$nodeFolder\npm.cmd" install --production
    Write-Host ""
    Write-Host "  -> Dependances installees!" -ForegroundColor Green
} catch {
    Write-Host "  -> ERREUR lors de l'installation: $_" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

Set-Location ".."

# Etape 4.5 : Installer Chrome pour Puppeteer
Write-Host ""
Write-Host "[5/6] Installation de Chrome pour Puppeteer..." -ForegroundColor Cyan
Write-Host "  (Cela peut prendre quelques minutes, Chrome est volumineux...)" -ForegroundColor Yellow
Write-Host ""

$env:PATH = "$PWD\$nodeFolder;$env:PATH"
Set-Location "app"

try {
    Write-Host "  -> Telechargement de Chrome via Puppeteer..." -ForegroundColor Yellow
    & "..\$nodeFolder\npx.cmd" puppeteer browsers install chrome --no-progress
    Write-Host ""
    Write-Host "  -> Chrome installe pour Puppeteer!" -ForegroundColor Green
} catch {
    Write-Host "  -> ATTENTION: Installation de Chrome a echoue: $_" -ForegroundColor Yellow
    Write-Host "  -> L'application utilisera Chrome systeme si disponible" -ForegroundColor Yellow
    Write-Host "  -> Sinon, installez Chrome manuellement depuis https://www.google.com/chrome/" -ForegroundColor Yellow
}

Set-Location ".."

# Etape 6 : Copier les fichiers necessaires
Write-Host ""
Write-Host "[6/6] Copie des fichiers de configuration..." -ForegroundColor Cyan

if (Test-Path "backend\service_account.json") {
    Copy-Item "backend\service_account.json" "app\" -Force
    Write-Host "  -> service_account.json copie" -ForegroundColor Green
} else {
    Write-Host "  -> ATTENTION: service_account.json non trouve!" -ForegroundColor Yellow
}

# Nettoyer l'archive
Write-Host ""
Write-Host "Nettoyage..." -ForegroundColor Cyan
Remove-Item $nodeZip -Force
Write-Host "  -> Archive supprimee" -ForegroundColor Green

# Afficher le resultat
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  PREPARATION TERMINEE AVEC SUCCES!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Structure creee:" -ForegroundColor White
Write-Host "  -> node-portable/  (Node.js v$nodeVersion)" -ForegroundColor Gray
Write-Host "  -> app/            (Votre application)" -ForegroundColor Gray
Write-Host "  -> LBC-Automation.bat (Lanceur)" -ForegroundColor Gray
Write-Host ""
Write-Host "POUR TESTER:" -ForegroundColor Cyan
Write-Host "  Double-cliquez sur LBC-Automation.bat" -ForegroundColor White
Write-Host ""
Write-Host "POUR LIVRER AU CLIENT:" -ForegroundColor Cyan
Write-Host "  1. Compressez ce dossier en .zip" -ForegroundColor White
Write-Host "  2. Envoyez le .zip au client" -ForegroundColor White
Write-Host "  3. Le client decompresse et double-clique sur LBC-Automation.bat" -ForegroundColor White
Write-Host ""
