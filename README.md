<div align="center">
  <h1>â—ˆ ConnectPro</h1>
  <p><strong>Plateforme de Matching Intelligent â€” Startups & Investisseurs</strong></p>
  <p>Algorithme TF-IDF + similaritÃ© cosinus pour connecter les bonnes personnes aux bonnes startups en Afrique.</p>
  <br>
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAB-cloud-cyber%2Fconnectpro&env=DB_HOST,DB_PORT,DB_NAME,DB_USER,DB_PASSWORD,SECRET_KEY&project-name=connectpro&repository-name=connectpro">
    <img src="https://vercel.com/button" alt="Deploy to Vercel">
  </a>
</div>

---

## âœ¨ FonctionnalitÃ©s

- **Dashboard interactif** â€” Vue globale des startups, investisseurs et matchs
- **Matching intelligent** â€” Score de compatibilitÃ© basÃ© sur secteur, compÃ©tences, localisation et description
- **Interface React** â€” SPA moderne et rÃ©active
- **API REST** â€” 7 endpoints pour intÃ©gration externe
- **PWA** â€” Installable sur Android et PC comme une application native

## ðŸš€ DÃ©ploiement

### PrÃ©requis
1. [Compte Vercel](https://vercel.com) (gratuit)
2. [Base PostgreSQL](https://neon.tech) (gratuit)

### 1 clic
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAB-cloud-cyber%2Fconnectpro&env=DB_HOST,DB_PORT,DB_NAME,DB_USER,DB_PASSWORD,SECRET_KEY&project-name=connectpro&repository-name=connectpro)

### Manuel
```bash
# Cloner
git clone https://github.com/AB-cloud-cyber/connectpro.git
cd connectpro

# Configurer les variables d'environnement
cp .env.example .env
# Ã‰diter .env avec vos identifiants Neon/PostgreSQL

# DÃ©ployer sur Vercel
vercel --prod
```

## ðŸ› ï¸ Stack Technique

- **Backend** : Python / Flask
- **Frontend** : React 18 (CDN, sans build)
- **Base de donnÃ©es** : PostgreSQL (via Neon)
- **Matching** : TF-IDF + similaritÃ© cosinus (NumPy)
- **HÃ©bergement** : Vercel (serverless)

## ðŸ“Š API Endpoints

| Route | Description |
|-------|-------------|
| `GET /api/stats` | Statistiques globales |
| `GET /api/entreprises` | Liste des startups |
| `GET /api/entreprises/<id>` | DÃ©tail d'une startup |
| `GET /api/chefs` | Liste des investisseurs |
| `GET /api/chefs/<id>` | DÃ©tail d'un investisseur |
| `GET /api/match/startup/<id>` | Matchs pour une startup |
| `GET /api/match/chef/<id>` | Matchs pour un investisseur |

## ðŸ“ Licence

MIT

