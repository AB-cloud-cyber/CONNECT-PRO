"""
Service CRUD pour les entreprises / startups.
"""

from psycopg2 import Error
from services.db_service import get_db_connection


def _row_to_dict(cursor, row):
    """Convertit une ligne de résultat en dictionnaire."""
    cols = [desc[0] for desc in cursor.description]
    return dict(zip(cols, row))


def get_all_entreprises():
    conn = get_db_connection()
    if not conn:
        return []
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, nom_entreprise, secteur, description,
                   email_contact, site_web, localisation, taille,
                   annee_creation, competences_offertes, date_enregistrement
            FROM entreprises
            ORDER BY date_enregistrement DESC
        """)
        rows = cur.fetchall()
        return [_row_to_dict(cur, r) for r in rows]
    except Error as e:
        print(f"[entreprise_service] get_all : {e}")
        return []
    finally:
        cur.close()
        conn.close()


def get_entreprise_by_id(eid):
    conn = get_db_connection()
    if not conn:
        return None
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, nom_entreprise, secteur, description,
                   email_contact, site_web, localisation, taille,
                   annee_creation, competences_offertes, date_enregistrement
            FROM entreprises WHERE id = %s
        """, (eid,))
        row = cur.fetchone()
        return _row_to_dict(cur, row) if row else None
    except Error as e:
        print(f"[entreprise_service] get_by_id : {e}")
        return None
    finally:
        cur.close()
        conn.close()


def insert_entreprise(data):
    conn = get_db_connection()
    if not conn:
        return False, "Connexion à la base de données impossible."
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO entreprises
                (nom_entreprise, secteur, description, email_contact,
                 site_web, localisation, taille, annee_creation, competences_offertes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['nom_entreprise'], data['secteur'], data['description'],
            data['email_contact'], data.get('site_web'), data.get('localisation'),
            data.get('taille'), data.get('annee_creation'), data.get('competences_offertes'),
        ))
        conn.commit()
        return True, f"Entreprise « {data['nom_entreprise']} » enregistrée avec succès !"
    except Error as e:
        conn.rollback()
        if 'unique' in str(e).lower():
            return False, "Cet email est déjà utilisé par une autre entreprise."
        return False, f"Erreur lors de l'enregistrement : {e}"
    finally:
        cur.close()
        conn.close()


def update_entreprise(data):
    conn = get_db_connection()
    if not conn:
        return False, "Connexion à la base de données impossible."
    try:
        cur = conn.cursor()
        cur.execute("""
            UPDATE entreprises SET
                nom_entreprise      = %s,
                secteur             = %s,
                description         = %s,
                email_contact       = %s,
                site_web            = %s,
                localisation        = %s,
                taille              = %s,
                annee_creation      = %s,
                competences_offertes = %s
            WHERE id = %s
        """, (
            data['nom_entreprise'], data['secteur'], data['description'],
            data['email_contact'], data.get('site_web'), data.get('localisation'),
            data.get('taille'), data.get('annee_creation'),
            data.get('competences_offertes'), data['id'],
        ))
        conn.commit()
        return True, "Profil mis à jour avec succès !"
    except Error as e:
        conn.rollback()
        return False, f"Erreur lors de la mise à jour : {e}"
    finally:
        cur.close()
        conn.close()


def delete_entreprise(eid):
    conn = get_db_connection()
    if not conn:
        return False, "Connexion à la base de données impossible."
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM entreprises WHERE id = %s", (eid,))
        conn.commit()
        return True, "Entreprise supprimée avec succès."
    except Error as e:
        conn.rollback()
        return False, f"Erreur lors de la suppression : {e}"
    finally:
        cur.close()
        conn.close()
