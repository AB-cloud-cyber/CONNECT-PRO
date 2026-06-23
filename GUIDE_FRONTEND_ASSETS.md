# Guide des Assets Frontend — ConnectPro

## Améliorations appliquées

### Design System v2
| Asset | Description | Source |
|---|---|---|
| **CSS personnalisé** (~750 lignes) | Design system complet avec variables CSS, glassmorphism, gradients, animations | Création personnalisée |
| **React SPA améliorée** | Barre de recherche + filtrage, cartes animées, transitions de page, compteurs animés | Création personnalisée |
| **Grille de fond** | Pattern de grille avec masque radial sur le hero | CSS pur |
| **Orbes flottantes** | 3 orbes avec animation float (8s/10s/6s) en décalé | CSS @keyframes |
| **Pulse ring** | Anneau de pulsation sur le centre du réseau | CSS animation |
| **Score bars** | Barres avec dégradés + effet shimmer | CSS linear-gradient + keyframes |
| **Page transitions** | FadeIn + translateY au changement de page | CSS @keyframes |
| **Hover cards** | Élévation 3D + bordure lumineuse supérieure au hover | CSS transition + ::before |

### Police
| Police | Usage | Source |
|---|---|---|
| **Inter** | Corps du texte (300-900) | Google Fonts |
| **Playfair Display** | Titres (600-700, italic) | Google Fonts |
| **JetBrains Mono** | Non utilisé actuellement, réservé | Google Fonts |

### Palette de couleurs
| Rôle | Couleur | Hex |
|---|---|---|
| Fond principal | Noir bleuté | `#0a0e1a` |
| Fond carte | Transparent bleuté | `rgba(15,21,37,0.8)` |
| Accent primaire | Bleu ciel | `#38bdf8` |
| Accent secondaire | Violet | `#818cf8` |
| Succès | Vert | `#34d399` |
| Avertissement | Jaune | `#fbbf24` |
| Texte principal | Blanc cassé | `#e8edf5` |
| Texte secondaire | Gris bleuté | `#94a3b8` |

---

## Assets externes recommandés (non inclus, nécessitent build)

### 1. shadcn/ui — Meilleure librairie de composants React (2026)
- **Site** : https://ui.shadcn.com
- **Stars GitHub** : ~117K
- **Installation** : `npx shadcn@latest init`
- **Composants utiles** : Card, Badge, Progress, Avatar, Tabs, Dialog, Sheet, Select, Input, Button
- **Bundle** : 15-20KB gzipped
- **Avantage** : Copie les sources dans votre projet, contrôle total

### 2. Motion (Framer Motion v12+) — Animations
- **Site** : https://motion.dev
- **Installation** : `npm install motion`
- **Utile pour** : animations de cartes, transitions de page, gestes de swipe
- **Bundle** : ~39KB gzipped

### 3. Lucide React — Icônes
- **Site** : https://lucide.dev
- **Installation** : `npm install lucide-react`
- **~1500 icônes**, propre et moderne

### 4. TanStack Table — Tableaux de données
- **Site** : https://tanstack.com/table
- **Installation** : `npm install @tanstack/react-table`
- **Utile pour** : listes d'investisseurs/startups avec tri et filtrage avancés

### 5. Recharts — Graphiques
- **Site** : https://recharts.org
- **Installation** : `npm install recharts`
- **Utile pour** : statistiques, visualisation de données

---

## GitHub Repos à explorer

| Repo | Stars | Description |
|---|---|---|
| [shadcn/ui](https://github.com/shadcn-ui/ui) | 117K | Composants React + Tailwind |
| [creativoma/networkpro](https://github.com/creativoma/networkpro) | Nouveau | Networking Next.js + shadcn/ui |
| [react-force-graph](https://github.com/vasturiano/react-force-graph) | 2.5K | Visualisation de réseaux en 2D/3D |
| [framer-motion](https://github.com/framer/motion) | 24K | Animations React |
| [lucide](https://github.com/lucide-icons/lucide) | 17K | Icônes open source |
| [tailwindcss](https://github.com/tailwindlabs/tailwindcss) | 85K | CSS utility-first |

---

## Architecture frontend idéale (avec build)

```
connect-pro/
├── frontend/                # Vite + React
│   ├── src/
│   │   ├── components/      # shadcn/ui + composants métier
│   │   ├── pages/           # Pages de l'app
│   │   └── lib/             # Utilitaires
│   ├── package.json
│   └── vite.config.ts
├── static/                  # Build output
└── templates/               # Flask templates (fallback)
```

## Lot d'améliorations v3 (implémenté le 23/06/2026)

| Priorité | Feature | Détail |
|----------|---------|--------|
| 🔴 | **Dark/Light toggle** | Navbar + variables CSS + classe `.light` sur `<html>` |
| 🔴 | **Skeleton loaders** | `SkeletonCard` + `SkeletonDetail` avec animation shimmer |
| 🔴 | **Filter pills** | Filtrage par secteur avec bouton "Tous" (Startups + Chefs) |
| 🟡 | **Avatars status** | Indicateur online/away/busy sur tous les profils |
| 🟡 | **Dashboard analytics** | Recharts CDN : LineChart (tendances), PieChart (distribution), RadarChart (secteurs) |
| 🟡 | **Hero amélioré** | 2 beams lumineux animés, 7 particules flottantes, pulse ring central |
| 🟢 | **Navigation Analytics** | Nouvel onglet dans la navbar, page avec stats + 3 graphiques |

## Prochaines améliorations possibles

1. **Mode sombre/clair** — avec CSS variables et toggle
2. **Responsive mobile** — menu hamburger pour navbar
3. **Swipe matching** — cartes type Tinder avec drag gesture
4. **Notifications** en temps réel — via WebSocket
5. **Graphique de réseau** — visualisation des connexions avec force-graph
6. **Multi-langue** — FR/EN via i18n
7. **Accessibilité** — attributs ARIA, focus management
8. **Lazy loading** — code-splitting des grosses pages
9. **Progressive Web App** — améliorer le service worker
10. **Tests** — Jest + React Testing Library
