# Vitamines

**Le guide des vitamines et des minéraux, par des étudiants, pour des étudiants.**

Vitamines est une application web qui explique simplement le rôle des nutriments essentiels : à quoi sert chaque vitamine ou minéral, combien en consommer par jour, ce qui se passe en cas de carence ou d'excès, et dans quels aliments les trouver. Le projet est né des notes de cours « Nut & Diet » et vise un contenu clair, visuel et vérifié.

- Site : <https://vitamines.bryamsilva.online>
- API : <https://api.bryamsilva.online/api> (documentation interactive sur `/api-docs`)

---

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Architecture](#architecture)
3. [Démarrer en local](#démarrer-en-local)
4. [Mise en production](#mise-en-production)
5. [Exploitation](#exploitation)
6. [Référence de l'API](#référence-de-lapi)
7. [Données et sources](#données-et-sources)
8. [Structure du dépôt](#structure-du-dépôt)
9. [État du projet et limites connues](#état-du-projet-et-limites-connues)

---

## Fonctionnalités

**Pour les visiteurs**
- 30 nutriments documentés : 13 vitamines, 6 minéraux et 11 oligo-éléments.
- Recherche par nom, filtres par famille (liposolubles / hydrosolubles).
- Fiche détaillée : description, apport conseillé, famille, stockage, fonctions, effets (bienfaits, carences, excès) et aliments sources.
- Deux thèmes, clair « Pastel naturel » et sombre « Pastel nocturne », mémorisés et alignés sur la préférence du système.
- Interface en français, responsive (menu burger sur mobile), navigable au clavier.

**Pour les administrateurs**
- Création, modification et suppression des vitamines.
- Association des aliments aux vitamines, ajout d'aliments avec image.

**Pour les développeurs**
- API REST publique en lecture, documentée avec Swagger.
- Écritures protégées par JWT (RS256) et rôle `admin`.

## Architecture

```
            ┌──────────────────────────┐
 navigateur │ frontend (nginx :8080)   │  React 19 + Vite, build statique
     ──────▶│ vitamines.bryamsilva…    │
            └────────────┬─────────────┘
                         │ fetch https://api.bryamsilva.online/api
            ┌────────────▼─────────────┐
            │ api (Node 22 :3000)      │  Express 5, JWT RS256, cache mémoire
            └────────────┬─────────────┘
                         │ mysql2 (réseau Docker « backend »)
            ┌────────────▼─────────────┐
            │ mysql (MySQL 8.0 :3306)  │  données dans ./mysql-data
            └──────────────────────────┘
```

| Service | Image / build | Port publié | Rôle |
|---|---|---|---|
| `mysql` | `mysql:8.0` | aucun | Base `vitamines_db`, initialisée depuis `docker-entrypoint/` |
| `api` | `./vitaminesApi` | `3000` | API REST (utilisateur non root `api`) |
| `frontend` | `./vitamines` | `80 → 8080` | Fichiers statiques servis par nginx (utilisateur non root) |

**Stack** : React 19, React Router 7, Vite 7 · Node 22, Express 5, mysql2, jsonwebtoken, bcrypt, multer, swagger-jsdoc · MySQL 8 · Docker Compose.

Le front choisit l'URL de l'API selon le domaine (`vitamines/src/Components/context/APIContext.jsx`) : `http://localhost:3000/api` en local, `https://api.bryamsilva.online/api` sinon.

## Démarrer en local

Prérequis : Docker et Docker Compose v2, `openssl`.

```bash
git clone <url-du-dépôt> vitamines && cd vitamines
cp .env.example .env            # puis remplacez les valeurs (voir ci-dessous)
docker compose up -d --build
docker compose exec api npm run migrate
docker compose exec api npm run seed
```

- Site : <http://localhost>
- API : <http://localhost:3000/api/nutriments>
- Documentation : <http://localhost:3000/api-docs>

Pour travailler sur le front avec rechargement à chaud :

```bash
cd vitamines && npm ci && npm run dev    # http://localhost:5173, API sur :3000
```

## Mise en production

### 1. Prérequis

- Un serveur Linux avec Docker Engine et Docker Compose v2.
- Deux enregistrements DNS vers ce serveur : `vitamines.bryamsilva.online` et `api.bryamsilva.online`.
- Un reverse proxy HTTPS sur l'hôte (exemple avec Caddy plus bas). Les conteneurs ne servent que du HTTP.

### 2. Avant la première installation

Ces points sont **bloquants** : voir aussi [limites connues](#état-du-projet-et-limites-connues).

1. **Comptes du dump** : `docker-entrypoint/01_vitamines_db.sql` contient deux comptes administrateurs et des données de test. Supprimez le bloc `INSERT INTO users` (et les lignes de test) avant une installation neuve, puis créez votre admin comme indiqué à l'étape 6.
2. **Mots de passe** : choisissez des mots de passe MySQL forts et uniques. Les anciens mots de passe de développement apparaissent dans l'historique git : ne les réutilisez pas.
3. **Clés JWT** : générez une paire de clés dédiée à la production (étape 3). Ne copiez pas de fichier `.pem` dans `vitaminesApi/` : sans `.dockerignore`, il serait embarqué dans l'image.

### 3. Configurer l'environnement

```bash
cp .env.example .env
chmod 600 .env
```

Renseignez `DOCKER_ROOT_PASSWORD`, `DOCKER_USER`, `DOCKER_PASSWORD` (et gardez `DOCKER_DATABASE=vitamines_db`, `DOCKER_DATABASE_HOST=mysql`).

**Générer les clés JWT** (en dehors du dépôt) :

```bash
cd /tmp
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out jwt-private.pem
openssl pkey -in jwt-private.pem -pubout -out jwt-public.pem
# Écrit les clés sur une ligne dans le .env du projet
sed -i '/^JWT_PRIVATE=/d;/^JWT_PUBLIC=/d' /chemin/vers/vitamines/.env
printf 'JWT_PRIVATE="%s"\n' "$(awk 'BEGIN{ORS="\\n"}1' jwt-private.pem)" >> /chemin/vers/vitamines/.env
printf 'JWT_PUBLIC="%s"\n'  "$(awk 'BEGIN{ORS="\\n"}1' jwt-public.pem)"  >> /chemin/vers/vitamines/.env
shred -u jwt-private.pem jwt-public.pem
```

| Variable | Utilisée par | Description |
|---|---|---|
| `DOCKER_ROOT_PASSWORD` | mysql | Mot de passe root MySQL |
| `DOCKER_DATABASE` | mysql, api | Nom de la base (`vitamines_db`) |
| `DOCKER_USER` / `DOCKER_PASSWORD` | mysql, api | Compte applicatif MySQL |
| `DOCKER_DATABASE_HOST` | api | Hôte MySQL vu par l'API (`mysql`) |
| `JWT_PRIVATE` / `JWT_PUBLIC` | api | Clés RS256 qui signent et vérifient les tokens (validité 6 h) |

### 4. Ports : passer derrière le reverse proxy

En production, n'exposez pas directement l'API et nginx sur Internet. Dans `docker-compose.yml`, liez les ports à la boucle locale et ajoutez un redémarrage automatique :

```yaml
  api:
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"

  frontend:
    restart: unless-stopped
    ports:
      - "127.0.0.1:8081:8080"
```

Exemple de `/etc/caddy/Caddyfile` (certificats HTTPS automatiques) :

```caddy
vitamines.bryamsilva.online {
    encode gzip
    header {
        Strict-Transport-Security "max-age=31536000"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
    reverse_proxy 127.0.0.1:8081
}

api.bryamsilva.online {
    encode gzip
    reverse_proxy 127.0.0.1:3000
}
```

### 5. Lancer

```bash
docker compose up -d --build
docker compose ps                         # mysql, api et frontend « Up »
docker compose exec api npm run migrate   # crée/complète le schéma (idempotent)
docker compose exec api npm run seed      # charge les 30 nutriments (idempotent)
```

Au **premier** démarrage seulement (dossier `mysql-data/` vide), MySQL exécute `docker-entrypoint/01_vitamines_db.sql` puis `02_nutriments.sql`. La migration reprend ensuite les anciennes tables (copie en gardant les id, puis renommage en `legacy_*`) et le seed remplit les nutriments.

### 6. Créer le compte administrateur

1. Inscrivez-vous sur le site (page « Inscription »).
2. Donnez-lui le rôle admin :

```bash
docker compose exec mysql sh -c \
  'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" vitamines_db -e "UPDATE users SET role = '"'"'admin'"'"' WHERE email = '"'"'vous@exemple.be'"'"';"'
```

3. Reconnectez-vous : le rôle est lu dans le token au moment de la connexion.

### 7. Vérifier

```bash
curl -s https://api.bryamsilva.online/api/categories          # 3 catégories
curl -s https://api.bryamsilva.online/api/nutriments/fer/apports
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://api.bryamsilva.online/api/nutriments   # 401
```

Puis ouvrez <https://vitamines.bryamsilva.online>, basculez le thème, ouvrez une fiche et connectez-vous en admin.

## Exploitation

**Mettre à jour**

```bash
git pull
docker compose up -d --build
docker compose exec api npm run migrate
```

Relancez `npm run seed` seulement si `vitaminesApi/data/nutriments.json` a changé : il remplace les fonctions, effets, apports et aliments des 30 nutriments par le contenu du fichier.

**Sauvegarder** (à planifier, par exemple chaque nuit via cron) :

```bash
docker compose exec -T mysql sh -c \
  'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --no-tablespaces vitamines_db' \
  | gzip > "backup-vitamines-$(date +%F).sql.gz"
```

La sauvegarde contient la table `users` (e-mails et hashs) : stockez-la chiffrée, hors du serveur.

**Restaurer**

```bash
gunzip -c backup-vitamines-AAAA-MM-JJ.sql.gz | docker compose exec -T mysql sh -c \
  'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" vitamines_db'
```

**Journaux** : `docker compose logs -f api` (l'API journalise les accès au cache et les erreurs).

**Cache** : les réponses GET sont gardées 6 h en mémoire et vidées à chaque écriture. Un `docker compose restart api` les vide aussi.

## Référence de l'API

Toutes les routes sont préfixées par `/api`. La documentation complète, avec les schémas, est sur `/api-docs`.

**Lecture (publique)**

| Méthode | Route | Description |
|---|---|---|
| GET | `/categories` | Catégories et nombre de nutriments |
| GET | `/nutriments?categorie=&famille=&q=` | Liste légère avec l'apport principal |
| GET | `/nutriments/:idOuSlug` | Fiche complète (formes, fonctions, effets, allégations, apports, aliments, interactions) |
| GET | `/nutriments/:idOuSlug/{apports,fonctions,effets,formes,aliments,interactions,allegations}` | Une sous-liste |
| GET | `/aliments` | Tous les aliments |
| GET | `/aliments/:id/nutriments` | Nutriments d'un aliment |
| GET | `/vitamines`, `/vitamines/:id`, `/vitamines/:id/effects`, `/vitamines/:id/fonctions`, `/aliments/:nomVitamine` | Routes historiques, même format qu'avant (utilisées par le front) |

**Écriture (token admin : `Authorization: Bearer <token>`)**

| Méthode | Route |
|---|---|
| POST | `/nutriments` |
| PUT / DELETE | `/nutriments/:idOuSlug` |
| PUT | `/nutriments/:idOuSlug/aliments` |
| POST / PUT / DELETE | `/vitamines`, `/vitamines/:id` |

**Comptes** : `POST /auth` (connexion, renvoie le token) et `POST /register` (inscription).

Exemple :

```bash
curl -s "https://api.bryamsilva.online/api/nutriments?categorie=mineral" | jq '.[].nom'
```

## Données et sources

- Contenu rédigé à partir des notes de cours « Nut & Diet Q2 », dans `vitaminesApi/data/nutriments.json`.
- Apports vérifiés d'après le Conseil Supérieur de la Santé, *Recommandations nutritionnelles pour la Belgique 2016* (avis 9285), puis l'EFSA. Chaque apport indique sa `source` ; la valeur des notes d'origine est conservée dans `note` quand elle a été corrigée.
- Les informations sont fournies à titre éducatif et ne remplacent pas un avis médical.

## Structure du dépôt

```
docker-compose.yml          orchestration des 3 services
.env.example                modèle de configuration
docker-entrypoint/          SQL exécuté au premier démarrage de MySQL
  01_vitamines_db.sql       dump initial (tables historiques)
  02_nutriments.sql         schéma nutriments (généré par la migration)
vitaminesApi/               API Express
  index.js, db.js           point d'entrée, connexion MySQL
  routes/ controllers/ models/ middlewares/
  migrations/001_nutriments.js   npm run migrate
  seed/seed-nutriments.js        npm run seed
  data/nutriments.json           contenu des 30 nutriments
vitamines/                  front React + Vite
  src/styles/tokens.css     variables du design system (thèmes)
  src/App.css               composants « vt- »
  src/Components/           pages, layouts, contextes
  nginx.conf, Dockerfile    image de production
DESIGN-SYSTEM.md, THEME-*.md  spécifications du design
```

## État du projet et limites connues

**Branches** : le nouveau design du front est sur `feat/design-system` puis `feat/accueil-design` ; la nouvelle base et l'API sur `feat/nutriments`. Elles partent toutes de `dev` et doivent être fusionnées avant la mise en production. Le front n'utilise encore que les routes `/api/vitamines` : les minéraux et oligo-éléments sont disponibles dans l'API mais pas encore affichés.

**À corriger avant une mise en production publique** (détails dans l'audit) :

- `POST /uploadAliment`, `POST /aliments/associate` et `DELETE /aliments/dissociate` ne demandent pas d'authentification ; l'upload accepte des SVG et écrit dans un dossier qui n'existe pas dans le conteneur (fonction cassée en Docker).
- Pas de `.dockerignore` : tout le dossier (dont d'éventuels `.pem` ou `.env`) est copié dans les images.
- `/auth` n'a aucune limite de tentatives ; le token est stocké dans `localStorage` et la page de connexion l'écrit dans la console.
- CORS ouvert à toutes les origines, Swagger public, aucun en-tête de sécurité côté API.
- Cache mémoire sans limite de taille (une entrée par URL différente).
- Pas de tests automatisés ni d'intégration continue.
