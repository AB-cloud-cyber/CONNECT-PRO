@echo off
title ConnectPro - Deploiement Vercel Automatique
chcp 65001 >nul
echo ============================================
echo   ConnectPro - Deploiement Vercel
echo ============================================
echo.

:: Etape 1 : Verifier les pre-requis
echo [1/6] Verification des pre-requis...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js non installe.
    echo   Telecharge-le sur https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=1" %%v in ('node --version') do echo       Node.js %%v OK

:: Etape 2 : Verifier Vercel CLI
echo [2/6] Verification de Vercel CLI...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo       Installation de Vercel CLI...
    npm install -g vercel >nul 2>&1
)
for /f "tokens=1" %%v in ('vercel --version') do echo       Vercel CLI %%v OK

:: Etape 3 : Login Vercel (interactif)
echo [3/6] Connexion a Vercel...
echo.
echo   IMPORTANT: Tu dois te connecter a Vercel.
echo   1. Un lien va s'ouvrir dans ton navigateur
echo   2. Connecte-toi avec GitHub/Google
echo   3. Autorise Vercel CLI
echo.
echo   Appuie sur une touche pour commencer...
pause >nul
vercel login
echo.

:: Etape 4 : Creer la base Neon
echo [4/6] Base de donnees cloud (Neon)...
echo.
echo   Cree ta base gratuite sur https://neon.tech
echo   Puis note les infos de connexion :
echo.
echo     Host:     _______________.aws.neon.tech
echo     Database: professionnel_db
echo     User:     flaskuser
echo     Password: _______________
echo.
echo   Appuie une fois que c'est fait...
pause >nul

:: Etape 5 : Initialiser la base cloud
echo [5/6] Initialisation de la base cloud...
echo.
echo   Tu dois maintenant copier les identifiants Neon.
echo.
set /p NEON_HOST="Host Neon        : "
set /p NEON_PASS="Mot de passe Neon : "
echo.

echo       Importation du schema et des donnees...
cd /d "%~dp0"
set PGPASSWORD=%NEON_PASS%
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h %NEON_HOST% -U flaskuser -d professionnel_db -f init_db.sql 2>&1
if %errorlevel% neq 0 (
    echo       Nouvel essai avec l'utilisateur postgres...
    "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h %NEON_HOST% -U postgres -d professionnel_db -f init_db.sql 2>&1
    if %errorlevel% neq 0 (
        echo [ERREUR] Impossible de se connecter a Neon.
        pause
        exit /b 1
    )
)
echo       Base initializee avec succes !

:: Accorder les droits
set PGPASSWORD=%NEON_PASS%
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h %NEON_HOST% -U postgres -d professionnel_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO flaskuser; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO flaskuser;" >nul 2>&1

:: Etape 6 : Configurer les variables Vercel
echo [6/6] Configuration des variables Vercel...
cd /d "%~dp0"
echo       Ajout de DB_HOST...
vercel env add DB_HOST <<< "%NEON_HOST%" >nul 2>&1
vercel env add DB_PORT <<< "5432" >nul 2>&1
vercel env add DB_NAME <<< "professionnel_db" >nul 2>&1
vercel env add DB_USER <<< "flaskuser" >nul 2>&1
vercel env add DB_PASSWORD <<< "%NEON_PASS%" >nul 2>&1
vercel env add SECRET_KEY <<< "connectpro-secret-key-%RANDOM%" >nul 2>&1
vercel env add FLASK_DEBUG <<< "false" >nul 2>&1
echo       Variables configurees !

:: Deploiement
echo.
echo ============================================
echo   Deploiement en cours...
echo ============================================
echo.
vercel --prod
if %errorlevel% == 0 (
    echo.
    echo ✅ Succes ! Ton app est en ligne.
) else (
    echo.
    echo ❌ Echec du deploiement. Verifie les erreurs ci-dessus.
)
pause
