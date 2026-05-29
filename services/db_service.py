"""
Service de connexion et d'initialisation de la base de données PostgreSQL.
"""

import psycopg2
from psycopg2 import Error
from config.settings import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD


def get_db_connection():
    """Retourne une connexion psycopg2 ou None en cas d'erreur."""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            sslmode='require',
        )
        return conn
    except Error as e:
        print(f"[DB] Erreur de connexion : {e}")
        return None


def init_db():
    """
    Crée les tables si elles n'existent pas encore.
    Idempotent : peut être appelée plusieurs fois sans danger.
    """
    sql_create = """
    -- Table des startups / entreprises
    CREATE TABLE IF NOT EXISTS entreprises (
        id                   SERIAL PRIMARY KEY,
        nom_entreprise       VARCHAR(255) NOT NULL,
        secteur              VARCHAR(255) NOT NULL,
        description          TEXT,
        email_contact        VARCHAR(255) UNIQUE NOT NULL,
        site_web             VARCHAR(500),
        localisation         VARCHAR(255),
        taille               VARCHAR(50),          -- micro / petite / moyenne / grande
        annee_creation       INTEGER,
        competences_offertes TEXT,                 -- ex: "IA, Python, Marketing Digital"
        date_enregistrement  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des chefs d'entreprise / investisseurs
    CREATE TABLE IF NOT EXISTS chefs_entreprise (
        id                      SERIAL PRIMARY KEY,
        nom_chef                VARCHAR(255) NOT NULL,
        prenom_chef             VARCHAR(255) NOT NULL,
        secteur_interet         VARCHAR(255) NOT NULL,
        description_profil      TEXT,
        email_contact           VARCHAR(255) UNIQUE NOT NULL,
        telephone               VARCHAR(50),
        localisation            VARCHAR(255),
        budget_investissement   VARCHAR(100),       -- ex: "50k-200k EUR"
        competences_recherchees TEXT,              -- ex: "IA, Gestion de Projet"
        date_enregistrement     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des mises en relation (historique des matchs acceptés)
    CREATE TABLE IF NOT EXISTS mises_en_relation (
        id              SERIAL PRIMARY KEY,
        entreprise_id   INTEGER REFERENCES entreprises(id) ON DELETE CASCADE,
        chef_id         INTEGER REFERENCES chefs_entreprise(id) ON DELETE CASCADE,
        score           NUMERIC(5,2),
        statut          VARCHAR(50) DEFAULT 'en_attente', -- en_attente / accepté / refusé
        date_creation   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (entreprise_id, chef_id)
    );
    """

    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute(sql_create)
            conn.commit()
            cur.close()
            print("[DB] Tables initialisées avec succès.")
        except Error as e:
            print(f"[DB] Erreur lors de l'initialisation : {e}")
            conn.rollback()
        finally:
            conn.close()
    else:
        print("[DB] Impossible d'initialiser la base de données (connexion échouée).")
