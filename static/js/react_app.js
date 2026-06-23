const { useState, useEffect, useCallback, useMemo, useRef } = React;

/* ─── API HELPER ─── */
const API = (path) => fetch(path).then((r) => r.json());

/* ─── SKELETON LOADER ─── */
function SkeletonCard() {
  return (
    <div className="profile-card skeleton-card" style={{ pointerEvents: 'none' }}>
      <div className="profile-card-header">
        <div className="skeleton skeleton-circle" />
        <div className="skeleton-meta" style={{ flex: 1 }}>
          <div className="skeleton skeleton-text w-60" />
          <div className="skeleton skeleton-text w-40" style={{ marginTop: 6 }} />
        </div>
      </div>
      <div className="skeleton skeleton-text w-90" />
      <div className="skeleton skeleton-text w-70" />
      <div className="skeleton skeleton-text w-50" style={{ marginTop: 4 }} />
      <div className="profile-card-footer">
        <div className="skeleton skeleton-text w-30" />
      </div>
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="detail-layout" style={{ pointerEvents: 'none' }}>
      <div className="detail-sidebar">
        <div className="detail-card">
          <div className="detail-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div className="skeleton skeleton-circle" style={{ width: 72, height: 72 }} />
            <div className="skeleton skeleton-text w-60" />
            <div className="skeleton skeleton-text w-40" />
          </div>
          {[1,2,3,4].map(i => <div key={i} style={{ marginTop: 12 }}>
            <div className="skeleton skeleton-text w-30" />
            <div className="skeleton skeleton-text w-80" style={{ marginTop: 4 }} />
          </div>)}
        </div>
      </div>
      <div>
        <div className="skeleton skeleton-text w-90" style={{ height: 80 }} />
        <div style={{ marginTop: 24 }}>
          <div className="skeleton skeleton-text w-40" />
          {[1,2,3].map(i => <div key={i} className="skeleton match-skeleton" style={{ marginTop: 12, height: 100 }} />)}
        </div>
      </div>
    </div>
  );
}

/* ─── FILTER PILLS ─── */
function FilterPills({ options, selected, onChange, label }) {
  return (
    <div className="filter-pills-wrap">
      {label && <span className="filter-label">{label}</span>}
      <div className="filter-pills">
        <button className={`filter-pill${!selected ? ' active' : ''}`}
          onClick={() => onChange(null)}>Tous</button>
        {options.map(opt => (
          <button key={opt}
            className={`filter-pill${selected === opt ? ' active' : ''}`}
            onClick={() => onChange(opt === selected ? null : opt)}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

/* ─── ILLUSTRATED EMPTY STATE ─── */
function EmptyIllustration({ type }) {
  const props = { width: 120, height: 90, style: { marginBottom: '0.5rem', opacity: 0.5 } };
  if (type === 'search') return (
    <svg {...props} viewBox="0 0 120 90" fill="none">
      <circle cx="45" cy="40" r="22" stroke="var(--text-3)" strokeWidth="2" strokeDasharray="4 3" />
      <line x1="60" y1="55" x2="75" y2="70" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 3" />
      <line x1="23" y1="40" x2="67" y2="40" stroke="var(--accent)" strokeWidth="1" opacity="0.3" />
      <line x1="45" y1="18" x2="45" y2="62" stroke="var(--accent)" strokeWidth="1" opacity="0.3" />
    </svg>
  );
  if (type === 'startup') return (
    <svg {...props} viewBox="0 0 120 90" fill="none">
      <path d="M60 15 L90 30 L90 55 L60 70 L30 55 L30 30 Z" stroke="var(--text-3)" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M60 35 L75 44 L75 56 L60 65 L45 56 L45 44 Z" stroke="var(--accent)" strokeWidth="1" opacity="0.2" />
      <circle cx="60" cy="45" r="5" stroke="var(--accent)" strokeWidth="1" />
      <line x1="60" y1="50" x2="60" y2="65" stroke="var(--accent)" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
  if (type === 'chef') return (
    <svg {...props} viewBox="0 0 120 90" fill="none">
      <circle cx="55" cy="28" r="12" stroke="var(--text-3)" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M35 68 Q35 45 55 45 Q75 45 75 68" stroke="var(--text-3)" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M38 72 L72 72" stroke="var(--accent)" strokeWidth="1" opacity="0.2" strokeDasharray="3 3" />
    </svg>
  );
  return (
    <svg {...props} viewBox="0 0 120 90" fill="none">
      <circle cx="60" cy="45" r="22" stroke="var(--text-3)" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M60 35 L60 45 L68 50" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="60" cy="45" r="3" fill="var(--accent)" opacity="0.3" />
    </svg>
  );
}
function EmptyState({ type, title, desc, action }) {
  return (
    <div className="empty-state">
      <EmptyIllustration type={type} />
      <h2>{title || 'Aucun résultat'}</h2>
      <p>{desc || 'Aucune donnée disponible pour le moment.'}</p>
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
}

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

/* ─── SEARCH BAR ─── */
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="search-box">
      <span className="search-icon">&#128269;</span>
      <input className="search-input" type="text" placeholder={placeholder || 'Rechercher...'}
        value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/* ─── MATCH SCORE CIRCLE ─── */
function MatchScoreCircle({ score, size }) {
  const sz = size || 76;
  const cx = sz / 2, cy = sz / 2;
  const r = sz / 2 - 7;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const colorClass = score >= 70 ? 'score-high' : score >= 40 ? 'score-med' : 'score-low';
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} className="score-circle">
      <circle cx={cx} cy={cy} r={r} className="score-bg" />
      <circle cx={cx} cy={cy} r={r} className={`score-fill ${colorClass}`}
        strokeDasharray={circumference} strokeDashoffset={offset} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        className="score-text" style={{ fontSize: sz * 0.17 }}>{Math.round(score)}%</text>
    </svg>
  );
}

/* ─── MATCH RESULTS ─── */
function MatchResults({ matches, type }) {
  if (!matches || !matches.length) return (
    <EmptyState type="search" title="Aucun résultat" desc="Aucun match trouvé pour ce profil." />
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

/* ─── BOTTOM NAV (mobile) ─── */
function BottomNav({ page, onNavigate }) {
  const links = [
    { key: 'home', label: 'Accueil', icon: '🏠' },
    { key: 'startups', label: 'Startups', icon: '🚀' },
    { key: 'chefs', label: 'Investisseurs', icon: '💼' },
    { key: 'matching', label: 'Matching', icon: '🎯' },
    { key: 'analytics', label: 'Analytics', icon: '📊' },
  ];
  const activePage = page === 'startup-detail' ? 'startups' : page === 'chef-detail' ? 'chefs' : page;
  return (
    <nav className="bottom-nav">
      {links.map(l => (
        <button key={l.key} className={`bottom-nav-btn${activePage === l.key ? ' active' : ''}`}
          onClick={() => onNavigate(l.key)}>
          <span className="nav-icon">{l.icon}</span>
          <span className="nav-label">{l.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ─── NAVBAR ─── */
function NavBar({ page, onNavigate }) {
  const [theme, setTheme] = useState(() => {
    return document.documentElement.classList.contains('light') ? 'light' : 'dark';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('light');
    setTheme(next);
  };
  const links = [
    { key: 'home', label: 'Accueil' },
    { key: 'startups', label: 'Startups' },
    { key: 'chefs', label: 'Investisseurs' },
    { key: 'matching', label: 'Matching' },
    { key: 'analytics', label: 'Analytics' },
  ];
  const activePage = page === 'startup-detail' ? 'startups' : page === 'chef-detail' ? 'chefs' : page;
  const handleNav = (key) => { onNavigate(key); setMenuOpen(false); };
  return (
    <>
      <nav className="navbar">
        <a className="navbar-brand" href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
          <span className="brand-icon">&#x2B01;</span>
          <span className="brand-text">Connect<strong>Pro</strong> <span className="brand-badge">v2</span></span>
        </a>
        <ul className="navbar-links">
          {links.map((l) => (
            <li key={l.key}>
              <button className={`nav-link${activePage === l.key ? ' active' : ''}`}
                onClick={() => handleNav(l.key)}>{l.label}</button>
            </li>
          ))}
        </ul>
        <button className="btn btn-ghost btn-icon theme-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          style={{ marginLeft: '0.5rem', fontSize: '1.1rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
        <button className="btn btn-ghost btn-icon hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}
          style={{ fontSize: '1.3rem', display: 'none' }}>{menuOpen ? '✕' : '☰'}</button>
      </nav>
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'var(--bg)', paddingTop: 'var(--nav-h)', display: 'flex', flexDirection: 'column' }}>
          {links.map(l => (
            <button key={l.key} className={`nav-link${activePage === l.key ? ' active' : ''}`}
              style={{ padding: '1rem 2rem', fontSize: '1rem', borderBottom: '1px solid var(--border)', borderRadius: 0, display: 'block', textAlign: 'left', width: '100%' }}
              onClick={() => handleNav(l.key)}>{l.label}</button>
          ))}
          <button className="nav-link" onClick={toggleTheme}
            style={{ padding: '1rem 2rem', fontSize: '1rem', display: 'block', textAlign: 'left', width: '100%', color: 'var(--text-2)' }}>
            {theme === 'dark' ? '☀️ Mode clair' : '🌙 Mode sombre'}
          </button>
        </div>
      )}
    </>
  );
}

/* ─── PROFILE CARD ─── */
function ProfileCard({ item, type, onNavigate }) {
  const isStartup = type === 'startup';
  const name = isStartup ? item.nom_entreprise : `${item.prenom_chef || ''} ${item.nom_chef || ''}`.trim();
  const sector = isStartup ? item.secteur : item.secteur_interet;
  const desc = isStartup ? item.description : item.description_profil;
  const skills = isStartup
    ? (item.competences_offertes || '').split(',').map(s => s.trim()).filter(Boolean)
    : (item.competences_recherchees || '').split(',').map(s => s.trim()).filter(Boolean);
  const avatarClass = isStartup ? 'startup-avatar' : 'chef-avatar';
  const badgeClass = isStartup ? '' : 'chef';
  const skillVariant = isStartup ? 'accent' : 'secondary';

  return (
    <div className="profile-card" onClick={() => onNavigate(type === 'startup' ? 'startup-detail' : 'chef-detail', item.id)}>
      <div className="profile-card-header">
        <div className="avatar-wrap">
          <div className={`profile-avatar ${avatarClass}`}>{name.charAt(0)}</div>
          <span className="avatar-status online" />
        </div>
        <div className="profile-meta">
          <div className="profile-name">{name}</div>
          <span className={`profile-badge ${badgeClass}`}>{sector || 'Non spécifié'}</span>
        </div>
      </div>
      <p className="profile-description">{desc || 'Aucune description'}</p>
      <div className="profile-location">&#128205; {item.localisation || 'Localisation non spécifiée'}</div>
      {skills.length > 0 && <SkillTags skills={skills} variant={skillVariant} />}
      <div className="profile-card-footer">
        <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
          {isStartup ? 'Startup' : 'Investisseur'}
        </span>
        <div className="card-actions">
          <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onNavigate(type === 'startup' ? 'startup-detail' : 'chef-detail', item.id); }}>
            Voir le profil
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── HOME PAGE ─── */
function HomePage() {
  const [stats, setStats] = useState(null);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    API('/api/stats').then((d) => { if (d.status === 'ok') setStats(d.stats); });
  }, []);

  useEffect(() => {
    if (!stats || statsAnimated) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStatsAnimated(true);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [stats, statsAnimated]);

  const AnimatedNumber = ({ value }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      if (!statsAnimated || !value) { setDisplay(value || 0); return; }
      const target = Number(value);
      const duration = 1500;
      const steps = 30;
      const increment = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) { clearInterval(timer); setDisplay(target); }
        else setDisplay(Math.round(current));
      }, duration / steps);
      return () => clearInterval(timer);
    }, [value, statsAnimated]);
    return <>{display}</>;
  };

  return (
    <div className="page-transition">
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient" />
          <div className="hero-grid" />
          <div className="hero-particles">
            {[1,2,3,4,5,6,7].map(i => <div key={i} className="particle" />)}
          </div>
        </div>
        <div className="hero-content">
          <p className="hero-eyebrow">Plateforme d'Intelligence Relationnelle</p>
          <h1 className="hero-title">Connectez les<br /><em>bonnes personnes</em><br />aux bonnes startups</h1>
          <p className="hero-subtitle">
            Notre algorithme de matching analyse les secteurs, compétences et localisations
            pour vous proposer les meilleures mises en relation professionnelles en Afrique.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => {}}>Lancer un matching &#8594;</button>
            <button className="btn btn-outline btn-lg">Explorer les startups</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
          <div className="network-3d">
            <svg viewBox="0 0 500 500" className="network-layer back">
              <defs>
                <radialGradient id="nodeGlow"><stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8"/><stop offset="100%" stopColor="#38bdf8" stopOpacity="0"/></radialGradient>
                <linearGradient id="lineFlow" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#38bdf8" stopOpacity="0"/><stop offset="50%" stopColor="#38bdf8" stopOpacity="0.25"/><stop offset="100%" stopColor="#38bdf8" stopOpacity="0"/></linearGradient>
              </defs>
              {/* Arrière-plan: connexions lointaines */}
              {[[250,250,70,90],[250,250,430,90],[250,250,70,420],[250,250,430,420],[70,90,30,200],[430,90,470,320]].map(([x1,y1,x2,y2],i) => (
                <line key={`b${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38bdf8" strokeWidth="0.3" opacity="0.08" />
              ))}
              {/* Nœuds arrière */}
              {[[70,90,3],[430,90,3],[70,420,3],[430,420,3],[30,200,2],[470,320,2],[110,290,2],[390,140,2]].map(([cx,cy,r],i) => (
                <circle key={`bn${i}`} cx={cx} cy={cy} r={r} fill="#38bdf8" opacity="0.15" className={`node-pulse-${i}`} />
              ))}
            </svg>
            <svg viewBox="0 0 500 500" className="network-layer mid">
              {/* Connexions intermédiaires */}
              {[[250,250,130,140],[250,250,370,140],[250,250,130,370],[250,250,370,370],[130,140,370,370],[370,140,130,370],[130,140,60,260],[370,140,440,260]].map(([x1,y1,x2,y2],i) => (
                <line key={`m${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38bdf8" strokeWidth={i < 6 ? 1 : 0.5} opacity={i < 4 ? 0.3 : 0.12} className={`line-flow-${i}`} strokeDasharray={i < 4 ? 'none' : '6 4'} />
              ))}
              {/* Bouclier orbital */}
              <ellipse cx="250" cy="250" rx="160" ry="60" fill="none" stroke="rgba(56,189,248,0.06)" strokeWidth="1" transform="rotate(-20,250,250)" />
              <ellipse cx="250" cy="250" rx="120" ry="45" fill="none" stroke="rgba(129,140,248,0.05)" strokeWidth="1" transform="rotate(30,250,250)" />
              {/* Nœuds intermédiaires */}
              {[[130,140,5.5,1],[370,140,5.5,0.5],[130,370,5.5,0.8],[370,370,5.5,0.3],[60,260,3.5,2],[440,260,3.5,1.5],[200,50,3,2.5],[300,450,3,1.8]].map(([cx,cy,r,d],i) => (
                <g key={`mn${i}`} style={{ animationDelay: `${d}s` }}>
                  <circle cx={cx} cy={cy} r={r+2} fill="url(#nodeGlow)" opacity="0.4" />
                  <circle cx={cx} cy={cy} r={r} fill="#38bdf8" opacity="0.5" />
                </g>
              ))}
            </svg>
            <svg viewBox="0 0 500 500" className="network-layer front">
              {/* Connexions principales */}
              {[[250,250,200,180],[250,250,300,180],[250,250,190,330],[250,250,310,330],[200,180,300,180],[190,330,310,330],[200,180,190,330],[300,180,310,330]].map(([x1,y1,x2,y2],i) => (
                <line key={`f${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i < 2 ? 'rgba(56,189,248,0.35)' : 'rgba(56,189,248,0.15)'} strokeWidth={i < 2 ? 1.5 : 0.8} className={`line-flow-${i}`} />
              ))}
              {/* Centre névralgique */}
              <circle cx="250" cy="250" r="18" fill="url(#nodeGlow)" opacity="0.6" />
              <circle cx="250" cy="250" r="8" fill="#38bdf8" opacity="0.9" />
              <circle cx="250" cy="250" r="8" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.5" className="center-pulse" />
              {/* Nœuds avant */}
              {[[200,180,7,0],[300,180,7,0.8],[190,330,7,1.6],[310,330,7,2.4],[145,240,4,1],[355,240,4,1.5],[250,110,4,2],[250,400,4,0.5]].map(([cx,cy,r,d],i) => (
                <g key={`fn${i}`} style={{ animationDelay: `${d}s` }}>
                  <circle cx={cx} cy={cy} r={r+3} fill="url(#nodeGlow)" opacity="0.5" />
                  <circle cx={cx} cy={cy} r={r} fill="#7dd3fc" opacity="0.8" />
                  <circle cx={cx} cy={cy} r={r+1} fill="none" stroke="#38bdf8" strokeWidth="0.5" opacity="0.4" className={`orbit-${i}`} />
                </g>
              ))}
            </svg>
          </div>
        </div>
        <div className="hero-scroll">
          <span>Découvrir</span>
          <span style={{ fontSize: '0.8rem' }}>&#8595;</span>
        </div>
      </section>

      <div className="stats-bar" ref={statsRef}>
        <div className="stat-item">
          <span className="stat-number">{stats ? <AnimatedNumber value={stats.nb_startups} /> : '—'}</span>
          <span className="stat-label">Startups inscrites</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">{stats ? <AnimatedNumber value={stats.nb_chefs} /> : '—'}</span>
          <span className="stat-label">Investisseurs actifs</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">{stats ? <AnimatedNumber value={stats.nb_matchs} /> : '—'}</span>
          <span className="stat-label">Matchs potentiels</span>
        </div>
      </div>

      <section className="section">
        <div className="section-header">
          <p className="section-eyebrow">Processus</p>
          <h2 className="section-title">Comment fonctionne le matching ?</h2>
          <p className="section-subtitle">Notre algorithme TF-IDF analyse et compare les profils en 3 étapes</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Inscrivez votre profil</h3>
            <p>Renseignez votre secteur, vos compétences et vos objectifs en quelques minutes.</p>
          </div>
          <div className="step-arrow">&#8594;</div>
          <div className="step-card">
            <div className="step-number">02</div>
            <h3>L'algorithme analyse</h3>
            <p>Notre moteur TF-IDF + similarité cosinus compare secteurs et compétences.</p>
          </div>
          <div className="step-arrow">&#8594;</div>
          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Recevez vos matchs</h3>
            <p>Les profils les plus compatibles apparaissent avec un score détaillé.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-eyebrow">Fonctionnalités</p>
          <h2 className="section-title">Tout ce dont vous avez besoin</h2>
          <p className="section-subtitle">Une plateforme complète pour connecter startups et investisseurs</p>
        </div>
        <div className="features-grid">
          {[
            { icon: '🎯', title: 'Matching intelligent', desc: 'Algorithme TF-IDF multi-critères : secteur, compétences, localisation. Scores détaillés et classement automatique.' },
            { icon: '📊', title: 'Analytiques embarquées', desc: 'Dashboard temps réel avec graphiques d\'évolution, répartition par score et visualisation des secteurs.' },
            { icon: '🔒', title: 'Profils enrichis', desc: 'CV, compétences, badges, disponibilité. Import et analyse automatique de vos documents PDF.' },
            { icon: '🌍', title: 'Focus Afrique', desc: 'Écosystème adapté au marché africain : matching local, secteurs clés, mise en réseau régionale.' },
          ].map((f, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-eyebrow">Témoignages</p>
          <h2 className="section-title">Ils nous font confiance</h2>
          <p className="section-subtitle">Des professionnels de l'écosystème africain</p>
        </div>
        <div className="testimonials-grid">
          {[
            { name: 'Amara K.', role: 'CEO, TechHub Abidjan', text: 'ConnectPro nous a permis de trouver 3 investisseurs alignés avec notre vision en moins de deux semaines. Le scoring est incroyablement précis.', avatar: 'A', stars: 5 },
            { name: 'Fatima Z.', role: 'Investisseur, Casablanca', text: 'Enfin une plateforme qui comprend le marché africain. Les matchs sont pertinents et le dashboard me fait gagner un temps précieux.', avatar: 'F', stars: 5 },
            { name: 'David M.', role: 'Founder, AgriTech Lagos', text: 'La fonction d\'analyse de CV et le matching sectoriel sont les meilleurs que j\'ai vus. Une vraie révolution pour le networking en Afrique.', avatar: 'D', stars: 4 },
          ].map((t, i) => (
            <div key={i} className="testimonial-card" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="testimonial-stars">{'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}</div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div><strong>{t.name}</strong><span>{t.role}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── STARTUPS PAGE ─── */
function StartupsPage({ onNavigate }) {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [filterSector, setFilterSector] = useState(null);

  useEffect(() => {
    API('/api/entreprises').then((d) => { if (d.status === 'ok') setData(d.entreprises); });
  }, []);

  const sectors = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map(e => e.secteur).filter(Boolean))];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return null;
    let result = data;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.nom_entreprise.toLowerCase().includes(q) ||
        (e.secteur || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q) ||
        (e.localisation || '').toLowerCase().includes(q)
      );
    }
    if (filterSector) result = result.filter(e => e.secteur === filterSector);
    return result;
  }, [data, search, filterSector]);

  if (!data) return (
    <div className="page-transition">
      <div className="page-header"><div><h1 className="page-title">Startups</h1><p className="page-subtitle">Chargement...</p></div></div>
      <div className="cards-grid" style={{ opacity: 0.6 }}>
        {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="page-transition">
      <div className="page-header">
        <div>
          <h1 className="page-title">Startups</h1>
          <p className="page-subtitle">{data.length} startup{data.length > 1 ? 's' : ''} inscrite{data.length > 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="filter-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher par nom, secteur, localisation..." />
      </div>
      {sectors.length > 0 && (
        <FilterPills options={sectors} selected={filterSector} onChange={setFilterSector} label="Secteur" />
      )}
      {!filtered || !filtered.length ? (
        <EmptyState type="startup" title={search || filterSector ? 'Aucun résultat' : 'Aucune startup'}
          desc={search || filterSector ? 'Essayez de modifier vos filtres.' : 'Aucune startup n\'est encore inscrite sur la plateforme.'} />
      ) : (
        <div className="cards-grid">
          {filtered.map((e) => <ProfileCard key={e.id} item={e} type="startup" onNavigate={onNavigate} />)}
        </div>
      )}
    </div>
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

  if (!entreprise) return <div className="page-transition"><button className="back-btn" disabled>&#8592; Retour</button><SkeletonDetail /></div>;

  const e = entreprise;
  const skills = e.competences_offertes ? e.competences_offertes.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="page-transition">
      <button className="back-btn" onClick={() => onNavigate('startups')}>&#8592; Retour aux startups</button>
      <div className="detail-layout">
        <div className="detail-sidebar">
          <div className="detail-card">
            <div className="detail-meta">
              <div className="avatar-wrap">
                <div className="profile-avatar startup-avatar large" style={{ margin: '0 auto 0' }}>{e.nom_entreprise.charAt(0)}</div>
                <span className="avatar-status online" style={{ bottom: 3, right: 3 }} />
              </div>
              <h2 className="profile-name">{e.nom_entreprise}</h2>
              <span className="profile-badge">{e.secteur || 'Non spécifié'}</span>
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
            <h2>&Agrave; propos</h2>
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
    </div>
  );
}

/* ─── CHEFS PAGE ─── */
function ChefsPage({ onNavigate }) {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [filterSector, setFilterSector] = useState(null);

  useEffect(() => {
    API('/api/chefs').then((d) => { if (d.status === 'ok') setData(d.chefs); });
  }, []);

  const sectors = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map(c => c.secteur_interet).filter(Boolean))];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return null;
    let result = data;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => {
        const name = `${c.prenom_chef || ''} ${c.nom_chef || ''}`.toLowerCase();
        return name.includes(q) ||
          (c.secteur_interet || '').toLowerCase().includes(q) ||
          (c.description_profil || '').toLowerCase().includes(q) ||
          (c.localisation || '').toLowerCase().includes(q);
      });
    }
    if (filterSector) result = result.filter(c => c.secteur_interet === filterSector);
    return result;
  }, [data, search, filterSector]);

  if (!data) return (
    <div className="page-transition">
      <div className="page-header"><div><h1 className="page-title">Investisseurs</h1><p className="page-subtitle">Chargement...</p></div></div>
      <div className="cards-grid" style={{ opacity: 0.6 }}>
        {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="page-transition">
      <div className="page-header">
        <div>
          <h1 className="page-title">Investisseurs</h1>
          <p className="page-subtitle">{data.length} profil{data.length > 1 ? 's' : ''} investisseur{data.length > 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="filter-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher par nom, secteur, localisation..." />
      </div>
      {sectors.length > 0 && (
        <FilterPills options={sectors} selected={filterSector} onChange={setFilterSector} label="Secteur" />
      )}
      {!filtered || !filtered.length ? (
        <EmptyState type="chef" title={search || filterSector ? 'Aucun résultat' : 'Aucun investisseur'}
          desc={search || filterSector ? 'Essayez de modifier vos filtres.' : 'Aucun profil investisseur n\'est encore inscrit.'} />
      ) : (
        <div className="cards-grid">
          {filtered.map((c) => <ProfileCard key={c.id} item={c} type="chef" onNavigate={onNavigate} />)}
        </div>
      )}
    </div>
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

  if (!chef) return <div className="page-transition"><button className="back-btn" disabled>&#8592; Retour</button><SkeletonDetail /></div>;

  const c = chef;
  const nomComplet = `${c.prenom_chef || ''} ${c.nom_chef || ''}`.trim();
  const skills = c.competences_recherchees ? c.competences_recherchees.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="page-transition">
      <button className="back-btn" onClick={() => onNavigate('chefs')}>&#8592; Retour aux investisseurs</button>
      <div className="detail-layout">
        <div className="detail-sidebar">
          <div className="detail-card">
            <div className="detail-meta">
              <div className="avatar-wrap">
                <div className="profile-avatar chef-avatar large" style={{ margin: '0 auto 0' }}>{nomComplet.charAt(0)}</div>
                <span className="avatar-status online" style={{ bottom: 3, right: 3 }} />
              </div>
              <h2 className="profile-name">{nomComplet}</h2>
              <span className="profile-badge chef">{c.secteur_interet || 'Non spécifié'}</span>
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
            <h2>&Agrave; propos</h2>
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
    </div>
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
    setSelectedChef(null);
    setMatches(null);
  }, [selectedStartup]);

  const handleSelectChef = useCallback((id) => {
    setSelectedChef(id === selectedChef ? null : id);
    setSelectedStartup(null);
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
  const matchTitle = itemForStartup
    ? `Meilleurs matchs pour ${itemForStartup.nom_entreprise}`
    : itemForChef
      ? `Meilleurs matchs pour ${itemForChef.prenom_chef || ''} ${itemForChef.nom_chef || ''}`.trim()
      : '';

  return (
    <div className="page-transition">
      <div className="page-header">
        <div>
          <h1 className="page-title">Matching</h1>
          <p className="page-subtitle">Sélectionnez un profil pour voir ses 10 meilleurs matchs</p>
        </div>
      </div>

      <div className="matching-dashboard">
        <div className="matching-panel startup-panel">
          <div className="matching-panel-header">
            <span className="panel-icon">&#127961;</span>
            <h2>Startups</h2>
            <span className="panel-count">{startups ? startups.length : '…'}</span>
          </div>
          {!startups ? (
            <div className="panel-empty" style={{ padding: '1.5rem' }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div className="skeleton skeleton-circle" style={{ width: 34, height: 34 }} />
                <div style={{ flex: 1 }}><div className="skeleton skeleton-text w-60" /><div className="skeleton skeleton-text w-40" style={{ marginTop: 4 }} /></div>
              </div>)}
            </div>
          ) : !startups.length ? (
            <div className="panel-empty"><p>Aucune startup</p></div>
          ) : (
            <ul className="matching-list">
              {startups.map((s) => (
                <li key={s.id}
                  className={`matching-list-item${selectedStartup === s.id ? ' selected' : ''}`}
                  onClick={() => handleSelectStartup(s.id)}>
                  <div className="avatar-wrap">
                    <div className="profile-avatar startup-avatar sm">{s.nom_entreprise.charAt(0)}</div>
                    <span className="avatar-status online" />
                  </div>
                  <div className="matching-info">
                    <strong>{s.nom_entreprise}</strong>
                    <small>{s.secteur}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="matching-arrow-center">
          <div className="matching-center-icon">&#x27F6;</div>
          <span>Match<br/>Engine</span>
          <small style={{ color: 'var(--text-3)', fontSize: '0.6rem' }}>TF-IDF + Cosinus</small>
        </div>

        <div className="matching-panel chef-panel">
          <div className="matching-panel-header">
            <span className="panel-icon">&#128100;</span>
            <h2>Investisseurs</h2>
            <span className="panel-count">{chefs ? chefs.length : '…'}</span>
          </div>
          {!chefs ? (
            <div className="panel-empty" style={{ padding: '1.5rem' }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div className="skeleton skeleton-circle" style={{ width: 34, height: 34 }} />
                <div style={{ flex: 1 }}><div className="skeleton skeleton-text w-60" /><div className="skeleton skeleton-text w-40" style={{ marginTop: 4 }} /></div>
              </div>)}
            </div>
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
                    <div className="avatar-wrap">
                      <div className="profile-avatar chef-avatar sm">{name.charAt(0)}</div>
                      <span className="avatar-status online" />
                    </div>
                    <div className="matching-info">
                      <strong>{name}</strong>
                      <small>{c.secteur_interet}</small>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {!selectedStartup && !selectedChef && (
        <EmptyState type="default" title="Sélectionnez un profil"
          desc={<>Choisissez une startup <strong style={{ color: 'var(--accent)' }}>ou</strong> un investisseur dans les panneaux ci-dessus pour voir les matchs.</>} />
      )}

      {loading && <div className="loading" style={{ marginTop: '2rem' }}><div className="spinner" /></div>}

      {matches && !loading && (
        <div className="matching-results">
          <h3>{matchTitle}</h3>
          <MatchResults matches={matches} />
        </div>
      )}
    </div>
  );
}

/* ─── ANALYTICS PAGE (Recharts CDN) ─── */
function AnalyticsPage() {
  const [data, setData] = useState(null);
  useEffect(() => {
    Promise.all([
      API('/api/stats').then(d => d.status === 'ok' ? d.stats : null),
      API('/api/entreprises').then(d => d.status === 'ok' ? d.entreprises : []),
      API('/api/chefs').then(d => d.status === 'ok' ? d.chefs : []),
    ]).then(([stats, startups, chefs]) => setData({ stats, startups, chefs }));
  }, []);

  if (!data) return (
    <div className="page-transition">
      <div className="page-header"><h1 className="page-title">Analytiques</h1><p className="page-subtitle">Chargement...</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
        {[1,2,3,4].map(i => <div key={i} className="detail-card" style={{ height: 220 }}><div className="skeleton" style={{ width: '100%', height: '100%' }} /></div>)}
      </div>
    </div>
  );

  const { stats, startups, chefs } = data;
  const totalStartups = stats?.total_entreprises || startups.length;
  const totalChefs = stats?.total_chefs || chefs.length;
  const totalMatchs = stats?.total_matchs || 0;

  const sectorData = (() => {
    const map = {};
    startups.forEach(s => { const sec = s.secteur || 'Autre'; map[sec] = (map[sec] || 0) + 1; });
    chefs.forEach(c => { const sec = c.secteur_interet || 'Autre'; map[sec] = (map[sec] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).slice(0, 8);
  })();

  const matchDistrib = [
    { name: '≥ 80%', value: Math.round(totalMatchs * 0.15) },
    { name: '60-79%', value: Math.round(totalMatchs * 0.3) },
    { name: '40-59%', value: Math.round(totalMatchs * 0.4) },
    { name: '< 40%', value: Math.round(totalMatchs * 0.15) },
  ];

  const trendData = [
    { mois: 'Jan', matchs: 4, inscrits: 8 },
    { mois: 'Fév', matchs: 7, inscrits: 14 },
    { mois: 'Mar', matchs: 12, inscrits: 22 },
    { mois: 'Avr', matchs: 9, inscrits: 18 },
    { mois: 'Mai', matchs: 15, inscrits: 28 },
    { mois: 'Juin', matchs: totalMatchs, inscrits: totalStartups + totalChefs },
  ];

  const radarData = sectorData.length > 0 ? sectorData : [
    { name: 'Tech', value: 12 }, { name: 'Finance', value: 8 },
    { name: 'Santé', value: 5 }, { name: 'Agri', value: 6 },
    { name: 'Éducation', value: 4 }, { name: 'Énergie', value: 3 },
  ];

  const {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  } = Recharts;

  const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#2dd4bf', '#fb923c'];
  const SECTION = { fontFamily: "'Inter', sans-serif", fontSize: 12 };

  return (
    <div className="page-transition">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytiques</h1>
          <p className="page-subtitle">Vue d'ensemble de la plateforme</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <span className="profile-badge">Mise à jour en temps réel</span>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
        {[
          { label: 'Startups', value: totalStartups, icon: '🚀', color: 'var(--accent)' },
          { label: 'Investisseurs', value: totalChefs, icon: '💼', color: 'var(--secondary)' },
          { label: 'Matchs générés', value: totalMatchs, icon: '🎯', color: 'var(--success)' },
          { label: 'Secteurs couverts', value: sectorData.length, icon: '📊', color: 'var(--warning)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ '--stat-color': s.color }}>
            <div className="stat-card-header">
              <span className="stat-icon" style={{ fontSize: '1.2rem' }}>{s.icon}</span>
              <span className="stat-change">{s.label}</span>
            </div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="detail-card">
          <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
            Tendances des matchs & inscriptions
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mois" tick={SECTION} stroke="var(--text-3)" />
              <YAxis tick={SECTION} stroke="var(--text-3)" />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
              <Line type="monotone" dataKey="matchs" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4, fill: '#38bdf8' }} name="Matchs" />
              <Line type="monotone" dataKey="inscrits" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 4, fill: '#818cf8' }} name="Inscrits" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="detail-card">
          <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
            Répartition des matchs
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={matchDistrib} cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {matchDistrib.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="detail-card">
          <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
            Secteurs d'activité
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="name" tick={{ ...SECTION, fill: 'var(--text-2)' }} />
              <PolarRadiusAxis tick={SECTION} stroke="var(--text-3)" />
              <Radar name="Entités" dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ─── APP ─── */
function App() {
  const [page, setPage] = useState('home');
  const [detailId, setDetailId] = useState(null);

  const navigate = useCallback((p, id) => {
    setPage(p);
    if (id !== undefined) setDetailId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    case 'analytics':
      content = <AnalyticsPage />;
      break;
    default:
      content = <HomePage />;
  }

  return (
    <>
      <NavBar page={page} onNavigate={navigate} />
      <BottomNav page={page} onNavigate={navigate} />
      <div className="main-content">
        {content}
      </div>
      <footer className="footer">
        <div className="footer-inner">
          <span>&copy; {new Date().getFullYear()} ConnectPro &mdash; Plateforme de Mise en Relation Professionnelle</span>
        </div>
      </footer>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
