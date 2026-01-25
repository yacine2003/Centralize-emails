@echo off
REM Script pour lancer le build Electron en tant qu'administrateur
REM Cela résout le problème des liens symboliques winCodeSign

echo ================================================
echo  BUILD ELECTRON - Mode Administrateur
echo ================================================
echo.
echo Ce script va demander les droits administrateur
echo pour pouvoir creer les liens symboliques necessaires.
echo.
pause

REM Vérifier si on est déjà admin
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Deja en mode administrateur, lancement du build...
    goto :build
)

REM Demander les droits admin
echo Demande des droits administrateur...
powershell -Command "Start-Process cmd -ArgumentList '/c cd /d %~dp0 && npm run build-win && pause' -Verb RunAs"

exit /b

:build
cd /d %~dp0
npm run build-win
pause
