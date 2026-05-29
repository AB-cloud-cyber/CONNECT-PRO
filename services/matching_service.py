"""
Service de matching intelligent.
Utilise Pandas, NumPy et une approche TF-IDF simplifiée + similarité cosinus
pour calculer les scores de compatibilité entre startups et chefs d'entreprise.
"""

import re
import math
import numpy as np
import pandas as pd
from psycopg2 import Error
from sqlalchemy import create_engine, text

from services.db_service import get_db_connection
from config.settings import (
    SCORE_SECTEUR_EXACT, SCORE_SECTEUR_PARTIEL,
    SCORE_PAR_COMPETENCE, SCORE_MEME_LOCALISATION, SCORE_MAX_COMPETENCES,
    DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
)


def _get_engine():
    """Cree un engine SQLAlchemy pour pandas."""
    url = f'postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=require'
    return create_engine(url)


# ─────────────────────────────────────────────
#  EXTRACTION DES DONNÉES
# ─────────────────────────────────────────────

def get_startups_df():
    """Charge toutes les startups dans un DataFrame Pandas."""
    try:
        engine = _get_engine()
        query = """
            SELECT id, nom_entreprise, secteur, description,
                   email_contact, localisation, competences_offertes
            FROM entreprises
        """
        df = pd.read_sql(query, engine)
        engine.dispose()
        return df
    except Exception as e:
        print(f"[matching] get_startups_df : {e}")
        return pd.DataFrame()


def get_leaders_df():
    """Charge tous les chefs d'entreprise dans un DataFrame Pandas."""
    try:
        engine = _get_engine()
        query = """
            SELECT id, nom_chef, prenom_chef, secteur_interet,
                   description_profil, email_contact, localisation,
                   budget_investissement, competences_recherchees
            FROM chefs_entreprise
        """
        df = pd.read_sql(query, engine)
        engine.dispose()
        return df
    except Exception as e:
        print(f"[matching] get_leaders_df : {e}")
        return pd.DataFrame()


# ─────────────────────────────────────────────
#  PRÉTRAITEMENT DES DONNÉES
# ─────────────────────────────────────────────

def _tokenize(text: str) -> list[str]:
    """Extrait les tokens significatifs d'une chaîne."""
    if not text:
        return []
    text = text.lower()
    # Supprime les caractères non alphanumériques sauf les espaces
    tokens = re.findall(r'\b[a-zàâäéèêëîïôöùûüç]{2,}\b', text)
    # Stopwords FR minimalistes
    stopwords = {'de', 'du', 'la', 'le', 'les', 'des', 'et', 'en', 'un',
                 'une', 'au', 'aux', 'par', 'sur', 'sous', 'dans', 'avec',
                 'pour', 'est', 'sont', 'a', 'the', 'of', 'and', 'or', 'in'}
    return [t for t in tokens if t not in stopwords]


def _preprocess_skills(series: pd.Series) -> pd.Series:
    """Convertit une série de chaînes de compétences en ensembles de tokens."""
    return series.fillna('').apply(
        lambda x: set(re.findall(r'\b\w+\b', x.lower()))
    )


def _preprocess_sector(series: pd.Series) -> pd.Series:
    """Normalise les secteurs."""
    return series.fillna('').str.lower().str.strip()


# ─────────────────────────────────────────────
#  SCORE TF-IDF COSINUS (texte description)
# ─────────────────────────────────────────────

def _build_vocab(docs: list[list[str]]) -> dict[str, int]:
    vocab = {}
    for doc in docs:
        for token in doc:
            if token not in vocab:
                vocab[token] = len(vocab)
    return vocab


def _tf_idf_vector(tokens: list[str], vocab: dict, idf: dict) -> np.ndarray:
    vec = np.zeros(len(vocab))
    tf = {}
    for t in tokens:
        tf[t] = tf.get(t, 0) + 1
    for t, count in tf.items():
        if t in vocab:
            vec[vocab[t]] = (count / len(tokens)) * idf.get(t, 0)
    return vec


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def _compute_description_similarity(desc1: str, desc2: str,
                                    vocab: dict, idf: dict) -> float:
    """Similarité cosinus TF-IDF entre deux textes descriptifs."""
    t1 = _tokenize(desc1 or '')
    t2 = _tokenize(desc2 or '')
    if not t1 or not t2:
        return 0.0
    v1 = _tf_idf_vector(t1, vocab, idf)
    v2 = _tf_idf_vector(t2, vocab, idf)
    return _cosine_similarity(v1, v2)


# ─────────────────────────────────────────────
#  ALGORITHME DE SCORING PRINCIPAL
# ─────────────────────────────────────────────

def _compute_score(startup: pd.Series, leader: pd.Series,
                   startup_skills: set, leader_skills: set,
                   vocab: dict, idf: dict) -> dict:
    """
    Calcule un score de compatibilité détaillé (0–100) entre une startup
    et un chef d'entreprise.

    Critères :
    ─────────
    1. Secteur (50 pts max)     — correspondance exacte ou partielle
    2. Compétences (30 pts max) — intersection des compétences
    3. Localisation (15 pts)    — même ville / région
    4. Description (5 pts max)  — similarité cosinus TF-IDF
    """
    details = {}

    # 1. Secteur ─────────────────────────────────────────────────────────────
    s_sector = str(startup.get('secteur', '')).lower().strip()
    l_sector = str(leader.get('secteur_interet', '')).lower().strip()

    if s_sector == l_sector:
        sector_score = SCORE_SECTEUR_EXACT
        details['secteur'] = f'Correspondance exacte ({s_sector})'
    elif s_sector and l_sector and (s_sector in l_sector or l_sector in s_sector):
        sector_score = SCORE_SECTEUR_PARTIEL
        details['secteur'] = f'Correspondance partielle ({s_sector} ↔ {l_sector})'
    else:
        sector_score = 0
        details['secteur'] = 'Aucune correspondance sectorielle'

    # 2. Compétences ─────────────────────────────────────────────────────────
    common = startup_skills.intersection(leader_skills)
    skill_score = min(len(common) * SCORE_PAR_COMPETENCE, SCORE_MAX_COMPETENCES)
    # On plafonnte à 30 dans la note finale
    skill_score = min(skill_score, 30)
    details['competences_communes'] = sorted(common)
    details['nb_competences'] = len(common)

    # 3. Localisation ────────────────────────────────────────────────────────
    s_loc = str(startup.get('localisation', '')).lower().strip()
    l_loc = str(leader.get('localisation', '')).lower().strip()
    if s_loc and l_loc and (s_loc in l_loc or l_loc in s_loc):
        loc_score = SCORE_MEME_LOCALISATION
        details['localisation'] = 'Même zone géographique'
    else:
        loc_score = 0
        details['localisation'] = 'Zones différentes'

    # 4. Descriptions (TF-IDF cosinus, max 5 pts) ────────────────────────────
    sim = _compute_description_similarity(
        startup.get('description', ''),
        leader.get('description_profil', ''),
        vocab, idf
    )
    desc_score = round(sim * 5, 2)
    details['similarite_description'] = round(sim * 100, 1)

    total = sector_score + skill_score + loc_score + desc_score
    # Normalise sur 100
    total = min(round(total, 2), 100)

    return {
        'score': total,
        'score_secteur': sector_score,
        'score_competences': skill_score,
        'score_localisation': loc_score,
        'score_description': desc_score,
        'details': details,
    }


# ─────────────────────────────────────────────
#  FONCTIONS PUBLIQUES
# ─────────────────────────────────────────────

def _build_idf(all_docs: list[list[str]]) -> dict:
    """Calcule l'IDF pour tous les tokens dans le corpus."""
    n = len(all_docs)
    df_count = {}
    for doc in all_docs:
        for token in set(doc):
            df_count[token] = df_count.get(token, 0) + 1
    return {t: math.log((n + 1) / (c + 1)) + 1 for t, c in df_count.items()}


def find_top_matches_for_leader(leader_id: int, num_matches: int = 10) -> list[dict]:
    """
    Retourne les `num_matches` startups les plus compatibles
    avec le chef d'entreprise identifié par `leader_id`.
    """
    startups_df = get_startups_df()
    leaders_df = get_leaders_df()

    if startups_df.empty or leaders_df.empty:
        return []

    target = leaders_df[leaders_df['id'] == leader_id]
    if target.empty:
        return []
    leader = target.iloc[0]

    # Prépare les compétences
    startups_df['_skills'] = _preprocess_skills(startups_df['competences_offertes'])
    leaders_df['_skills'] = _preprocess_skills(leaders_df['competences_recherchees'])
    leader_skills = leaders_df[leaders_df['id'] == leader_id]['_skills'].iloc[0]

    # Construit le vocabulaire TF-IDF sur toutes les descriptions
    all_docs = [
        _tokenize(t)
        for t in pd.concat([
            startups_df['description'].fillna(''),
            leaders_df['description_profil'].fillna(''),
        ])
    ]
    vocab = _build_vocab(all_docs)
    idf = _build_idf(all_docs)

    results = []
    for _, startup in startups_df.iterrows():
        s = _compute_score(startup, leader,
                           startup['_skills'], leader_skills,
                           vocab, idf)
        results.append({
            'startup_id': int(startup['id']),
            'nom_entreprise': startup['nom_entreprise'],
            'secteur': startup['secteur'],
            'description': startup.get('description', ''),
            'email_contact': startup.get('email_contact', ''),
            'localisation': startup.get('localisation', ''),
            'score': s['score'],
            'score_secteur': s['score_secteur'],
            'score_competences': s['score_competences'],
            'score_localisation': s['score_localisation'],
            'competences_communes': s['details']['competences_communes'],
            'nb_competences': s['details']['nb_competences'],
        })

    # Trie par score décroissant
    results_df = pd.DataFrame(results)
    if results_df.empty:
        return []
    top = (results_df
           .sort_values('score', ascending=False)
           .head(num_matches)
           .to_dict(orient='records'))
    return top


def find_top_matches_for_startup(startup_id: int, num_matches: int = 10) -> list[dict]:
    """
    Retourne les `num_matches` chefs d'entreprise les plus compatibles
    avec la startup identifiée par `startup_id`.
    """
    startups_df = get_startups_df()
    leaders_df = get_leaders_df()

    if startups_df.empty or leaders_df.empty:
        return []

    target = startups_df[startups_df['id'] == startup_id]
    if target.empty:
        return []
    startup = target.iloc[0]

    startups_df['_skills'] = _preprocess_skills(startups_df['competences_offertes'])
    leaders_df['_skills'] = _preprocess_skills(leaders_df['competences_recherchees'])
    startup_skills = startups_df[startups_df['id'] == startup_id]['_skills'].iloc[0]

    all_docs = [
        _tokenize(t)
        for t in pd.concat([
            startups_df['description'].fillna(''),
            leaders_df['description_profil'].fillna(''),
        ])
    ]
    vocab = _build_vocab(all_docs)
    idf = _build_idf(all_docs)

    results = []
    for _, leader in leaders_df.iterrows():
        s = _compute_score(startup, leader,
                           startup_skills, leader['_skills'],
                           vocab, idf)
        results.append({
            'chef_id': int(leader['id']),
            'nom_complet': f"{leader['prenom_chef']} {leader['nom_chef']}",
            'secteur_interet': leader['secteur_interet'],
            'description_profil': leader.get('description_profil', ''),
            'email_contact': leader.get('email_contact', ''),
            'localisation': leader.get('localisation', ''),
            'budget_investissement': leader.get('budget_investissement', ''),
            'score': s['score'],
            'score_secteur': s['score_secteur'],
            'score_competences': s['score_competences'],
            'score_localisation': s['score_localisation'],
            'competences_communes': s['details']['competences_communes'],
            'nb_competences': s['details']['nb_competences'],
        })

    results_df = pd.DataFrame(results)
    if results_df.empty:
        return []
    top = (results_df
           .sort_values('score', ascending=False)
           .head(num_matches)
           .to_dict(orient='records'))
    return top
