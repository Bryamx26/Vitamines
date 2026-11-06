# Prompt Claude Code — Base de données Vitamines : tous les nutriments + nouvelle API

> Colle ce fichier dans Claude Code à la racine du repo `Vitamines` (branche `main`, qui contient `vitaminesApi/` et `docker-entrypoint/`). Mets aussi `nutriments.json` dans `vitaminesApi/data/nutriments.json`.

---

## Contexte

Le site **Vitamines** (React + Vite dans `vitamines/`, API Express + MySQL 8 dans `vitaminesApi/`, schéma dans `docker-entrypoint/vitamines_db.sql`) ne gère aujourd'hui que des vitamines, avec des données de test.
Je veux :

1. **De nouvelles tables** pour stocker tous les éléments de mes notes de nutrition : **13 vitamines** (A, D, E, K, C, B1, B2, B3, B5, B6, B8, B9, B12), **6 minéraux** (calcium, phosphore, magnésium, potassium, sodium, chlore) et **11 oligo-éléments** (fer, zinc, cuivre, sélénium, iode, manganèse, molybdène, chrome, fluor, silicium, bore).
2. **Remplir la base** à partir de `vitaminesApi/data/nutriments.json` (déjà rédigé à partir de mes notes).
3. **Faire évoluer l'API** (nouvelles routes `/api/nutriments`…) tout en gardant les anciennes routes `/api/vitamines…` et `/api/aliments/:nom` compatibles pour que le frontend actuel continue de fonctionner.

Ne touche pas au frontend dans cette tâche, sauf si une route compatible casse.

## Étape 0 — Lire avant d'écrire

Lis : `docker-entrypoint/vitamines_db.sql`, `vitaminesApi/index.js`, `db.js`, `models/*`, `controllers/*`, `routes/*`, `middlewares/*`, `swagger.js`, `docker-compose.yml` et `vitaminesApi/data/nutriments.json`.
Puis montre-moi un plan court (fichiers créés/modifiés) avant de coder. Travaille sur une branche `feat/nutriments`.

**Attention** :
- `docker-entrypoint/` n'est exécuté par MySQL qu'au **premier** démarrage (volume `mysql-data` vide). La migration doit donc aussi pouvoir s'appliquer sur une base existante, via un script Node.
- Le dump contient la table `users` (e-mails, hashes) : ne la modifie pas et ne recopie jamais son contenu ailleurs.

## Étape 1 — Vérifier les valeurs incertaines (web)

Dans `nutriments.json`, chaque apport a un champ `a_verifier`. Pour **chaque apport `a_verifier: true`** (16 au total) et chaque note qui contient « à vérifier » :

1. Cherche la valeur officielle en ligne, dans cet ordre de priorité :
   - Conseil Supérieur de la Santé, « Recommandations nutritionnelles pour la Belgique 2016 » (avis **CSS 9285**) ;
   - EFSA Dietary Reference Values (DRV Finder) ;
   - à défaut, une source institutionnelle (ANSES, OMS).
2. Si tu trouves la valeur : corrige `valeur_min` / `valeur_max` / `unite`, mets `source` au format « CSS 2016 » ou « EFSA 20xx », passe `a_verifier` à `false` et garde l'ancienne valeur dans `note` (« notes manuscrites : … »).
3. Si tu ne trouves pas de source fiable : laisse `a_verifier: true`.
4. À la fin, donne-moi un tableau : élément | valeur des notes | valeur trouvée | source (URL).

Points connus à vérifier en priorité : B6 (notes : H 3 mg / F 2 mg ?), B9 (folates 200–300 µg ?), vitamine D max (50 µg ?), vitamine E max (150 mg ?), cuivre (H 1,4 / F 1,2 mg ?), zinc végétarien (13 mg ?), potassium (3000–4000 mg ?), sodium (600–2000 mg ?), chlore (800–3000 mg ?), quantité de phosphore dans le corps (« 800–1200 mg » → probablement en grammes).

Ne change pas le reste du contenu (descriptions, fonctions, effets) : c'est le texte de mes notes.

## Étape 2 — Nouveau schéma

Crée `docker-entrypoint/02_nutriments.sql` (exécuté après le dump initial) **et** `vitaminesApi/migrations/001_nutriments.js` (même SQL, idempotent avec `CREATE TABLE IF NOT EXISTS`, lancé par `npm run migrate`).

```sql
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,          -- vitamine | mineral | oligo-element
  nom VARCHAR(100) NOT NULL,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS nutriments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(60) NOT NULL UNIQUE,          -- vitamine-a, fer, ...
  nom VARCHAR(100) NOT NULL,
  symbole VARCHAR(10),                       -- A, B12, Fe, Ca ...
  nom_scientifique VARCHAR(255),
  categorie_id INT NOT NULL,
  famille ENUM('liposoluble','hydrosoluble') NULL,
  tone ENUM('leaf','peach','butter','lilac','sky','rose') NULL,   -- couleur du design system
  couleur CHAR(7) NULL,                      -- hex (compatibilité ancien front)
  description TEXT,
  absorption TEXT, metabolisme TEXT, stockage TEXT, elimination TEXT,
  quantite_corps VARCHAR(255), unites TEXT, apports_note TEXT, aliments_source TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_nutriment_categorie FOREIGN KEY (categorie_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS nutriment_formes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutriment_id INT NOT NULL, nom VARCHAR(150) NOT NULL, description TEXT, ordre INT DEFAULT 0,
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- la table `fonctions` existe déjà : on la réutilise
CREATE TABLE IF NOT EXISTS nutriment_fonction (
  nutriment_id INT NOT NULL, fonction_id INT NOT NULL, ordre INT DEFAULT 0,
  PRIMARY KEY (nutriment_id, fonction_id),
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE,
  FOREIGN KEY (fonction_id) REFERENCES fonctions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS nutriment_effets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutriment_id INT NOT NULL,
  type ENUM('avantage','carence','exces','interaction') NOT NULL,
  description TEXT NOT NULL, ordre INT DEFAULT 0,
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS allegations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutriment_id INT NOT NULL, texte TEXT NOT NULL, source VARCHAR(100) DEFAULT 'EFSA',
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS apports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutriment_id INT NOT NULL,
  population ENUM('adulte','homme','femme','grossesse','allaitement','enfant') NOT NULL,
  type ENUM('recommande','adequat','max','min','supplement') NOT NULL,
  valeur_min DECIMAL(10,3) NOT NULL, valeur_max DECIMAL(10,3) NULL,
  unite VARCHAR(30) NOT NULL, source VARCHAR(120), note TEXT,
  a_verifier BOOLEAN NOT NULL DEFAULT 0,
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS aliment_nutriment (
  aliment_id BIGINT UNSIGNED NOT NULL, nutriment_id INT NOT NULL, teneur VARCHAR(60) NULL,
  PRIMARY KEY (aliment_id, nutriment_id),
  FOREIGN KEY (aliment_id) REFERENCES aliments(id) ON DELETE CASCADE,
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutriment_id INT NOT NULL,
  cible_nutriment_id INT NULL,               -- si la cible est un nutriment connu (via slug)
  cible_libre VARCHAR(120) NULL,             -- sinon texte (oxalates, anti-vitamine K…)
  type ENUM('favorise','diminue','synergie','depend','competition','aggrave','medicament') NOT NULL,
  description TEXT,
  FOREIGN KEY (nutriment_id) REFERENCES nutriments(id) ON DELETE CASCADE,
  FOREIGN KEY (cible_nutriment_id) REFERENCES nutriments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Ajoute aussi `UNIQUE (nom)` sur `fonctions` **seulement après** avoir dédoublonné (il y a des lignes de test « sss », « ss », « test », « bryam »…). Liste-les-moi et **demande-moi avant de supprimer** quoi que ce soit, y compris la vitamine de test (id 37 « test ») et l'aliment de test (id 35, id 27 « q »).

## Étape 3 — Migrer l'existant

Dans la migration :
- Copie chaque ligne de `vitamines` dans `nutriments` **en gardant le même `id`** (la Vitamine A a l'id 36 : le front l'appelle via `/vitamines/id/36`), avec `categorie = vitamine`, slug calculé (`vitamine-a`), et `couleur` repris.
- Copie `vitamine_fonction` → `nutriment_fonction`, `effets` → `nutriment_effets` (type `excès` → `exces`), `aliments_vitamines` → `aliment_nutriment`.
- Ne supprime pas les anciennes tables : renomme-les en `legacy_vitamines`, `legacy_vitamine_fonction`, `legacy_effets`, `legacy_aliments_vitamines` seulement quand l'API ne les utilise plus. Le `AUTO_INCREMENT` de `nutriments` doit repartir au-dessus du plus grand id existant.

## Étape 4 — Seed depuis `nutriments.json`

Crée `vitaminesApi/seed/seed-nutriments.js` (script `npm run seed`), **idempotent** (relançable sans doublon), dans une transaction :

- `categories` : upsert par `code`.
- `nutriments` : upsert par `slug`. Pour `vitamine-a`, mets à jour la ligne existante (id 36) au lieu d'en créer une nouvelle (correspondance par `nom = 'Vitamine A'` si le slug n'existe pas encore). Mets `couleur` = valeur claire du token `tone` : leaf `#c5dcb2`, peach `#f8cdb3`, butter `#f6e5a6`, lilac `#d9cff2`, sky `#c2dfec`, rose `#f4c3cf`.
- Pour chaque nutriment, remplace (delete + insert) ses `nutriment_formes`, `nutriment_effets`, `allegations`, `apports` et `interactions`. Les fonctions : upsert dans `fonctions` par `nom` (la description du JSON gagne), puis relie-les dans `nutriment_fonction` avec `ordre`.
- `aliments` : pour chaque nom de `aliments[]`, cherche un aliment existant sans tenir compte de la casse ni des accents (« lait » = « Lait », « Oeuf » = « Œuf », « Boeuf » = « Bœuf »). S'il n'existe pas, crée-le avec `path = NULL` et un `type` déduit (fruit, legume, viande, poisson, produit-laitier, cereale, legumineuse, oleagineux, boisson, autre). Puis remplace les liens `aliment_nutriment` du nutriment.
- `interactions` : la `cible` est un slug de nutriment → `cible_nutriment_id` ; sinon (« oxalates », « medicament:anti-vitamine K ») → `cible_libre`. Passe en deux temps (tous les nutriments d'abord, puis les interactions).
- Affiche un résumé : nombre de nutriments, d'apports, d'aliments créés et d'apports encore `a_verifier`.

## Étape 5 — API

Structure : `models/nutriments.js`, `controllers/nutriments-controller.js`, `routes/nutriments-routes.js` et une doc Swagger pour chaque route.

### Lecture (publique)

| Route | Retour |
|---|---|
| `GET /api/categories` | catégories + nombre de nutriments |
| `GET /api/nutriments?categorie=vitamine&famille=hydrosoluble&q=fer` | liste légère : id, slug, nom, symbole, nom_scientifique, categorie, famille, tone, couleur, apport adulte principal |
| `GET /api/nutriments/:idOuSlug` | objet complet : champs + formes, fonctions, effets groupés par type, allegations, apports, aliments (id, nom, path), interactions |
| `GET /api/nutriments/:idOuSlug/apports` (et `/fonctions`, `/effets`, `/formes`, `/aliments`, `/interactions`, `/allegations`) | la sous-liste |
| `GET /api/aliments/:id/nutriments` | nutriments d'un aliment |

Le paramètre `:idOuSlug` est un nombre (id) ou un slug. Renvoie 404 avec `{ error }` s'il n'existe pas, et pense au `return` (le controller actuel `getVitamine` envoie deux réponses).

### Écriture (protégée)

- `POST /api/nutriments`, `PUT /api/nutriments/:id`, `DELETE /api/nutriments/:id`, `PUT /api/nutriments/:id/aliments`.
- Protège-les avec `authMiddleware` **et** un middleware `requireAdmin` (`req.user.role === 'admin'`).
- Corps identique à l'objet complet, dans une transaction.
- Invalide le cache (`clearAllCache`) après chaque écriture. Le `cacheMiddleware` actuel est posé sur les POST/PUT/DELETE, où il ne sert à rien : mets-le plutôt sur les GET de lecture.

### Compatibilité avec le front actuel (obligatoire)

Garde les routes existantes, réécrites au-dessus des nouvelles tables, avec **la même forme de réponse** :
- `GET /api/vitamines` → nutriments de catégorie `vitamine`, avec les champs `id, nom, description, couleur, nom_scientifique, gramage`. `gramage` = valeur_min de l'apport adulte ou homme principal.
- `GET /api/vitamines/:id` → **tableau** d'un élément (le front lit `data[0]`).
- `GET /api/vitamines/:id/effects` → `[{ id, type_effet, description }]` avec `exces` renvoyé en `excès`.
- `GET /api/vitamines/:id/fonctions` → `[{ id, nom, description }]`.
- `GET /api/aliments/:nom` (nom de vitamine) → `[{ nom, aliment, vitamine }]` via `aliment_nutriment`.
- `POST/PUT/DELETE /api/vitamines…` → délèguent aux nouvelles fonctions (protégées admin).

Corrige au passage, dans `aliments-controller`, les `catch` qui ne renvoient aucune réponse (`res.status(500)`).

## Étape 6 — Vérifications avant de terminer

1. `docker compose up -d mysql`, puis `npm run migrate` et `npm run seed` deux fois : le deuxième passage ne doit créer aucun doublon.
2. Requêtes SQL de contrôle : 30 nutriments (13 / 6 / 11 par catégorie), chaque nutriment a une description, chaque vitamine a au moins un apport (sauf mention `apports_note`), aucun aliment en double (insensible à la casse et aux accents).
3. Lance l'API et teste avec `curl` :
   - `/api/nutriments?categorie=oligo-element` ;
   - `/api/nutriments/vitamine-b12` ;
   - `/api/nutriments/fer/apports` ;
   - les routes de compatibilité `/api/vitamines`, `/api/vitamines/36`, `/api/vitamines/36/effects`, `/api/aliments/Vitamine%20A`.
4. Écriture : sans token → 401 ; token d'un utilisateur non admin → 403.
5. Lance le front (`npm run dev` dans `vitamines/`) et vérifie que l'accueil et la fiche Vitamine A fonctionnent toujours.
6. Commit sur `feat/nutriments`, puis donne-moi :
   - le résumé des fichiers ;
   - le tableau des valeurs vérifiées de l'étape 1 ;
   - la liste des lignes de test que tu proposes de supprimer.
