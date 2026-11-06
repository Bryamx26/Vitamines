# Thème sombre — « Pastel nocturne » (`data-theme="dark"`)

Le thème sombre est **le même design que le clair, en version sombre** : mêmes polices (Fredoka + Nunito), mêmes formes arrondies, mêmes pastels, mêmes ombres douces, même mise en page centrée. **Seules les couleurs changent.** Aucune règle CSS propre au thème sombre n'est nécessaire en dehors de ces variables (sauf le voile des modales).
Les règles communes sont dans `DESIGN-SYSTEM.md`, le rendu des composants dans `THEME-CLAIR.md`.

## Variables

```css
[data-theme="dark"] {
  --bg: #0a0d0a;              /* presque noir teinté de vert */
  --surface: #242c22;
  --surface-raised: #30392d;
  --ink: #eef0e6;             /* blanc crème */
  --ink-muted: #a9b2a0;
  --line: #3a4436;
  --line-strong: #7a8672;
  --primary: #8fbf84;         /* sauge lumineuse — action */
  --on-primary: #132011;
  --focus: #8fbf84;

  --leaf: #a9c99b;            /* sauge */
  --peach: #eab49b;           /* pêche */
  --butter: #e5d391;          /* beurre */
  --lilac: #c0b3e6;           /* lilas */
  --sky: #a7cbdc;             /* ciel */
  --rose: #e4aab9;            /* rose */
  --on-accent: #1c2419;       /* texte foncé sur les pastels */

  --danger: #f08c78;  --danger-soft: #3a221c;
  --success: #93cf88; --success-soft: #1d2c1a;

  --shadow-soft: 0 0 0 1px rgba(238, 240, 230, 0.07), 0 10px 30px rgba(0, 0, 0, 0.5);
  --shadow-pop: 0 0 0 1px rgba(238, 240, 230, 0.1), 0 18px 44px rgba(0, 0, 0, 0.6);

  --font-sans: var(--font-nunito);
  --font-display: var(--font-fredoka);
  --display-case: none;
  --display-track: -0.02em;
}
[data-theme="dark"] .vt-modal-scrim { background: rgba(0, 0, 0, .55); }
```

Contrastes vérifiés : `ink` sur bg 17:1, sur cartes ≥ 10.4:1 · `ink-muted` ≥ 5.5:1 · `on-primary` sur `primary` 8:1 · chaque pastel et le vert `primary` sur le fond ≥ 9:1 · `on-accent` sur chaque pastel ≥ 8.1:1 · `line-strong` sur surface 3.8:1. Le fond très profond fait ressortir les cartes (liseré clair à 7 %) et les bulles pastel.

## Rendu

Identique au thème clair (voir `THEME-CLAIR.md`) :
- boutons en pilule vert sauge, texte foncé ;
- nav en pilule `--surface` avec ombre douce, lien actif vert ;
- bulles de vitamine = disques pastel pleins, lettre Fredoka foncée ;
- panneaux = cartes `--surface` arrondies 28px avec pastille de couleur avant le titre ;
- page teintée (fiche vitamine) = fond pastel de la vitamine, texte `--on-accent`, cartes `--surface` sombres posées dessus ;
- formes décoratives pastel (disques, pilules, bloc vert).

Les pastels sont un peu plus profonds qu'en clair pour ne pas éblouir sur le fond sombre.
