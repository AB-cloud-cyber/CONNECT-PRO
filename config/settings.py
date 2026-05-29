"""
Configuration de la plateforme.
En production, lisez ces valeurs depuis des variables d'environnement.
"""

import os

# ── Sécurité Flask ──────────────────────────────────────────────────────────
SECRET_KEY = os.environ.get('SECRET_KEY', 'changez-cette-cle-en-production-xK9#mZ2@pL7')
DEBUG = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'

# ── Base de données PostgreSQL ──────────────────────────────────────────────
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_PORT = int(os.environ.get('DB_PORT', 5432))
DB_NAME = os.environ.get('DB_NAME', 'professionnel_db')
DB_USER = os.environ.get('DB_USER', 'flaskuser')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'votre_mot_de_passe_fort')

# ── Matching ────────────────────────────────────────────────────────────────
# Poids des critères (total conseillé = 100)
SCORE_SECTEUR_EXACT = 50        # secteur identique
SCORE_SECTEUR_PARTIEL = 20      # secteur partiellement similaire
SCORE_PAR_COMPETENCE = 10       # par compétence commune
SCORE_MEME_LOCALISATION = 15    # même ville / région
SCORE_MAX_COMPETENCES = 50      # plafond pour le score compétences

# ── Pagination ──────────────────────────────────────────────────────────────
PAR_PAGE = 10
