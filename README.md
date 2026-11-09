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
4. [Variables d'environnement](#variables-denvironnement)
5. [Mise en production](#mise-en-production)
6. [Exploitation](#exploitation)
7. [Référence de l'API](#référence-de-lapi)
8. [Données et sources](#données-et-sources)
9. [Structure du dépôt](#structure-du-dépôt)
10. [État du projet et limites connues](#état-du-projet-et-limites-connues)

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
| `api` | `./vitaminesApi` | `127.0.0.1:3000` | API REST (utilisateur non root, UID `APP_UID`) |
| `frontend` | `./vitamines` | `127.0.0.1:80 → 8080` | Fichiers statiques servis par nginx (utilisateur non root) |

Les images d'aliments (`vitamines/public/images/alimentsImages`) sont montées dans les deux conteneurs : l'API y écrit les images envoyées par les admins, nginx les sert en lecture seule.

**Stack** : React 19, React Router 7, Vite 7 · Node 22, Express 5, mysql2, jsonwebtoken, bcrypt, multer, swagger-jsdoc · MySQL 8 · Docker Compose.

Le front choisit l'URL de l'API selon le domaine (`vitamines/src/Components/context/APIContext.jsx`) : `http://localhost:3000/api` en local, `https://api.bryamsilva.online/api` sinon.

## Démarrer en local

Prérequis : Docker et Docker Compose v2, `openssl`.

```bash
git clone <url-du-dépôt> vitamines && cd vitamines
cp .env.example .env            # puis remplacez les valeurs (voir « Variables d'environnement »)
docker compose up -d --build
```

La base est créée et remplie au premier démarrage par `docker-entrypoint/init.sql` : rien d'autre à lancer.

- Site : <http://localhost>
- API : <http://localhost:3000/api/nutriments>
- Documentation : <http://localhost:3000/api-docs>

Pour travailler sur le front avec rechargement à chaud :

```bash
cd vitamines && npm ci && npm run dev    # http://localhost:5173, API sur :3000
```

## Variables d'environnement

Toute la configuration passe par le fichier `.env` à la racine (modèle : `.env.example`). Il contient des secrets : jamais commité, droits `chmod 600`.

Les variables sont lues à deux moments différents :

- **au démarrage** des conteneurs : un `docker compose up -d` suffit après modification ;
- **au build** de l'image frontend (`VITE_API_URL`) : la valeur est écrite dans le JavaScript, il faut **reconstruire l'image** pour la changer. Modifier le `.env` d'un serveur qui ne fait que `pull` une image n'a aucun effet.

### Base de données (MySQL)

| Variable | Exemple | Description |
|---|---|---|
| `DOCKER_ROOT_PASSWORD` | `un-mot-de-passe-long` | Mot de passe `root` de MySQL. Utilisé seulement par le conteneur MySQL (et pour l'administration manuelle). |
| `DOCKER_DATABASE` | `vitamines_db` | Nom de la base, créée au premier démarrage. |
| `DOCKER_USER` | `vitamines` | Utilisateur MySQL utilisé par l'API. |
| `DOCKER_PASSWORD` | `un-autre-mot-de-passe` | Mot de passe de cet utilisateur. |
| `DOCKER_DATABASE_HOST` | `mysql` | Hôte de la base vu depuis l'API : le nom du service dans `docker-compose.yml`. |

Les identifiants MySQL ne sont appliqués qu'à la **création** de la base (dossier `mysql-data/` vide). Les changer ensuite dans le `.env` ne modifie pas la base existante.

### Authentification

| Variable | Exemple | Description |
|---|---|---|
| `JWT_PRIVATE` | `"-----BEGIN PRIVATE KEY-----\n...\n"` | Clé privée RS256 qui signe les tokens, sur une seule ligne (retours à la ligne écrits `\n`). Voir « Générer les clés JWT ». |
| `JWT_PUBLIC` | `"-----BEGIN PUBLIC KEY-----\n...\n"` | Clé publique correspondante, qui vérifie les tokens. |

Changer les clés déconnecte tous les utilisateurs (les tokens existants deviennent invalides).

### Exécution de l'API

| Variable | Exemple | Description |
|---|---|---|
| `NODE_ENV` | `production` | `production` désactive Swagger et active HSTS. `development` par défaut. |
| `CORS_ORIGINS` | `https://vitamines.bryam.tech` | Origines autorisées à appeler l'API, séparées par des virgules. Vide = liste par défaut (localhost et ancien domaine). |
| `TRUST_PROXY` | `1` ou `loopback,linklocal,uniquelocal` | Derrière un reverse proxy : nombre de proxys, ou plages d'IP de confiance, pour que la limite de tentatives voie l'IP réelle du visiteur. Vide = pas de proxy. |
| `API_DOCS` | `true` | Force la documentation Swagger (`/api-docs`) même en production. Facultatif. |

### Premier administrateur

| Variable | Exemple | Description |
|---|---|---|
| `ADMIN_EMAIL` | `vous@exemple.be` | Email du compte admin créé au démarrage de l'API. Vide = aucun compte créé. |
| `ADMIN_PASSWORD` | `UnVraiMotDePasse42` | Son mot de passe : 8 caractères minimum, une lettre et un chiffre ; valeurs d'exemple refusées. À vider après la première connexion. |
| `ADMIN_NOM` | `Administrateur` | Nom affiché du compte (par défaut `Administrateur`). |

Le compte n'est créé que si **aucun** administrateur n'existe : rien n'est écrasé aux redémarrages. Résultat visible avec `docker compose logs api | grep admin`.

### Docker

| Variable | Exemple | Description |
|---|---|---|
| `APP_UID` / `APP_GID` | `1000` | Utilisateur et groupe de l'hôte (`id -u` / `id -g`) sous lesquels tourne l'API, pour qu'elle puisse écrire dans le dossier des images d'aliments. |
| `API_BIND` | `127.0.0.1` | Interface sur laquelle le port 3000 de l'API est publié. `127.0.0.1` = machine seulement, `0.0.0.0` = réseau local. |
| `FRONT_BIND` | `127.0.0.1` | Idem pour le site. |
| `FRONT_PORT` | `80` | Port de l'hôte sur lequel le site est publié. |

Derrière Traefik (réseau Docker partagé), ces trois dernières variables sont inutiles : aucun port n'est publié.

### Frontend (au build)

| Variable | Exemple | Description |
|---|---|---|
| `VITE_API_URL` | `https://api-vitamines.bryam.tech` | URL publique de l'API, **sans** `/api`. Utilisée quand le site est ouvert depuis un vrai domaine (en `localhost` ou `192.168.x.x`, le front appelle `http://<hôte>:3000`). |

Pour la changer, reconstruire et publier l'image :

```bash
VITE_API_URL=https://api-vitamines.bryam.tech docker compose build frontend --builder multi --push
```

Variables fixées directement dans `docker-compose.yml` (pas dans le `.env`) : `ALIMENTS_IMAGES_DIR` (dossier des images dans le conteneur API) et `PORT` (3000 par défaut).

## Mise en production

### 1. Prérequis

- Un serveur Linux avec Docker Engine et Docker Compose v2.
- Deux enregistrements DNS vers ce serveur : `vitamines.bryamsilva.online` et `api.bryamsilva.online`.
- Un reverse proxy HTTPS sur l'hôte (exemple avec Caddy plus bas). Les conteneurs ne servent que du HTTP.

### 2. Avant la première installation

Ces points sont **bloquants** : voir aussi [limites connues](#état-du-projet-et-limites-connues).

1. **Mots de passe** : choisissez des mots de passe MySQL forts et uniques. Les anciens mots de passe de développement apparaissent dans l'historique git : ne les réutilisez pas.
2. **Clés JWT** : générez une paire de clés dédiée à la production (étape 3) et gardez les fichiers `.pem` hors du dépôt (ou dans `keys/`, ignoré par git et par Docker).
3. **Données** : `docker-entrypoint/init.sql` ne crée aucun compte ; il contient encore quelques lignes de test (aliments « q » et « test », nutriments « Vitamine A (Legacy) » et « Test Vitamine ») à retirer si vous le souhaitez.

### 3. Configurer l'environnement

```bash
cp .env.example .env
chmod 600 .env
```

Renseignez `DOCKER_ROOT_PASSWORD`, `DOCKER_USER`, `DOCKER_PASSWORD` (et gardez `DOCKER_DATABASE=vitamines_db`, `DOCKER_DATABASE_HOST=mysql`), puis pour la production :

```dotenv
NODE_ENV=production
TRUST_PROXY=1
CORS_ORIGINS=https://vitamines.bryamsilva.online
APP_UID=1000          # id -u du propriétaire de vitamines/public/images/alimentsImages
APP_GID=1000          # id -g
FRONT_PORT=8081       # le port 80 de l'hôte est pris par le reverse proxy
```

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
| `NODE_ENV` | api | `production` désactive Swagger et active HSTS |
| `CORS_ORIGINS` | api | Origines autorisées, séparées par des virgules |
| `TRUST_PROXY` | api | `1` derrière un reverse proxy (IP réelle pour le limiteur de connexion) |
| `API_DOCS` | api | `true` pour garder `/api-docs` en production |
| `APP_UID` / `APP_GID` | api | Utilisateur du conteneur, propriétaire du dossier d'images |
| `API_BIND` / `FRONT_BIND` / `FRONT_PORT` | compose | Interface et port publiés (défaut `127.0.0.1`, port 80) |

### 4. Reverse proxy HTTPS

Par défaut, l'API et nginx n'écoutent que sur `127.0.0.1` (ports `3000` et `FRONT_PORT`) et redémarrent automatiquement : seul le reverse proxy les expose sur Internet.

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
```

Au **premier** démarrage seulement (dossier `mysql-data/` vide), MySQL exécute `docker-entrypoint/init.sql` : il crée directement le schéma nutriments avec toutes les données (30 nutriments, aliments et leurs images, liens, apports…). `npm run migrate` et `npm run seed` ne servent plus que pour une base existante créée avec l'ancien dump, ou pour recharger `nutriments.json` (voir « Mettre à jour »).

### 6. Créer le compte administrateur

**Automatiquement (recommandé)** : renseignez dans `.env` avant de démarrer :

```env
ADMIN_EMAIL=vous@exemple.be
ADMIN_PASSWORD=UnVraiMotDePasse42
ADMIN_NOM=Administrateur
```

Au démarrage, l'API crée ce compte **seulement si aucun administrateur n'existe** (rien n'est écrasé aux redémarrages suivants). Le mot de passe doit faire 8 caractères minimum avec une lettre et un chiffre ; les valeurs d'exemple sont refusées. Si un compte non-admin utilise déjà cet email, il n'est pas promu. Le résultat apparaît dans `docker compose logs api` (lignes `[admin]`). Après la première connexion, changez le mot de passe ou videz `ADMIN_PASSWORD`.

**Manuellement** :

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

**Sécurité en place** : écritures réservées aux admins (JWT RS256 + rôle), 10 tentatives de connexion par 15 minutes et par IP (5 inscriptions par heure), mot de passe d'au moins 8 caractères avec lettre et chiffre, CORS limité aux origines déclarées, en-têtes `nosniff` / `DENY` / `no-referrer`, upload limité aux PNG et SVG sans script (2 Mo, nom de fichier généré par le serveur), cache borné à 500 réponses.

## Exploitation

**Mettre à jour**

```bash
git pull
docker compose up -d --build
docker compose exec api npm run migrate
```

Relancez `npm run seed` seulement si `vitaminesApi/data/nutriments.json` a changé : il remplace les fonctions, effets, apports et aliments des 30 nutriments par le contenu du fichier.

**Nettoyer une base existante** (une fois, après la mise à jour) : les bases créées avant novembre 2026 contiennent encore des essais (« Vitamine A (Legacy) », « Test Vitamine », aliments « q » et « test ») et des fonctions reliées à rien. Faites d'abord une sauvegarde (voir plus bas), puis :

```bash
docker compose exec api npm run migrate:nettoyage                  # aperçu, ne modifie rien
docker compose exec api npm run migrate:nettoyage -- --apply       # supprime ces lignes
docker compose exec api npm run migrate:nettoyage -- --apply --drop-legacy   # et les tables legacy_*
```

Si le schéma ou `nutriments.json` change, régénérez `docker-entrypoint/init.sql` pour que les nouvelles installations en profitent : sur une base à jour, `mysqldump --no-tablespaces --skip-extended-insert --complete-insert vitamines_db` (sans les tables `legacy_*`), en gardant l'en-tête du fichier, notamment `SET NAMES utf8mb4;`.

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
  init.sql                  schéma + données (état après migrate + seed)
vitaminesApi/               API Express
  index.js, db.js           point d'entrée, connexion MySQL
  routes/ controllers/ models/ middlewares/
  migrations/001_nutriments.js   npm run migrate
  migrations/002_quizz.js        npm run migrate:quizz
  migrations/003_nettoyage.js    npm run migrate:nettoyage
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

**Limites connues**

- Le token est stocké dans `localStorage` : une faille XSS dans le front permettrait de le lire. Un cookie `HttpOnly` demanderait de revoir l'authentification (CSRF, CORS avec identifiants).
- Le limiteur de connexion et le cache sont en mémoire : ils repartent de zéro au redémarrage et ne se partagent pas entre plusieurs instances de l'API.
- Les anciens mots de passe MySQL restent lisibles dans l'historique git (le réécrire demanderait un `git push --force`).
- `POST /register` renvoie un `id` incorrect ; depuis le réseau local (`192.168.x`), le front appelle `localhost:3000`.
- Pas de tests automatisés ni d'intégration continue.
