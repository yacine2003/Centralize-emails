@echo off
REM Script de Preparation du Build pour Windows
REM Ce script automatise les etapes de preparation avant de creer le .exe

echo ================================================
echo PREPARATION DU BUILD
echo ================================================
echo.

REM Verifier qu'on est a la racine du projet
if not exist "frontend" (
    echo Erreur: Ce script doit etre execute depuis la racine du projet
    exit /b 1
)
if not exist "backend" (
    echo Erreur: Ce script doit etre execute depuis la racine du projet
    exit /b 1
)

REM Etape 1 : Builder le frontend
echo Etape 1/3 : Build du frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Erreur lors du build du frontend
    exit /b 1
)
echo Build du frontend reussi
echo.

REM Etape 2 : Creer le dossier public dans backend
echo Etape 2/3 : Creation du dossier backend\public...
cd ..
if not exist "backend\public" mkdir backend\public
echo Dossier cree
echo.

REM Etape 3 : Copier le build vers backend/public
echo Etape 3/3 : Copie du build vers backend\public...
xcopy /E /Y frontend\build\* backend\public\
if %errorlevel% neq 0 (
    echo Erreur lors de la copie
    exit /b 1
)
echo Build copie avec succes
echo.

REM Verifier que service_account.json existe
if not exist "backend\service_account.json" (
    echo ATTENTION: service_account.json non trouve dans backend\
    echo Assurez-vous de l'ajouter avant de creer le .exe
    echo.
)

REM Afficher le resume
echo ================================================
echo PREPARATION TERMINEE
echo ================================================
echo.
echo Prochaines etapes :
echo.
echo 1. Tester l'application unifiee :
echo    cd backend ^&^& npm start
echo    Ouvrir: http://localhost:3001
echo.
echo 2. Creer le .exe :
echo    cd backend ^&^& npm run build
echo.
echo 3. Livrer le dossier backend\dist\ au client
echo.
pause
