import sys, os

# Ajoute le dossier parent au path pour que les imports fonctionnent
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import de l'application Flask
from app import app

# Handler Vercel : appelle l'app Flask
handler = app
