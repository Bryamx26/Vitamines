# Thème clair — « Pastel naturel » (`data-theme="light"`)

Ambiance : naturel, doux, chaleureux, rassurant. Crème, sauge et pastels ; formes rondes et généreuses ; ombres légères.
Les règles communes (rôles des variables, composants, pages) sont dans `DESIGN-SYSTEM.md`.

## Variables

```css
:root, [data-theme="light"] {
  --bg: #f7f2e8;              /* crème */
  --surface: #fffbf4;
  --surface-raised: #eef2e4;
  --ink: #2e3a2b;             /* vert olive très foncé */
  --ink-muted: #5b6656;
  --line: #ddd5c4;
  --line-strong: #7f8a78;
  --primary: #4a7343;         /* sauge profonde — action */
  --on-primary: #ffffff;
  --focus: #4a7343;

  --leaf: #c5dcb2;            /* sauge */
  --peach: #f8cdb3;           /* pêche */
  --butter: #f6e5a6;          /* beurre */
  --lilac: #d9cff2;           /* lilas */
  --sky: #c2dfec;             /* ciel */
  --rose: #f4c3cf;            /* rose */
  --on-accent: #2e3a2b;

  --danger: #a8402c;  --danger-soft: #f7ddd5;
  --success: #3d6e37; --success-soft: #e2eed9;

  --shadow-soft: 0 10px 30px rgba(74, 88, 60, 0.12);
  --shadow-pop: 0 18px 44px rgba(74, 88, 60, 0.18);

  --font-sans: var(--font-nunito);
  --font-display: var(--font-fredoka);
  --display-case: none;
  --display-track: -0.02em;
}
```

Contrastes vérifiés : `ink` sur bg/surface ≥ 10.5:1 · `ink-muted` ≥ 5.3:1 · blanc sur `primary` 5.5:1 · `on-accent` sur chaque pastel ≥ 7.7:1 · `line-strong` sur surface 3.5:1.

## Typographie

| Style | Police | Taille / interligne | Graisse | Usage |
|---|---|---|---|---|
| hero | Fredoka | 120px (128px fiche) / 0.92 | 600 | titre de page |
| title | Fredoka | 44px / 1.05 | 600 | titre de carte formulaire, modale, section |
| stat | Fredoka | 64px / 1 | 700 | chiffre d'apport, lettre de bulle |
| heading | Fredoka | 24px / 30px | 600 | titre de panneau |
| body | Nunito | 16px / 26px (18/30 en intro) | 400 | texte courant |
| body-sm | Nunito | 14px / 22px | 400 | aide, liens secondaires |
| label | Nunito | 13px / 18px, +0.04em, MAJUSCULES | 600 | labels, badges, étiquettes « 01 — … » |
| nav | Nunito | 15px / 20px | 600 | liens de navigation |

## Rendu des composants en clair

- **Boutons** : pilule (`--radius-pill`), primary fond `--primary` texte blanc ; ghost = contour 1.5px `--line-strong`. Survol : `translateY(-1px)`.
- **Nav** : pilule `--surface` + `--shadow-soft`, lien actif pilule verte.
- **Champs** : fond `--surface-raised`, bordure 1.5px `--line-strong`, `--radius-md` (recherche en pilule) ; focus → bordure `--focus`.
- **Bulles de vitamine** : disque plein de la couleur pastel, lettre Fredoka 64px `--on-accent`, `--shadow-soft`.
- **Panneaux** : carte `--surface` `--radius-lg` avec ombre douce ; titre précédé d'une **pastille ronde 12px** couleur `--tone`.
- **Puces d'aliments** : rond 64px `--surface-raised` avec liseré `--line`.
- **Quantity** : chiffre Fredoka `--ink`.
- **Badges** : pilule fond `--tone`.
- **Page teintée** (fiche) : fond pastel de la vitamine, titres `--on-accent`, cartes crème posées dessus.
- **Formes décoratives** : bloc arrondi 28px sauge profonde avec pois crème, disques et pilules pastel.
