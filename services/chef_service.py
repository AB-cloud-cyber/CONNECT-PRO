"""
Service CRUD pour les chefs d'entreprise / investisseurs.
"""

from psycopg2 import Error
from services.db_service import get_db_connection


def _row_to_dict(cursor, row):
    cols = [desc[0] for desc in cursor.description]
    return dict(zip(cols, row))


def get_all_chefs():
    conn = get_db_connection()
    if not conn:
        return []
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, nom_chef, prenom_chef, secteur_interet, description_profil,
                   email_contact, telephone, localisation, budget_investissement,
                   competences_recherchees, date_enregistrement
            FROM chefs_entreprise
            ORDER BY date_enregistrement DESC
        """)
        rows = cur.fetchall()
        return [_row_to_dict(cur, r) for r in rows]
    except Error as e:
        print(f"[chef_service] get_all : {e}")
        return []
    finally:
        cur.close()
        conn.close()


def get_chef_by_id(cid):
    conn = get_db_connection()
    if not conn:
        return None
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, nom_chef, prenom_chef, secteur_interet, description_profil,
                   email_contact, telephone, localisation, budget_investissement,
                   competences_recherchees, date_enregistrement
            FROM chefs_entreprise WHERE id = %s
        """, (cid,))
        row = cur.fetchone()
        return _row_to_dict(cur, row) if row else None
    except Error as e:
        print(f"[chef_service] get_by_id : {e}")
        return None
    finally:
        cur.close()
        conn.close()


def insert_chef(data):
    conn = get_db_connection()
    if not conn:
        return False, "Connexion à la base de données impossible."
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO chefs_entreprise
                (nom_chef, prenom_chef, secteur_interet, description_profil,
                 email_contact, telephone, localisation, budget_investissement,
                 competences_recherchees)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['nom_chef'], data['prenom_chef'], data['secteur_interet'],
            data.get('description_profil'), data['email_contact'],
            data.get('telephone'), data.get('localisation'),
            data.get('budget_investissement'), data.get('competences_recherchees'),
        ))
        conn.commit()
        return True, f"Profil de {data['prenom_chef']} {data['nom_chef']} créé avec succès !"
    except Error as e:
        conn.rollback()
        if 'unique' in str(e).lower():
            return False, "Cet email est déjà utilisé."
        return False, f"Erreur lors de l'enregistrement : {e}"
    finally:
        cur.close()
        conn.close()


def update_chef(data):
    conn = get_db_connection()
    if not conn:
        return False, "Connexion à la base de données impossible."
    try:
        cur = conn.cursor()
        cur.execute("""
            UPDATE chefs_entreprise SET
                nom_chef                = %s,
                prenom_chef             = %s,
                secteur_interet         = %s,
                description_profil      = %s,
                email_contact           = %s,
                telephone               = %s,
                localisation            = %s,
                budget_investissement   = %s,
                competences_recherchees = %s
            WHERE id = %s
        """, (
            data['nom_chef'], data['prenom_chef'], data['secteur_interet'],
            data.get('description_profil'), data['email_contact'],
            data.get('telephone'), data.get('localisation'),
            data.get('budget_investissement'), data.get('competences_recherchees'),
            data['id'],
        ))
        conn.commit()
        return True, "Profil mis à jour avec succès !"
    except Error as e:
        conn.rollback()
        return False, f"Erreur lors de la mise à jour : {e}"
    finally:
        cur.close()
        conn.close()


def delete_chef(cid):
    conn = get_db_connection()
    if not conn:
        return False, "Connexion à la base de données impossible."
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM chefs_entreprise WHERE id = %s", (cid,))
        conn.commit()
        return True, "Profil supprimé avec succès."
    except Error as e:
        conn.rollback()
        return False, f"Erreur lors de la suppression : {e}"
    finally:
        cur.close()
        conn.close()
