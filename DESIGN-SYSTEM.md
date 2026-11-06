# Design system « Vitamines » — instructions pour Claude Code

Ce dossier décrit le nouveau design du site **Vitamines** (React + Vite, dossier `vitamines/`).
Lis ce fichier en premier, puis `THEME-CLAIR.md` et `THEME-SOMBRE.md`.

- **Deux thèmes**, mêmes composants, mêmes noms de variables : seul l'attribut `data-theme` sur `<html>` change.
  - `light` → **Pastel naturel** (crème, sauge, pastels, formes douces)
  - `dark` → **Cyberpunk rétro** (noir mat, aplats mats brique/orange/kaki/gris, encre noire, capitales larges)
- **Ne casse aucune logique** (routes, contextes, appels API, état) : on ne change que le rendu.

---

## 1. Mise en place technique

1. Crée une branche `feat/design-system` depuis `dev`. Lis d'abord `src/App.css`, `src/index.css`, `src/Components/context/ThemeContext.jsx` et tous les composants de `src/Components/`, puis propose un plan court avant d'éditer.
2. Crée `src/styles/tokens.css` en copiant les blocs CSS de `THEME-CLAIR.md` (`:root, [data-theme="light"]`) et `THEME-SOMBRE.md` (`[data-theme="dark"]`), plus le bloc commun ci-dessous. Importe-le dans `main.jsx` **avant** `App.css`.
3. `ThemeContext` : applique `document.documentElement.dataset.theme = isDark ? "dark" : "light"`. Mémorise le choix dans `localStorage` (dans un `try/catch`), avec repli sur `prefers-color-scheme`.
4. Polices dans `index.html` :
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=Unbounded:wght@600;700;800&display=swap">
   ```
5. Réécris `App.css` en n'utilisant **que** les variables : plus aucune couleur en dur, plus de `rgba(255,255,255,…)` « verre », plus de fond violet `#8a66e8`, plus de styles inline (`GalleryErrorBanner`, `DarkButtonToggle`…).
6. Supprime les doublons et fautes de police (`'popyns'`, `font-family: Poppins` répétés) : une seule déclaration sur `body`.

### Bloc commun (dans `tokens.css`)

```css
:root {
  /* espacements */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px;
  /* rayons */
  --radius-xs: 6px; --radius-sm: 10px; --radius-md: 18px; --radius-lg: 28px; --radius-pill: 999px;
  /* familles */
  --font-nunito: "Nunito", system-ui, sans-serif;
  --font-fredoka: "Fredoka", "Nunito", sans-serif;
  --font-grotesk: "Space Grotesk", system-ui, sans-serif;
  --font-wide: "Unbounded", "Space Grotesk", sans-serif;
  --font-mono: "Space Mono", ui-monospace, monospace;
}
body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--font-sans); font-size: 16px; line-height: 26px; }
.vt-display { font-family: var(--font-display); text-transform: var(--display-case); letter-spacing: var(--display-track); font-weight: 600; color: var(--ink); margin: 0; }
:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
```

---

## 2. Rôles des variables (identiques dans les deux thèmes)

| Variable | Rôle |
|---|---|
| `--bg` | fond de page |
| `--surface` | cartes, panneaux, formulaires, nav |
| `--surface-raised` | champs, puces d'aliments, survol |
| `--ink` / `--ink-muted` | texte principal / secondaire (labels, unités, placeholders) |
| `--line` / `--line-strong` | filet décoratif / bordure de champ (≥ 3:1) |
| `--primary` / `--on-primary` | **seule couleur d'action** (boutons, lien actif, recherche, interrupteur) — VERTE dans les deux thèmes |
| `--leaf --peach --butter --lilac --sky --rose` | 6 accents (vitamines, catégories, panneaux) |
| `--on-accent` | texte posé sur n'importe quel accent |
| `--danger(-soft)` / `--success(-soft)` | erreurs / confirmations (toujours avec titre + icône) |
| `--focus` | anneau de focus |
| `--shadow-soft` / `--shadow-pop` | ombre des cartes / survol |
| `--font-sans` / `--font-display` | texte courant / titres (changent avec le thème) |

**Code couleur des vitamines** : liposolubles (A, D, E, K) → `--butter` ; hydrosolubles (B, C) → `--sky`. Couleur propre possible : A = `--peach`, B12 = `--leaf`, D = `--rose`, E = `--lilac`.

---

## 3. Règles de contenu

- Tout en **français**, vouvoiement. Libellés en casse phrase.
- Renommer : Home → **Accueil**, Login → **Connexion**, Logout → **Déconnexion**, About → **À propos**, Sign-in → **Connexion**, Sign-up → **Inscription**, Username → **Nom d'utilisateur**, Password → **Mot de passe**, Confirm password → **Confirmer le mot de passe**, Done → **Se connecter** / **Créer mon compte**, fonctions → **Fonctions**, Effects → **Effets**.
- Unités : « mg / jour », « µg / jour » (jamais « mg/J »). Ne pas mettre l'unité en `text-transform: uppercase` (le « µ » deviendrait « Μ »).
- **Pas d'emoji** dans l'interface (📧 ⚠️ 🔗) : icônes SVG trait 2px en `currentColor`.
- Messages d'erreur = la solution : « Les mots de passe ne correspondent pas. »
- **Tout est centré** : titres, panneaux, labels de champ, chiffres, puces. Jamais de texte justifié ; paragraphes courts.

---

## 4. Composants (classes à créer, préfixe `vt-`)

| Composant React existant | Nouveau rendu |
|---|---|
| `Layouts/NavBar` | `.vt-nav` : pilule `--surface` + `--shadow-soft`, liens `nav`, lien actif fond `--primary` texte `--on-primary`, `aria-current="page"` |
| `Inputs/DarkButtonToggle` | `.vt-toggle` : `<button role="switch" aria-checked>` 64×34, pastille 26px qui glisse ; icône soleil/lune en SVG `currentColor` (supprimer `soleil.svg`/`lune.png` inline) ; « on » = fond `--primary` |
| `Inputs/SearchInput` | `.vt-search` : champ pilule max 420px, bouton loupe rond `--primary` à droite, placeholder « Rechercher une vitamine » |
| `Vitamines/VitamineCard` | `.vt-bubble` : `<button>` rond 168px, fond `--tone` (accent de la vitamine), lettre 64px en `--font-display`, nom scientifique en petites capitales, famille ; survol : monte de 4px + `--shadow-pop` |
| `Vitamines/Quantity` | `.vt-qty` : unité au-dessus (13px), chiffre 64px en `--font-display` |
| `Vitamines/VitaminesDetails` | panneaux `.vt-panel` (voir pages) |
| Badges (famille, filtres) | `.vt-badge` : petite étiquette majuscule fond `--tone`, texte `--on-accent` |
| `Aliments/*` puces | `.vt-food` : pastille 64px `--surface-raised` avec l'image 40px + nom dessous (toujours afficher le nom) |
| `Layouts/GalleryErrorBanner` + notifications | `.vt-banner` (`--danger-soft` + bordure `--danger`, ou `--success-soft` + `--success`) avec icône + titre « Erreur de chargement » |
| `Aliments/AlimentsModal`, `AssociationModal` | `.vt-modal` : carte `--surface` max 520px, `--radius-lg`, bouton fermer rond (croix SVG `currentColor`, plus de croix rouge) |
| `Pages/Login`, `Pages/Register` | `.vt-auth` : carte max 400px (520px si champs côte à côte), titre `title`, `<label>` visibles au-dessus des champs, bouton `--primary` pleine largeur, lien vers l'autre page |
| Boutons | `.vt-btn-primary` (fond `--primary`) et `.vt-btn-ghost` (contour `--line-strong`) ; un seul primary par carte |

**Panneau `.vt-panel`** : fond `--surface`, `--radius-lg`, padding `--space-6`, contenu centré ; titre 24px en `--font-display` ; liste de faits `.vt-facts` (terme en gras + texte `--ink-muted`). La couleur du panneau vient de `--tone` (classe `.tone-peach`, `.tone-leaf`… qui fait `--tone: var(--peach)` etc.). Le rendu exact diffère selon le thème : voir les deux fichiers de thème.

**Page teintée `.vt-tinted`** (fiche vitamine) : le conteneur de page reçoit `background: var(--tone)` et `color: var(--on-accent)`. Ce qui est posé directement sur la couleur (logo, titre, sous-titre, pied de page) reçoit `.vt-on-tone` → `color: var(--on-accent)`. Les cartes `--surface` gardent leurs couleurs normales.

**Formes décoratives** (signature visuelle, `aria-hidden="true"`) : disques, pilules et un bloc arrondi `--primary` avec une grille 3×3 de pois couleur `--bg`, en couleurs d'accent. Jamais de dégradé, d'emoji ni d'illustration générée.

---

## 5. Pages

Toutes les pages : conteneur max 1200px centré, padding 24px ; en-tête = logo + « Vitamines » à gauche, `NavBar` au centre, interrupteur à droite ; pied de page centré « Vitamines — un projet étudiant, par des étudiants, pour des étudiants. » au-dessus d'un filet `--line`. Écart entre sections 48–64px.

1. **Accueil** (`Pages/Home`) — petite étiquette « 01 — Le guide des vitamines » ; titre `hero` 120px « Vitamines » ; sous-titre (max 560px) ; `SearchInput` ; frise de formes décoratives ; grande carte `--surface` « Toutes les vitamines » avec badges filtres (Toutes / Liposolubles / Hydrosolubles) et la galerie de bulles en `flex-wrap` centré (gap 28px) ; deux panneaux « Liposolubles — A · D · E · K » (`--butter`) et « Hydrosolubles — B · C » (`--sky`).
2. **Fiche vitamine** (`/vitamines/id/:id`) — page `.vt-tinted` à la couleur de la vitamine ; étiquette « Fiche 01 · Liposoluble » ; titre 128px « Vitamine A » ; sous-titre « Rétinol et bêta-carotène » ; rangée de 3 cartes `--surface` (Quantity, Famille, Stockage) ; grille 2 colonnes Description | Fonctions ; puis Effets (3/5) | « Où la trouver » (2/5, puces d'aliments). Masquer un panneau si la donnée manque (plus de panneau vide).
3. **À propos** — étiquette « 03 — Qui sommes-nous », titre, mini-frise ; panneaux « Un projet étudiant » (`--sky`) et « Notre objectif » (`--leaf`) ; trois cartes numérotées 01 Découvrir (`--butter`), 02 Comprendre (`--peach`), 03 Bientôt : les quiz (`--lilac`).
4. **Contact** — étiquette « 04 — Écrivez-nous », titre, phrase d'intro ; deux grandes cartes-liens pleine couleur (min 280px de haut) : E-mail (`--peach`) et LinkedIn (`--lilac`), texte `--on-accent`, flèche ↗ qui bouge au survol.
5. **Connexion / Inscription** — `.vt-auth` centrée au milieu d'une composition de formes décoratives en position absolue (disques, pilule, bloc `--primary`).

Tailles de référence : maquettes à 1440px de large. À 390px : la nav passe en menu burger (`BurgerMenuButton`), les grilles passent en 1 colonne, le titre `hero` descend à 56–64px.

---

## 6. Vérifications avant de terminer

- `npm run build` et `npm run lint` sans erreur.
- Contraste texte ≥ 4.5:1 dans **les deux** thèmes (3:1 pour ≥ 24px ou contrôles).
- Basculer l'interrupteur sur chaque page : tout change, rien ne reste en couleur codée en dur (`grep -nE "#[0-9a-fA-F]{3,8}|rgba?\(" src/App.css` ne doit renvoyer que `tokens.css`).
- Navigation au clavier : focus visible partout, bulles et nav atteignables au Tab.
- Commit sur `feat/design-system`, puis résumé des fichiers modifiés.
