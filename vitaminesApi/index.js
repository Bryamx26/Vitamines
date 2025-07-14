// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const app = express();

app.use(cors());
app.use(express.json());

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
// test
// --- VITAMINES CRUD ---

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

app.use((err, req, res, next) => {
  console.error('Erreur non gérée :', err);
  res.status(500).json({ message: 'Erreur serveur' });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Serveur API: http://0.0.0.0:${PORT}`));
