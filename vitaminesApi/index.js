require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.js');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

let cache = {};
let cacheTime = {};

function isValid(key, ttl = 3600000) {
  return cache[key] && (Date.now() - cacheTime[key] < ttl);
}

async function getFromCacheOrFetch(key, ttl, fetchFunction) {
  if (isValid(key, ttl)) {
    return cache[key];
  }
  const data = await fetchFunction();
  cache[key] = data;
  cacheTime[key] = Date.now();
  return data;
}

function invalidateVitamineCache(id, nom) {
  const keysToInvalidate = [
    'vitamines_all',
    `vitamine_id_${id}`,
    `vitamine_nom_${nom}`,
    `effets_vit_${id}`,
    `fonctions_vit_${id}`,
    `aliments_vit_${nom}`
  ];
  for (const key of keysToInvalidate) {
    delete cache[key];
    delete cacheTime[key];
  }
}

/**
 * @swagger
 * /vitamines:
 *   get:
 *     summary: Récupérer toutes les vitamines
 *     tags:
 *       - Vitamines
 *     responses:
 *       200:
 *         description: Liste des vitamines
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nom:
 *                     type: string
 *                   description:
 *                     type: string
 *                   couleur:
 *                     type: string
 *                   nom_scientifique:
 *                     type: string
 */
app.get('/vitamines', async (req, res) => {
  try {
    const data = await getFromCacheOrFetch('vitamines_all', 3600000, async () => {
      const [rows] = await pool.query('SELECT * FROM vitamines');
      return rows;
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /vitamines/id/{id}:
 *   get:
 *     summary: Récupérer une vitamine par son ID
 *     tags:
 *       - Vitamines
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vitamine trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nom:
 *                   type: string
 *                 description:
 *                   type: string
 *                 couleur:
 *                   type: string
 *                 nom_scientifique:
 *                   type: string
 *       404:
 *         description: Vitamine non trouvée
 */
app.get('/vitamines/id/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await getFromCacheOrFetch(`vitamine_id_${id}`, 3600000, async () => {
      const [rows] = await pool.query('SELECT * FROM vitamines WHERE id = ?', [id]);
      if (rows.length === 0) throw { notFound: true };
      return rows[0];
    });
    res.json(data);
  } catch (err) {
    if (err.notFound) return res.status(404).json({ message: 'Vitamine non trouvée' });
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /vitamines/nom/{nom}:
 *   get:
 *     summary: Récupérer une vitamine par son nom
 *     tags:
 *       - Vitamines
 *     parameters:
 *       - in: path
 *         name: nom
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vitamine trouvée
 *       404:
 *         description: Vitamine non trouvée
 */
app.get('/vitamines/nom/:nom', async (req, res) => {
  const { nom } = req.params;
  try {
    const data = await getFromCacheOrFetch(`vitamine_nom_${nom}`, 3600000, async () => {
      const [rows] = await pool.query('SELECT * FROM vitamines WHERE nom = ?', [nom]);
      if (rows.length === 0) throw { notFound: true };
      return rows[0];
    });
    res.json(data);
  } catch (err) {
    if (err.notFound) return res.status(404).json({ message: 'Vitamine non trouvée' });
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /vitamines/{id}/effets:
 *   get:
 *     summary: Récupérer les effets d'une vitamine
 *     tags:
 *       - Vitamines
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des effets
 */
app.get('/vitamines/:id/effets', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await getFromCacheOrFetch(`effets_vit_${id}`, 3600000, async () => {
      const [rows] = await pool.query(
          `SELECT id, type AS type_effet, description FROM effets WHERE vitamine_id = ?`,
          [id]
      );
      return rows;
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /vitamines/{id}/fonctions:
 *   get:
 *     summary: Récupérer les fonctions d'une vitamine
 *     tags:
 *       - Vitamines
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des fonctions
 */
app.get('/vitamines/:id/fonctions', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await getFromCacheOrFetch(`fonctions_vit_${id}`, 3600000, async () => {
      const [rows] = await pool.query(
          `SELECT f.id, f.nom, f.description FROM fonctions f JOIN vitamine_fonction vf ON f.id = vf.fonction_id WHERE vf.vitamine_id = ?`,
          [id]
      );
      return rows;
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /vitamines/{nom}/aliments:
 *   get:
 *     summary: Récupérer les aliments contenant une vitamine
 *     tags:
 *       - Vitamines
 *     parameters:
 *       - in: path
 *         name: nom
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des aliments
 *       404:
 *         description: Aucun aliment trouvé
 */
app.get('/vitamines/:nom/aliments', async (req, res) => {
  const { nom } = req.params;
  try {
    const data = await getFromCacheOrFetch(`aliments_vit_${nom}`, 3600000, async () => {
      const [rows] = await pool.query(
          `SELECT a.nom AS aliment, v.nom AS vitamine FROM vitamines v JOIN aliments_vitamines av ON v.id = av.vitamine_id JOIN aliments a ON a.id = av.aliment_id WHERE v.nom = ?`,
          [nom]
      );
      if (rows.length === 0) throw { notFound: true };
      return rows;
    });
    res.json(data);
  } catch (err) {
    if (err.notFound) return res.status(404).json({ message: `Aucun aliment pour la vitamine ${nom}` });
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /vitamines:
 *   post:
 *     summary: Créer une nouvelle vitamine
 *     tags:
 *       - Vitamines
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - description
 *               - couleur
 *               - nom_scientifique
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               couleur:
 *                 type: string
 *               nom_scientifique:
 *                 type: string
 *               effets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     description:
 *                       type: string
 *               fonctions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nom:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       201:
 *         description: Vitamine créée
 *       400:
 *         description: Champs requis manquants
 */
app.post('/vitamines', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { nom, description, couleur, nom_scientifique, effets, fonctions } = req.body;
    if (!nom || !description || !couleur || !nom_scientifique) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }
    const [vitRes] = await connection.query(
        'INSERT INTO vitamines (nom, description, couleur, nom_scientifique) VALUES (?, ?, ?, ?)',
        [nom, description, couleur, nom_scientifique]
    );
    const vid = vitRes.insertId;

    if (Array.isArray(effets) && effets.length) {
      const effData = effets.map(e => [vid, e.type, e.description]);
      await connection.query('INSERT INTO effets (vitamine_id, type, description) VALUES ?', [effData]);
    }

    if (Array.isArray(fonctions) && fonctions.length) {
      const funcIds = [];
      for (const f of fonctions) {
        const [rows] = await connection.query('SELECT id FROM fonctions WHERE nom = ?', [f.nom]);
        let fid;
        if (rows.length === 0) {
          const [r] = await connection.query('INSERT INTO fonctions (nom, description) VALUES (?, ?)', [f.nom, f.description]);
          fid = r.insertId;
        } else {
          fid = rows[0].id;
        }
        funcIds.push(fid);
      }
      const linkData = funcIds.map(fid => [vid, fid]);
      await connection.query('INSERT INTO vitamine_fonction (vitamine_id, fonction_id) VALUES ?', [linkData]);
    }

    await connection.commit();
    invalidateVitamineCache(vid, nom);
    res.status(201).json({ message: 'Créé', id: vid });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erreur création' });
  } finally {
    connection.release();
  }
});

/**
 * @swagger
 * /vitamines/{id}:
 *   put:
 *     summary: Mettre à jour une vitamine
 *     tags:
 *       - Vitamines
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - description
 *               - couleur
 *               - nom_scientifique
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               couleur:
 *                 type: string
 *               nom_scientifique:
 *                 type: string
 *               effets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     description:
 *                       type: string
 *               fonctions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nom:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       200:
 *         description: Vitamine mise à jour
 *       500:
 *         description: Erreur mise à jour
 */
app.put('/vitamines/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { nom, description, couleur, nom_scientifique, effets, fonctions } = req.body;
    await connection.query(
        'UPDATE vitamines SET nom = ?, description = ?, couleur = ?, nom_scientifique = ? WHERE id = ?',
        [nom, description, couleur, nom_scientifique, id]
    );
    await connection.query('DELETE FROM effets WHERE vitamine_id = ?', [id]);
    await connection.query('DELETE FROM vitamine_fonction WHERE vitamine_id = ?', [id]);

    if (Array.isArray(effets) && effets.length) {
      const effData = effets.map(e => [id, e.type, e.description]);
      await connection.query('INSERT INTO effets (vitamine_id, type, description) VALUES ?', [effData]);
    }

    if (Array.isArray(fonctions) && fonctions.length) {
      const funcIds = [];
      for (const f of fonctions) {
        const [rows] = await connection.query('SELECT id FROM fonctions WHERE nom = ?', [f.nom]);
        let fid;
        if (rows.length === 0) {
          const [r] = await connection.query('INSERT INTO fonctions (nom, description) VALUES (?, ?)', [f.nom, f.description]);
          fid = r.insertId;
        } else {
          fid = rows[0].id;
        }
        funcIds.push(fid);
      }
      const link = funcIds.map(fid => [id, fid]);
      await connection.query('INSERT INTO vitamine_fonction (vitamine_id, fonction_id) VALUES ?', [link]);
    }

    await connection.commit();
    invalidateVitamineCache(id, nom);
    res.json({ message: 'Modifié' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erreur mise à jour' });
  } finally {
    connection.release();
  }
});

/**
 * @swagger
 * /vitamines/{id}:
 *   delete:
 *     summary: Supprimer une vitamine
 *     tags:
 *       - Vitamines
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vitamine supprimée
 *       404:
 *         description: Vitamine non trouvée
 */
app.delete('/vitamines/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM effets WHERE vitamine_id = ?', [id]);
    await connection.query('DELETE FROM vitamine_fonction WHERE vitamine_id = ?', [id]);
    const [r] = await connection.query('DELETE FROM vitamines WHERE id = ?', [id]);
    if (r.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Non trouvée' });
    }
    await connection.commit();
    invalidateVitamineCache(id, '');
    res.json({ message: 'Supprimée' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erreur suppression' });
  } finally {
    connection.release();
  }
});

/**
 * @swagger
 * /vitamines/users:
 *   get:
 *     summary: Authentifier un utilisateur
 *     tags:
 *       - Utilisateurs
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: password
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur authentifié
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Authentification échouée
 */
app.get('/vitamines/users', async (req, res) => {
  const { email, password } = req.query;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Identifiants incorrects' });
    const user = users[0];
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    const { password: _, ...safe } = user;
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /vitamines/users:
 *   post:
 *     tags:
 *       - Utilisateurs
 *     summary: Inscrire un nouvel utilisateur
 *     description: Crée un nouvel utilisateur avec un nom, un email et un mot de passe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MonSuperMotDePasse123
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: johndoe
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *       400:
 *         description: Requête invalide – champs manquants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Nom, email et mot de passe requis
 *       409:
 *         description: Utilisateur déjà existant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Un compte avec cet email existe déjà
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erreur serveur
 */
app.post('/vitamines/users', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
    }
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
        'INSERT INTO users (nom, email, password) VALUES (?, ?, ?)',
        [nom, email, hashedPassword]
    );
    res.status(201).json({ id: result.insertId, username, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
