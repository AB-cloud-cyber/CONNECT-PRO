const { useState, useEffect, useCallback } = React;

/* ─── API HELPER ─── */
const API = (path) => fetch(path).then((r) => r.json());

/* ─── SKILL TAGS ─── */
function SkillTags({ skills, variant }) {
  if (!skills || !skills.length) return null;
  return (
    <div className="skills-list">
      {skills.map((s, i) => (
        <span key={i} className={`skill-tag${variant ? ' ' + variant : ''}`}>{s}</span>
      ))}
    </div>
  );
}

/* ─── MATCH SCORE CIRCLE ─── */
function MatchScoreCircle({ score, size }) {
  const sz = size || 80;
  const cx = sz / 2, cy = sz / 2;
  const r = sz / 2 - 8;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const colorClass = score >= 70 ? 'score-high' : score >= 40 ? 'score-med' : 'score-low';
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} className="score-circle">
      <circle cx={cx} cy={cy} r={r} className="score-bg" />
      <circle cx={cx} cy={cy} r={r} className={`score-fill ${colorClass}`}
        strokeDasharray={circumference} strokeDashoffset={offset} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        className="score-text" style={{ fontSize: sz * 0.18 }}>{Math.round(score)}%</text>
    </svg>
  );
}

/* ─── MATCH RESULTS ─── */
function MatchResults({ matches, type }) {
  if (!matches || !matches.length) return (
    <div className="empty-state">
      <div className="empty-icon">📊</div>
      <h2>Aucun résultat</h2>
      <p>Aucun match trouvé pour ce profil.</p>
    </div>
  );

  return (
    <div>
      <div className="score-legend">
        <span className="legend-item"><span className="legend-dot high" /> Score élevé (≥70)</span>
        <span className="legend-item"><span className="legend-dot med" /> Moyen (40-69)</span>
        <span className="legend-item"><span className="legend-dot low" /> Faible (&lt;40)</span>
      </div>
      <div className="match-results-grid">
        {matches.map((m, i) => {
          const cls = m.score >= 70 ? 'high' : m.score >= 40 ? 'med' : 'low';
          const name = m.nom_complet || m.nom_entreprise;
          const desc = m.description_profil || m.description || '';
          const sector = m.secteur_interet || m.secteur || '';
          return (
            <div key={i} className={`match-result-card ${cls}`}>
              <div className="match-rank">#{i + 1}</div>
              <div className="score-display">
                <MatchScoreCircle score={m.score} />
              </div>
              <div className="match-body">
                <h3>{name}</h3>
                {sector && <span className="profile-badge">{sector}</span>}
                {desc && <p className="match-desc">{desc}</p>}
                {m.competences_communes && m.competences_communes.length > 0 && (
                  <SkillTags skills={m.competences_communes} variant="accent" />
                )}
                <div className="score-breakdown">
                  <div className="score-bar-row">
                    <span>Secteur</span>
                    <div className="score-bar"><div className="score-bar-fill secteur" style={{ width: m.score_secteur + '%' }} /></div>
                    <span className="score-val">{Math.round(m.score_secteur)}</span>
                  </div>
                  <div className="score-bar-row">
                    <span>Compétences</span>
                    <div className="score-bar"><div className="score-bar-fill competences" style={{ width: m.score_competences + '%' }} /></div>
                    <span className="score-val">{Math.round(m.score_competences)}</span>
                  </div>
                  <div className="score-bar-row">
                    <span>Localisation</span>
                    <div className="score-bar"><div className="score-bar-fill localisation" style={{ width: m.score_localisation + '%' }} /></div>
                    <span className="score-val">{Math.round(m.score_localisation)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── NAVBAR ─── */
function NavBar({ page, onNavigate }) {
  const links = [
    { key: 'home', label: 'Accueil' },
    { key: 'startups', label: 'Startups' },
    { key: 'chefs', label: 'Investisseurs' },
    { key: 'matching', label: 'Matching' },
  ];
  return (
    <nav className="navbar">
      <a className="navbar-brand" href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
        <span className="brand-icon">⟁</span>
        <span className="brand-text">Connect<strong>Pro</strong></span>
      </a>
      <ul className="navbar-links">
        {links.map((l) => (
          <li key={l.key}>
            <button className={`nav-link${page === l.key ? ' active' : ''}`}
              onClick={() => onNavigate(l.key)}>{l.label}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ─── HOME PAGE ─── */
function HomePage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API('/api/stats').then((d) => { if (d.status === 'ok') setStats(d.stats); });
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <p className="hero-eyebrow">Plateforme d'Intelligence Relationnelle</p>
          <h1 className="hero-title">Connectez les<br /><em>bonnes personnes</em><br />aux bonnes startups</h1>
          <p className="hero-subtitle">
            Notre algorithme de matching analyse les secteurs, compétences et profils
            pour vous proposer les meilleures mises en relation professionnelles.
          </p>
        </div>
        <div className="hero-visual">
          <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
          <div className="network-lines">
            <svg viewBox="0 0 400 400">
              <circle cx="200" cy="200" r="4" fill="#38bdf8" opacity="0.9" />
              <circle cx="100" cy="120" r="3" fill="#7dd3fc" opacity="0.7" />
              <circle cx="310" cy="140" r="3" fill="#7dd3fc" opacity="0.7" />
              <circle cx="80" cy="290" r="3" fill="#7dd3fc" opacity="0.7" />
              <circle cx="330" cy="290" r="3" fill="#7dd3fc" opacity="0.7" />
              <circle cx="200" cy="340" r="2" fill="#94a3b8" opacity="0.5" />
              <circle cx="200" cy="80" r="2" fill="#94a3b8" opacity="0.5" />
              {[[200,200,100,120],[200,200,310,140],[200,200,80,290],[200,200,330,290],[200,200,200,80],[200,200,200,340],[100,120,310,140],[80,290,330,290]].map(([x1,y1,x2,y2],i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38bdf8" strokeWidth="0.8" opacity={i < 6 ? 0.4 : 0.2} />
              ))}
            </svg>
          </div>
        </div>
      </section>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{stats ? stats.nb_startups : '—'}</span>
          <span className="stat-label">Startups inscrites</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">{stats ? stats.nb_chefs : '—'}</span>
          <span className="stat-label">Investisseurs actifs</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">{stats ? stats.nb_matchs : '—'}</span>
          <span className="stat-label">Matchs potentiels</span>
        </div>
      </div>

      <section className="section">
        <div className="section-header">
          <p className="section-eyebrow">Processus</p>
          <h2 className="section-title">Comment fonctionne le matching ?</h2>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Inscrivez votre profil</h3>
            <p>Renseignez votre secteur, vos compétences et vos objectifs en quelques minutes.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">02</div>
            <h3>L'algorithme analyse</h3>
            <p>Notre moteur TF-IDF + similarité cosinus compare secteurs, compétences et localisations.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Recevez vos matchs</h3>
            <p>Les profils les plus compatibles apparaissent avec un score de compatibilité détaillé.</p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── STARTUPS PAGE ─── */
function StartupsPage({ onNavigate }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    API('/api/entreprises').then((d) => { if (d.status === 'ok') setData(d.entreprises); });
  }, []);

  if (!data) return <div className="loading"><div className="spinner" /></div>;

  if (!data.length) return (
    <div className="empty-state">
      <div className="empty-icon">🏢</div>
      <h2>Aucune startup</h2>
      <p>Aucune startup n'est encore inscrite sur la plateforme.</p>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Startups</h1>
          <p className="page-subtitle">{data.length} startup{data.length > 1 ? 's' : ''} inscrite{data.length > 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="cards-grid">
        {data.map((e) => {
          const skills = e.competences_offertes ? e.competences_offertes.split(',').map(s => s.trim()).filter(Boolean) : [];
          return (
            <div key={e.id} className="profile-card"
              onClick={() => onNavigate('startup-detail', e.id)}>
              <div className="profile-card-header">
                <div className="profile-avatar startup-avatar">{e.nom_entreprise.charAt(0)}</div>
                <div className="profile-meta">
                  <div className="profile-name">{e.nom_entreprise}</div>
                  <span className="profile-badge">{e.secteur || 'Non spécifié'}</span>
                </div>
              </div>
              <p className="profile-description">{e.description || 'Aucune description'}</p>
              {e.localisation && <div className="profile-location">📍 {e.localisation}</div>}
              {skills.length > 0 && <SkillTags skills={skills} />}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ─── STARTUP DETAIL ─── */
function StartupDetail({ id, onNavigate }) {
  const [entreprise, setEntreprise] = useState(null);
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    API(`/api/entreprises/${id}`).then((d) => { if (d.status === 'ok') setEntreprise(d.entreprise); });
    API(`/api/matches/startup/${id}`).then((d) => { if (d.status === 'ok') setMatches(d.matches); });
  }, [id]);

  if (!entreprise) return <div className="loading"><div className="spinner" /></div>;

  const e = entreprise;
  const skills = e.competences_offertes ? e.competences_offertes.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <>
      <button className="back-btn" onClick={() => onNavigate('startups')}>← Retour aux startups</button>
      <div className="detail-layout">
        <div className="detail-sidebar">
          <div className="detail-card">
            <div className="detail-meta">
              <div className="profile-avatar startup-avatar large">{e.nom_entreprise.charAt(0)}</div>
              <h2 className="profile-name">{e.nom_entreprise}</h2>
              <span className="profile-badge large">{e.secteur || 'Non spécifié'}</span>
            </div>
            <dl className="info-list">
              {e.localisation && <><dt>Localisation</dt><dd>{e.localisation}</dd></>}
              {e.email_contact && <><dt>Contact</dt><dd><a href={`mailto:${e.email_contact}`}>{e.email_contact}</a></dd></>}
              {e.site_web && <><dt>Site Web</dt><dd><a href={e.site_web} target="_blank" rel="noopener noreferrer">{e.site_web}</a></dd></>}
              {e.taille && <><dt>Taille</dt><dd>{e.taille}</dd></>}
              {e.annee_creation && <><dt>Création</dt><dd>{e.annee_creation}</dd></>}
            </dl>
          </div>
        </div>
        <div>
          {e.description && <div className="detail-section">
            <h2>À propos</h2>
            <p className="body-text">{e.description}</p>
          </div>}
          {skills.length > 0 && <div className="detail-section">
            <h2>Compétences</h2>
            <SkillTags skills={skills} variant="accent" />
          </div>}
          <div className="detail-section">
            <h2>Matches trouvés ({matches ? matches.length : 0})</h2>
            <MatchResults matches={matches || []} type="startup" />
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── CHEFS PAGE ─── */
function ChefsPage({ onNavigate }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    API('/api/chefs').then((d) => { if (d.status === 'ok') setData(d.chefs); });
  }, []);

  if (!data) return <div className="loading"><div className="spinner" /></div>;

  if (!data.length) return (
    <div className="empty-state">
      <div className="empty-icon">👤</div>
      <h2>Aucun investisseur</h2>
      <p>Aucun profil investisseur n'est encore inscrit.</p>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Investisseurs</h1>
          <p className="page-subtitle">{data.length} profil{data.length > 1 ? 's' : ''} investisseur{data.length > 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="cards-grid">
        {data.map((c) => {
          const nomComplet = `${c.prenom_chef || ''} ${c.nom_chef || ''}`.trim();
          const skills = c.competences_recherchees ? c.competences_recherchees.split(',').map(s => s.trim()).filter(Boolean) : [];
          return (
            <div key={c.id} className="profile-card"
              onClick={() => onNavigate('chef-detail', c.id)}>
              <div className="profile-card-header">
                <div className="profile-avatar chef-avatar">{nomComplet.charAt(0)}</div>
                <div className="profile-meta">
                  <div className="profile-name">{nomComplet}</div>
                  <span className="profile-badge chef">{c.secteur_interet || 'Non spécifié'}</span>
                </div>
              </div>
              <p className="profile-description">{c.description_profil || 'Aucune description'}</p>
              {c.localisation && <div className="profile-location">📍 {c.localisation}</div>}
              {skills.length > 0 && <SkillTags skills={skills} variant="secondary" />}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ─── CHEF DETAIL ─── */
function ChefDetail({ id, onNavigate }) {
  const [chef, setChef] = useState(null);
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    API(`/api/chefs/${id}`).then((d) => { if (d.status === 'ok') setChef(d.chef); });
    API(`/api/matches/chef/${id}`).then((d) => { if (d.status === 'ok') setMatches(d.matches); });
  }, [id]);

  if (!chef) return <div className="loading"><div className="spinner" /></div>;

  const c = chef;
  const nomComplet = `${c.prenom_chef || ''} ${c.nom_chef || ''}`.trim();
  const skills = c.competences_recherchees ? c.competences_recherchees.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <>
      <button className="back-btn" onClick={() => onNavigate('chefs')}>← Retour aux investisseurs</button>
      <div className="detail-layout">
        <div className="detail-sidebar">
          <div className="detail-card">
            <div className="detail-meta">
              <div className="profile-avatar chef-avatar large">{nomComplet.charAt(0)}</div>
              <h2 className="profile-name">{nomComplet}</h2>
              <span className="profile-badge chef large">{c.secteur_interet || 'Non spécifié'}</span>
            </div>
            <dl className="info-list">
              {c.localisation && <><dt>Localisation</dt><dd>{c.localisation}</dd></>}
              {c.email_contact && <><dt>Contact</dt><dd><a href={`mailto:${c.email_contact}`}>{c.email_contact}</a></dd></>}
              {c.telephone && <><dt>Téléphone</dt><dd>{c.telephone}</dd></>}
              {c.budget_investissement && <><dt>Budget</dt><dd>{c.budget_investissement}</dd></>}
            </dl>
          </div>
        </div>
        <div>
          {c.description_profil && <div className="detail-section">
            <h2>À propos</h2>
            <p className="body-text">{c.description_profil}</p>
          </div>}
          {skills.length > 0 && <div className="detail-section">
            <h2>Compétences recherchées</h2>
            <SkillTags skills={skills} variant="secondary" />
          </div>}
          <div className="detail-section">
            <h2>Matches trouvés ({matches ? matches.length : 0})</h2>
            <MatchResults matches={matches || []} type="chef" />
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── MATCHING PAGE ─── */
function MatchingPage() {
  const [startups, setStartups] = useState(null);
  const [chefs, setChefs] = useState(null);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [selectedChef, setSelectedChef] = useState(null);
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API('/api/entreprises').then((d) => { if (d.status === 'ok') setStartups(d.entreprises); });
    API('/api/chefs').then((d) => { if (d.status === 'ok') setChefs(d.chefs); });
  }, []);

  const handleSelectStartup = useCallback((id) => {
    setSelectedStartup(id === selectedStartup ? null : id);
    setMatches(null);
  }, [selectedStartup]);

  const handleSelectChef = useCallback((id) => {
    setSelectedChef(id === selectedChef ? null : id);
    setMatches(null);
  }, [selectedChef]);

  useEffect(() => {
    if (!selectedStartup && !selectedChef) { setMatches(null); return; }
    setLoading(true);
    const url = selectedStartup
      ? `/api/matches/startup/${selectedStartup}`
      : `/api/matches/chef/${selectedChef}`;
    API(url).then((d) => {
      if (d.status === 'ok') setMatches(d.matches);
      setLoading(false);
    });
  }, [selectedStartup, selectedChef]);

  const itemForStartup = selectedStartup && startups ? startups.find(s => s.id === selectedStartup) : null;
  const itemForChef = selectedChef && chefs ? chefs.find(c => c.id === selectedChef) : null;
  const matchLabel = selectedStartup ? 'les startups' : 'les investisseurs';
  const matchTitle = itemForStartup
    ? `Meilleurs matchs pour ${itemForStartup.nom_entreprise}`
    : itemForChef
      ? `Meilleurs matchs pour ${itemForChef.prenom_chef || ''} ${itemForChef.nom_chef || ''}`.trim()
      : '';

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Matching</h1>
          <p className="page-subtitle">Sélectionnez un profil pour voir ses 10 meilleurs matchs</p>
        </div>
      </div>

      <div className="matching-dashboard">
        <div className="matching-panel startup-panel">
          <div className="matching-panel-header">
            <span className="panel-icon">🏢</span>
            <h2>Startups</h2>
            <span className="panel-count">{startups ? startups.length : '…'}</span>
          </div>
          {!startups ? (
            <div className="panel-empty"><div className="spinner" /></div>
          ) : !startups.length ? (
            <div className="panel-empty"><p>Aucune startup</p></div>
          ) : (
            <ul className="matching-list">
              {startups.map((s) => (
                <li key={s.id}
                  className={`matching-list-item${selectedStartup === s.id ? ' selected' : ''}`}
                  onClick={() => handleSelectStartup(s.id)}>
                  <div className="profile-avatar startup-avatar sm">{s.nom_entreprise.charAt(0)}</div>
                  <div className="matching-info">
                    <strong>{s.nom_entreprise}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{s.secteur}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="matching-arrow-center">
          <div className="matching-center-icon">⟷</div>
          <span>Match<br/>Engine</span>
        </div>

        <div className="matching-panel chef-panel">
          <div className="matching-panel-header">
            <span className="panel-icon">👤</span>
            <h2>Investisseurs</h2>
            <span className="panel-count">{chefs ? chefs.length : '…'}</span>
          </div>
          {!chefs ? (
            <div className="panel-empty"><div className="spinner" /></div>
          ) : !chefs.length ? (
            <div className="panel-empty"><p>Aucun investisseur</p></div>
          ) : (
            <ul className="matching-list">
              {chefs.map((c) => {
                const name = `${c.prenom_chef || ''} ${c.nom_chef || ''}`.trim();
                return (
                  <li key={c.id}
                    className={`matching-list-item${selectedChef === c.id ? ' selected' : ''}`}
                    onClick={() => handleSelectChef(c.id)}>
                    <div className="profile-avatar chef-avatar sm">{name.charAt(0)}</div>
                    <div className="matching-info">
                      <strong>{name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{c.secteur_interet}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {!selectedStartup && !selectedChef && (
        <div className="empty-state" style={{ marginTop: '2rem' }}>
          <div className="empty-icon">🔀</div>
          <h2>Sélectionnez un profil</h2>
          <p>Choisissez une startup ou un investisseur dans les panneaux ci-dessus pour voir les matchs.</p>
        </div>
      )}

      {loading && <div className="loading" style={{ marginTop: '2rem' }}><div className="spinner" /></div>}

      {matches && !loading && (
        <div className="matching-results">
          <h3>{matchTitle}</h3>
          <MatchResults matches={matches} />
        </div>
      )}
    </>
  );
}

/* ─── APP ─── */
function App() {
  const [page, setPage] = useState('home');
  const [detailId, setDetailId] = useState(null);

  const navigate = useCallback((p, id) => {
    setPage(p);
    if (id !== undefined) setDetailId(id);
  }, []);

  let content;
  switch (page) {
    case 'home':
      content = <HomePage />;
      break;
    case 'startups':
      content = <StartupsPage onNavigate={navigate} />;
      break;
    case 'startup-detail':
      content = <StartupDetail id={detailId} onNavigate={navigate} />;
      break;
    case 'chefs':
      content = <ChefsPage onNavigate={navigate} />;
      break;
    case 'chef-detail':
      content = <ChefDetail id={detailId} onNavigate={navigate} />;
      break;
    case 'matching':
      content = <MatchingPage />;
      break;
    default:
      content = <HomePage />;
  }

  return (
    <>
      <NavBar page={page === 'startup-detail' ? 'startups' : page === 'chef-detail' ? 'chefs' : page} onNavigate={navigate} />
      <div className="main-content">
        {content}
      </div>
      <footer className="footer">
        <div className="footer-inner">
          <span>© {new Date().getFullYear()} ConnectPro — Plateforme de Mise en Relation Professionnelle</span>
        </div>
      </footer>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
