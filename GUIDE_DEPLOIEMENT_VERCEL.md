# GUIDE DE DEPLOIEMENT — ConnectPro sur Vercel

---

## Étape 1 : Créer la base de données cloud (Neon)

> **Ouvre** https://neon.tech dans ton navigateur

| Action | Capture d'écran |
|---|---|
| Clique **"Sign Up"** | ![Sign Up] |
| Choisis **"Continue with GitHub"** ou **Google** | ![OAuth] |
| Dans le dashboard, clique **"Create Project"** | ![New Project] |
| **Name**: `connectpro` — **Region**: la plus proche de toi | ![Project Config] |
| Clique **"Create Project"** | ![Create] |

**Après création**, tu verras un écran avec les identifiants :

```
Host: ep-demo-123456.us-east-2.aws.neon.tech
Database: professionnel_db
User: flaskuser
Password: xxxxxxxxxxxxxxxx
```

➡ **COPIE CES INFORMATIONS** dans un bloc-notes.

---

## Étape 2 : Initialiser la base cloud

> Ouvre **PowerShell** en tant qu'utilisateur normal

```powershell
cd "C:\Users\ABOU SERVICE\Downloads\plateforme_matching"

$env:PGPASSWORD="TON_MOT_DE_PASSE_NEON"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h ep-xxx.aws.neon.tech -U flaskuser -d professionnel_db -f init_db.sql
```

**Résultat attendu :**
```
CREATE TABLE
CREATE TABLE
CREATE TABLE
INSERT 0 5
INSERT 0 4
✅ Base de données initialisée avec succès !
```

---

## Étape 3 : Installer Vercel CLI

> Si pas déjà fait, ouvre **PowerShell en Administrateur** :

```powershell
npm install -g vercel
```

**Vérification :**
```powershell
vercel --version
```
> Résultat : `Vercel CLI 54.4.1`

---

## Étape 4 : Connecter Vercel CLI

```powershell
cd "C:\Users\ABOU SERVICE\Downloads\plateforme_matching"
vercel login
```

| Capture |
|---|
| ![Terminal: vercel login] |
| ![Browser: code SBRL-LLNF] |
| ![Clique "Authorize"] |
| ![Terminal: "Success!"] |

**Ce qui se passe :**
1. Un lien s'affiche dans le terminal
2. Ton navigateur s'ouvre avec un code
3. Connecte-toi avec **GitHub**
4. Clique **"Authorize"**
5. Retourne au terminal → "✅ Success!"

---

## Étape 5 : Configurer les variables d'environnement

```powershell
cd "C:\Users\ABOU SERVICE\Downloads\plateforme_matching"

vercel env add DB_HOST
```
➡ Colle ton host Neon (ex: `ep-xxx.aws.neon.tech`) → Enter → `y`

```powershell
vercel env add DB_PORT
```
➡ `5432` → Enter → `y`

```powershell
vercel env add DB_NAME
```
➡ `professionnel_db` → Enter → `y`

```powershell
vercel env add DB_USER
```
➡ `flaskuser` → Enter → `y`

```powershell
vercel env add DB_PASSWORD
```
➡ Ton mot de passe Neon → Enter → `y`

```powershell
vercel env add SECRET_KEY
```
➡ Une chaîne aléatoire (ex: `cp-secret-2026-xk9mZ2pL7`) → Enter → `y`

```powershell
vercel env add FLASK_DEBUG
```
➡ `false` → Enter → `y`

| Capture d'écran |
|---|
| ![vercel env add DB_HOST] |
| ![Saisie de la valeur] |
| ![Confirmation: Production] |
| ![Toutes les variables ajoutées] |

---

## Étape 6 : Déployer !

```powershell
vercel --prod
```

**Questions Vercel :**

| Question | Réponse |
|---|---|
| Set up and deploy? | `Y` |
| Scope ? | Sélectionne ton compte |
| Link to existing project? | `N` |
| Project name? | `connectpro` (Enter) |
| Directory? | `./` (Enter) |
| Override settings? | `N` |

**Résultat attendu :**
```
✅  Production: https://connectpro.vercel.app [1s]
   Linked to connectpro-xxxxx.vercel.app
   Build completed successfully!
```

---

## Étape 7 : Vérifier le déploiement

| URL | Résultat attendu |
|---|---|
| https://connectpro.vercel.app | Page d'accueil Flask |
| https://connectpro.vercel.app/react | Interface React SPA |
| https://connectpro.vercel.app/api/stats | JSON des stats |
| https://connectpro.vercel.app/api/entreprises | JSON des startups |
| https://connectpro.vercel.app/api/chefs | JSON des chefs |
| https://connectpro.vercel.app/api/matches/chef/1 | JSON des matchs |

---

## Dépannage

### ❌ "Application Error" sur Vercel
```powershell
vercel logs connectpro
```

### ❌ "Role 'flaskuser' does not exist"
```powershell
psql -h ep-xxx.aws.neon.tech -U postgres -d professionnel_db -c "CREATE USER flaskuser WITH PASSWORD '...';"
```

### ❌ "Connection refused" Neon
➡ Vérifie dans Neon Dashboard que la base n'est pas en veille (Neon met en pause après 5min d'inactivité en gratuit)

### ❌ Erreur de build Vercel
```powershell
vercel build --prod
```
Regarde la sortie pour trouver l'erreur exacte.

---

## Fichiers du déploiement

```
plateforme_matching/
├── vercel.json              # Configuration Vercel
├── .vercelignore            # Fichiers ignores
├── .env.example             # Template variables
├── api/
│   ├── index.py             # Point d'entrée serverless
│   └── requirements.txt     # Dependances Vercel
├── app.py                   # Application Flask (19 routes)
├── config/settings.py       # Configuration (env vars)
├── services/                # Services (DB, matching, CRUD)
├── templates/               # Templates Flask + React
│   └── react_index.html     # React SPA (17 KB)
├── static/js/react_app.js   # Composants React (24 KB)
├── init_db.sql              # Schema + donnees demo
├── deploy.bat               # Script de deploiement automatique
└── GUIDE_DEPLOIEMENT_VERCEL.md  # Ce guide
```

---
