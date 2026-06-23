"""
Plateforme de Mise en Relation Professionnelle
Application Flask principale
"""

from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, Response, stream_with_context
import time
import json
from psycopg2 import Error

from config.settings import SECRET_KEY, DEBUG
from services.db_service import get_db_connection, init_db
from services.matching_service import find_top_matches_for_leader, find_top_matches_for_startup
from services.entreprise_service import (
    get_all_entreprises, get_entreprise_by_id,
    insert_entreprise, update_entreprise, delete_entreprise
)
from services.chef_service import (
    get_all_chefs, get_chef_by_id,
    insert_chef, update_chef, delete_chef
)

app = Flask(__name__)
app.secret_key = SECRET_KEY


# ─────────────────────────────────────────────
#  INITIALISATION
# ─────────────────────────────────────────────

@app.before_request
def setup():
    """Initialise la base de données au premier démarrage."""
    pass


# ─────────────────────────────────────────────
#  PAGE D'ACCUEIL
# ─────────────────────────────────────────────

@app.route('/')
def index():
    conn = get_db_connection()
    stats = {'nb_startups': 0, 'nb_chefs': 0, 'nb_matchs': 0}
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM entreprises")
            stats['nb_startups'] = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM chefs_entreprise")
            stats['nb_chefs'] = cur.fetchone()[0]
            stats['nb_matchs'] = stats['nb_startups'] * stats['nb_chefs']
            cur.close()
        except Exception:
            pass
        finally:
            conn.close()
    return render_template('index.html', stats=stats)


# ─────────────────────────────────────────────
#  ENTREPRISES (STARTUPS)
# ─────────────────────────────────────────────

@app.route('/entreprises')
def liste_entreprises():
    entreprises = get_all_entreprises()
    return render_template('entreprises/liste.html', entreprises=entreprises)


@app.route('/entreprises/nouvelle', methods=['GET', 'POST'])
def nouvelle_entreprise():
    if request.method == 'POST':
        data = {
            'nom_entreprise': request.form.get('nom_entreprise', '').strip(),
            'secteur': request.form.get('secteur', '').strip(),
            'description': request.form.get('description', '').strip(),
            'email_contact': request.form.get('email_contact', '').strip(),
            'site_web': request.form.get('site_web', '').strip(),
            'localisation': request.form.get('localisation', '').strip(),
            'taille': request.form.get('taille', '').strip(),
            'annee_creation': request.form.get('annee_creation', '').strip() or None,
            'competences_offertes': request.form.get('competences_offertes', '').strip(),
        }
        if not data['nom_entreprise'] or not data['secteur'] or not data['email_contact']:
            flash('Les champs Nom, Secteur et Email sont obligatoires.', 'error')
            return render_template('entreprises/formulaire.html', entreprise=data, mode='creation')

        success, msg = insert_entreprise(data)
        flash(msg, 'success' if success else 'error')
        if success:
            return redirect(url_for('liste_entreprises'))
        return render_template('entreprises/formulaire.html', entreprise=data, mode='creation')

    return render_template('entreprises/formulaire.html', entreprise={}, mode='creation')


@app.route('/entreprises/<int:eid>')
def detail_entreprise(eid):
    entreprise = get_entreprise_by_id(eid)
    if not entreprise:
        flash("Entreprise introuvable.", 'error')
        return redirect(url_for('liste_entreprises'))
    matches = find_top_matches_for_startup(eid, num_matches=3)
    return render_template('entreprises/detail.html', entreprise=entreprise, matches=matches)


@app.route('/entreprises/<int:eid>/modifier', methods=['GET', 'POST'])
def modifier_entreprise(eid):
    entreprise = get_entreprise_by_id(eid)
    if not entreprise:
        flash("Entreprise introuvable.", 'error')
        return redirect(url_for('liste_entreprises'))

    if request.method == 'POST':
        data = {
            'id': eid,
            'nom_entreprise': request.form.get('nom_entreprise', '').strip(),
            'secteur': request.form.get('secteur', '').strip(),
            'description': request.form.get('description', '').strip(),
            'email_contact': request.form.get('email_contact', '').strip(),
            'site_web': request.form.get('site_web', '').strip(),
            'localisation': request.form.get('localisation', '').strip(),
            'taille': request.form.get('taille', '').strip(),
            'annee_creation': request.form.get('annee_creation', '').strip() or None,
            'competences_offertes': request.form.get('competences_offertes', '').strip(),
        }
        success, msg = update_entreprise(data)
        flash(msg, 'success' if success else 'error')
        if success:
            return redirect(url_for('detail_entreprise', eid=eid))
        return render_template('entreprises/formulaire.html', entreprise=data, mode='edition')

    return render_template('entreprises/formulaire.html', entreprise=entreprise, mode='edition')


@app.route('/entreprises/<int:eid>/supprimer', methods=['POST'])
def supprimer_entreprise(eid):
    success, msg = delete_entreprise(eid)
    flash(msg, 'success' if success else 'error')
    return redirect(url_for('liste_entreprises'))


# ─────────────────────────────────────────────
#  CHEFS D'ENTREPRISE
# ─────────────────────────────────────────────

@app.route('/chefs')
def liste_chefs():
    chefs = get_all_chefs()
    return render_template('chefs/liste.html', chefs=chefs)


@app.route('/chefs/nouveau', methods=['GET', 'POST'])
def nouveau_chef():
    if request.method == 'POST':
        data = {
            'nom_chef': request.form.get('nom_chef', '').strip(),
            'prenom_chef': request.form.get('prenom_chef', '').strip(),
            'secteur_interet': request.form.get('secteur_interet', '').strip(),
            'description_profil': request.form.get('description_profil', '').strip(),
            'email_contact': request.form.get('email_contact', '').strip(),
            'telephone': request.form.get('telephone', '').strip(),
            'localisation': request.form.get('localisation', '').strip(),
            'budget_investissement': request.form.get('budget_investissement', '').strip(),
            'competences_recherchees': request.form.get('competences_recherchees', '').strip(),
        }
        if not data['nom_chef'] or not data['secteur_interet'] or not data['email_contact']:
            flash('Les champs Nom, Secteur d\'intérêt et Email sont obligatoires.', 'error')
            return render_template('chefs/formulaire.html', chef=data, mode='creation')

        success, msg = insert_chef(data)
        flash(msg, 'success' if success else 'error')
        if success:
            return redirect(url_for('liste_chefs'))
        return render_template('chefs/formulaire.html', chef=data, mode='creation')

    return render_template('chefs/formulaire.html', chef={}, mode='creation')


@app.route('/chefs/<int:cid>')
def detail_chef(cid):
    chef = get_chef_by_id(cid)
    if not chef:
        flash("Chef d'entreprise introuvable.", 'error')
        return redirect(url_for('liste_chefs'))
    matches = find_top_matches_for_leader(cid, num_matches=5)
    return render_template('chefs/detail.html', chef=chef, matches=matches)


@app.route('/chefs/<int:cid>/modifier', methods=['GET', 'POST'])
def modifier_chef(cid):
    chef = get_chef_by_id(cid)
    if not chef:
        flash("Chef d'entreprise introuvable.", 'error')
        return redirect(url_for('liste_chefs'))

    if request.method == 'POST':
        data = {
            'id': cid,
            'nom_chef': request.form.get('nom_chef', '').strip(),
            'prenom_chef': request.form.get('prenom_chef', '').strip(),
            'secteur_interet': request.form.get('secteur_interet', '').strip(),
            'description_profil': request.form.get('description_profil', '').strip(),
            'email_contact': request.form.get('email_contact', '').strip(),
            'telephone': request.form.get('telephone', '').strip(),
            'localisation': request.form.get('localisation', '').strip(),
            'budget_investissement': request.form.get('budget_investissement', '').strip(),
            'competences_recherchees': request.form.get('competences_recherchees', '').strip(),
        }
        success, msg = update_chef(data)
        flash(msg, 'success' if success else 'error')
        if success:
            return redirect(url_for('detail_chef', cid=cid))
        return render_template('chefs/formulaire.html', chef=data, mode='edition')

    return render_template('chefs/formulaire.html', chef=chef, mode='edition')


@app.route('/chefs/<int:cid>/supprimer', methods=['POST'])
def supprimer_chef(cid):
    success, msg = delete_chef(cid)
    flash(msg, 'success' if success else 'error')
    return redirect(url_for('liste_chefs'))


# ─────────────────────────────────────────────
#  MATCHING
# ─────────────────────────────────────────────

@app.route('/matching')
def matching_dashboard():
    chefs = get_all_chefs()
    entreprises = get_all_entreprises()
    return render_template('matching/dashboard.html', chefs=chefs, entreprises=entreprises)


@app.route('/matching/chef/<int:cid>')
def matching_chef(cid):
    chef = get_chef_by_id(cid)
    if not chef:
        flash("Chef d'entreprise introuvable.", 'error')
        return redirect(url_for('matching_dashboard'))
    matches = find_top_matches_for_leader(cid, num_matches=10)
    return render_template('matching/resultats_chef.html', chef=chef, matches=matches)


@app.route('/matching/startup/<int:eid>')
def matching_startup(eid):
    entreprise = get_entreprise_by_id(eid)
    if not entreprise:
        flash("Entreprise introuvable.", 'error')
        return redirect(url_for('matching_dashboard'))
    matches = find_top_matches_for_startup(eid, num_matches=10)
    return render_template('matching/resultats_startup.html', entreprise=entreprise, matches=matches)


# ─────────────────────────────────────────────
#  API JSON (pour React SPA)
# ─────────────────────────────────────────────

@app.route('/api/stats')
def api_stats():
    conn = get_db_connection()
    stats = {'nb_startups': 0, 'nb_chefs': 0, 'nb_matchs': 0}
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM entreprises")
            stats['nb_startups'] = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM chefs_entreprise")
            stats['nb_chefs'] = cur.fetchone()[0]
            stats['nb_matchs'] = stats['nb_startups'] * stats['nb_chefs']
            cur.close()
        except Exception:
            pass
        finally:
            conn.close()
    return jsonify({'status': 'ok', 'stats': stats})


@app.route('/api/notifications')
def api_notifications():
    conn = get_db_connection()
    notifs = []
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT e.nom_entreprise, c.prenom_chef, c.nom_chef FROM entreprises e CROSS JOIN chefs_entreprise c ORDER BY RANDOM() LIMIT 3")
            rows = cur.fetchall()
            for row in rows:
                notifs.append({'message': f"Nouveau match potentiel : {row[0]} \u2194 {row[1]} {row[2]}", 'icon': '\U0001f91d', 'time': 'il y a quelques minutes'})
            cur.close()
        except Exception:
            pass
        finally:
            conn.close()
    return jsonify({'status': 'ok', 'notifications': notifs, 'unread': len(notifs)})


@app.route('/api/entreprises')
def api_entreprises():
    from services.entreprise_service import get_all_entreprises
    entreprises = get_all_entreprises()
    return jsonify({'status': 'ok', 'entreprises': entreprises})


@app.route('/api/entreprises/<int:eid>')
def api_entreprise(eid):
    from services.entreprise_service import get_entreprise_by_id
    e = get_entreprise_by_id(eid)
    if not e:
        return jsonify({'status': 'error', 'message': 'Introuvable'}), 404
    return jsonify({'status': 'ok', 'entreprise': e})


@app.route('/api/chefs')
def api_chefs():
    from services.chef_service import get_all_chefs
    chefs = get_all_chefs()
    return jsonify({'status': 'ok', 'chefs': chefs})


@app.route('/api/chefs/<int:cid>')
def api_chef(cid):
    from services.chef_service import get_chef_by_id
    c = get_chef_by_id(cid)
    if not c:
        return jsonify({'status': 'error', 'message': 'Introuvable'}), 404
    return jsonify({'status': 'ok', 'chef': c})


@app.route('/api/matches/chef/<int:cid>')
def api_matches_chef(cid):
    matches = find_top_matches_for_leader(cid)
    return jsonify({'status': 'ok', 'matches': matches})


@app.route('/api/matches/startup/<int:eid>')
def api_matches_startup(eid):
    matches = find_top_matches_for_startup(eid)
    return jsonify({'status': 'ok', 'matches': matches})


# ─────────────────────────────────────────────
#  REACT SPA (client-side routing)
# ─────────────────────────────────────────────

@app.route('/react')
@app.route('/react/<path:path>')
def react_app(path=''):
    return render_template('react_index.html')


# ─────────────────────────────────────────────
#  ERREURS
# ─────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return render_template('errors/404.html'), 404


@app.errorhandler(500)
def server_error(e):
    return render_template('errors/500.html'), 500


# ─────────────────────────────────────────────
#  LANCEMENT
# ─────────────────────────────────────────────

if __name__ == '__main__':
    print("🚀 Initialisation de la base de données…")
    init_db()
    print("✅ Base de données prête.")
    app.run(debug=DEBUG, host='0.0.0.0', port=5000)
