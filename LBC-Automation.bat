@echo off
REM ============================================
REM  LBC AUTOMATION - Lanceur Principal
REM ============================================

title LBC Automation

REM Verifier que Node.js portable existe
if not exist "node-portable\node.exe" (
    echo ================================================
    echo    ERREUR : Node.js portable non trouve
    echo ================================================
    echo.
    echo Le dossier "node-portable" est manquant ou incomplet.
    echo Veuillez verifier l'installation.
    echo.
    pause
    exit /b 1
)

REM Verifier que le code de l'application existe
if not exist "app\src\server.js" (
    echo ================================================
    echo    ERREUR : Application non trouvee
    echo ================================================
    echo.
    echo Le dossier "app" est manquant ou incomplet.
    echo Veuillez verifier l'installation.
    echo.
    pause
    exit /b 1
)

cls
echo ================================================
echo    LBC AUTOMATION
echo    Centralisation des emails Leboncoin
echo ================================================
echo.
echo Demarrage du serveur...
echo.
echo Une fois demarre, votre navigateur s'ouvrira
echo automatiquement sur http://localhost:3001
echo.
echo Pour arreter : Fermez simplement cette fenetre
echo ou appuyez sur Ctrl+C
echo.
echo ================================================
echo.

REM Attendre 2 secondes avant d'ouvrir le navigateur
timeout /t 2 /nobreak >nul

REM Ouvrir le navigateur automatiquement
start "" "http://localhost:3001"

REM Lancer l'application avec Node.js portable
cd app
..\node-portable\node.exe src\server.js

REM Si l'application s'arrete
echo.
echo L'application s'est arretee.
pause
