-- ═══════════════════════════════════════════════════════════════
-- ConnectPro — Script d'initialisation PostgreSQL
-- À exécuter avec : psql -U postgres -f init_db.sql
-- ═══════════════════════════════════════════════════════════════

-- 1. Créer l'utilisateur applicatif
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'flaskuser') THEN
    CREATE USER flaskuser WITH PASSWORD 'votre_mot_de_passe_fort';
  END IF;
END
$$;

-- 2. Créer la base de données
SELECT 'CREATE DATABASE professionnel_db OWNER flaskuser'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'professionnel_db')\gexec

-- 3. Accorder les privilèges
GRANT ALL PRIVILEGES ON DATABASE professionnel_db TO flaskuser;

-- ── Connexion à la base et création des tables ───────────────
\c professionnel_db

-- Table des startups / entreprises
CREATE TABLE IF NOT EXISTS entreprises (
    id                   SERIAL PRIMARY KEY,
    nom_entreprise       VARCHAR(255) NOT NULL,
    secteur              VARCHAR(255) NOT NULL,
    description          TEXT,
    email_contact        VARCHAR(255) UNIQUE NOT NULL,
    site_web             VARCHAR(500),
    localisation         VARCHAR(255),
    taille               VARCHAR(50),
    annee_creation       INTEGER,
    competences_offertes TEXT,
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
    budget_investissement   VARCHAR(100),
    competences_recherchees TEXT,
    date_enregistrement     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des mises en relation
CREATE TABLE IF NOT EXISTS mises_en_relation (
    id              SERIAL PRIMARY KEY,
    entreprise_id   INTEGER REFERENCES entreprises(id) ON DELETE CASCADE,
    chef_id         INTEGER REFERENCES chefs_entreprise(id) ON DELETE CASCADE,
    score           NUMERIC(5,2),
    statut          VARCHAR(50) DEFAULT 'en_attente',
    date_creation   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (entreprise_id, chef_id)
);

-- Données de démonstration — Startups
INSERT INTO entreprises (nom_entreprise, secteur, description, email_contact, localisation, taille, annee_creation, competences_offertes)
VALUES
('TechInnov SARL', 'IA & Machine Learning',
 'Nous développons des solutions d''intelligence artificielle pour optimiser les processus industriels en Afrique centrale.',
 'contact@techinnov.cm', 'Douala, Cameroun', 'Micro (1–9)', 2021,
 'IA, Python, Machine Learning, Data Science, API REST'),
('GreenPay Fintech', 'Fintech',
 'Solution de paiement mobile adaptée aux marchés non-bancarisés d''Afrique subsaharienne.',
 'hello@greenpay.africa', 'Yaoundé, Cameroun', 'Petite (10–49)', 2020,
 'Fintech, Blockchain, Mobile Money, Sécurité, UX Design'),
('AgroSmart', 'Agriculture',
 'Plateforme IoT et data analytics pour aider les agriculteurs à optimiser leurs rendements.',
 'info@agrosmart.cm', 'Bafoussam, Cameroun', 'Micro (1–9)', 2022,
 'IoT, Agriculture, Python, Data Analytics, Capteurs'),
('EduTech Africa', 'Éducation',
 'Cours en ligne et contenus pédagogiques pour les zones à faible connectivité.',
 'contact@edutech.africa', 'Douala, Cameroun', 'Petite (10–49)', 2019,
 'E-learning, Pédagogie, Mobile App, Flutter, Contenu Éducatif'),
('LogiConnect', 'Logistique',
 'Optimisation de la chaîne logistique last-mile en Afrique avec tracking en temps réel.',
 'ops@logiconnect.cm', 'Douala, Cameroun', 'Petite (10–49)', 2021,
 'Logistique, GPS, Mobile, API, Supply Chain, Python')
ON CONFLICT (email_contact) DO NOTHING;

-- Données de démonstration — Chefs d'entreprise
INSERT INTO chefs_entreprise (nom_chef, prenom_chef, secteur_interet, description_profil, email_contact, localisation, budget_investissement, competences_recherchees)
VALUES
('Mbarga', 'Paul', 'IA & Machine Learning',
 'Investisseur en capital-risque passionné par les technologies émergentes. 15 ans d''expérience dans le secteur technologique africain.',
 'p.mbarga@invest.cm', 'Douala, Cameroun', '100k–500k EUR',
 'IA, Machine Learning, Python, Scalabilité, B2B'),
('Fotso', 'Marie', 'Fintech',
 'Directrice financière d''une grande banque cherchant à investir dans des solutions fintech innovantes.',
 'm.fotso@banque.cm', 'Yaoundé, Cameroun', '200k–1M EUR',
 'Fintech, Mobile Money, Conformité Réglementaire, API Bancaire'),
('Nkeng', 'Eric', 'Agriculture',
 'Agro-entrepreneur à la recherche de technologies pour moderniser ses exploitations.',
 'e.nkeng@agro.cm', 'Bafoussam, Cameroun', '50k–150k EUR',
 'IoT, Agriculture, Data Analytics, Capteurs, Rendement'),
('Biya', 'Sophie', 'Éducation',
 'Experte en politique éducative, cherche à financer des solutions innovantes pour l''accès à l''éducation.',
 's.biya@edu.org', 'Douala, Cameroun', '30k–100k EUR',
 'E-learning, Contenu Pédagogique, Mobile, Accès Rural')
ON CONFLICT (email_contact) DO NOTHING;

\echo '✅ Base de données initialisée avec succès !'
