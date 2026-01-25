@echo off
REM ============================================
REM Script d'Installation de Chrome pour Puppeteer
REM ============================================

echo ================================================
echo   INSTALLATION DE CHROME POUR PUPPETEER
echo ================================================
echo.

REM Vérifier que nous sommes dans le bon dossier
if not exist "app" (
    echo ERREUR: Ce script doit etre execute depuis le dossier racine de LBC-Automation
    echo Le dossier 'app' est introuvable.
    pause
    exit /b 1
)

REM Vérifier que node-portable existe
if not exist "node-portable" (
    echo ERREUR: Le dossier 'node-portable' est introuvable.
    echo Executez d'abord setup-portable.ps1
    pause
    exit /b 1
)

echo Installation de Chrome pour Puppeteer...
echo (Cela peut prendre quelques minutes, Chrome est volumineux...)
echo.

REM Ajouter node-portable au PATH
set "PATH=%CD%\node-portable;%PATH%"

REM Aller dans le dossier app
cd app

REM Installer Chrome via Puppeteer
echo Telechargement de Chrome via Puppeteer...
call "..\node-portable\npx.cmd" puppeteer browsers install chrome --no-progress

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo   CHROME INSTALLE AVEC SUCCES!
    echo ================================================
    echo.
    echo Vous pouvez maintenant lancer LBC-Automation.bat
) else (
    echo.
    echo ================================================
    echo   ERREUR LORS DE L'INSTALLATION
    echo ================================================
    echo.
    echo L'installation automatique a echoue.
    echo.
    echo SOLUTIONS ALTERNATIVES:
    echo   1. Installez Google Chrome manuellement depuis:
    echo      https://www.google.com/chrome/
    echo   2. L'application utilisera Chrome systeme si disponible
    echo.
)

cd ..

pause
