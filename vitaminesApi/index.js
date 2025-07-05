
// server.js
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const app = express();

app.use(cors());
app.use(express.json());

// --- VITAMINES CRUD ---

// GET all vitamines
app.get('/vitamines', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM vitamines');
  res.json(rows);
});

// GET vitamine by ID
app.get('/vitamines/id/:id', async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT * FROM vitamines WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Vitamine non trouvée' });
  res.json(rows[0]);
});

// GET vitamine by name
app.get('/vitamines/nom/:nom', async (req, res) => {
  const { nom } = req.params;
  const [rows] = await pool.query('SELECT * FROM vitamines WHERE nom = ?', [nom]);
  if (rows.length === 0) return res.status(404).json({ message: 'Vitamine non trouvée' });
  res.json(rows[0]);
});

// GET effets for a vitamine
app.get('/vitamines/:id/effets', async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT id, type AS type_effet, description
     FROM effets
     WHERE vitamine_id = ?`,
    [id]
  );
  res.json(rows);
});

// GET fonctions for a vitamine
app.get('/vitamines/:id/fonctions', async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT f.id, f.nom, f.description
     FROM fonctions f
     JOIN vitamine_fonction vf ON f.id = vf.fonction_id
     WHERE vf.vitamine_id = ?`,
    [id]
  );
  res.json(rows);
});

// GET aliments for a vitamine
app.get('/vitamines/:nom/aliments', async (req, res) => {
  const { nom } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT a.nom AS aliment, v.nom AS vitamine
FROM vitamines AS v
JOIN aliments_vitamines AS av ON v.id = av.vitamine_id
JOIN aliments AS a ON a.id = av.aliment_id
WHERE v.nom = ? ;

`,
      [nom]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: `Aucun aliment pour la vitamine ${nom}` });
    }
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// CREATE vitamine
app.post('/vitamines', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // ✅ Ajout de nom_scientifique
    const { nom, description, couleur, nom_scientifique, effets, fonctions } = req.body;

    if (!nom || !description || !couleur || !nom_scientifique) {
      return res.status(400).json({ message: 'nom, description, couleur et nom_scientifique requis' });
    }

    // ✅ INSERT avec nom_scientifique
    const [vitRes] = await connection.query(
      'INSERT INTO vitamines (nom, description, couleur, nom_scientifique) VALUES (?, ?, ?, ?)',
      [nom, description, couleur, nom_scientifique]
    );
    const vid = vitRes.insertId;

    // Effets
    if (Array.isArray(effets) && effets.length) {
      const effData = effets.map(e => [vid, e.type, e.description]);
      await connection.query(
        'INSERT INTO effets (vitamine_id, type, description) VALUES ?',
        [effData]
      );
    }

    // Fonctions
    if (Array.isArray(fonctions) && fonctions.length) {
      const funcIds = [];
      for (const f of fonctions) {
        const [rows] = await connection.query('SELECT id FROM fonctions WHERE nom = ?', [f.nom]);
        let fid;
        if (rows.length === 0) {
          const [r] = await connection.query(
            'INSERT INTO fonctions (nom, description) VALUES (?, ?)',
            [f.nom, f.description]
          );
          fid = r.insertId;
        } else {
          fid = rows[0].id;
        }
        funcIds.push(fid);
      }
      const linkData = funcIds.map(fid => [vid, fid]);
      await connection.query(
        'INSERT INTO vitamine_fonction (vitamine_id, fonction_id) VALUES ?',
        [linkData]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Créé', id: vid });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erreur création' });
  } finally {
    connection.release();
  }
});
// UPDATE vitamine (et relations)

app.put('/vitamines/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // ✅ Ajout de nom_scientifique dans le body
    const { nom, description, couleur, nom_scientifique, effets, fonctions } = req.body;

    // ✅ Mise à jour de la vitamine avec nom_scientifique
    await connection.query(
      'UPDATE vitamines SET nom = ?, description = ?, couleur = ?, nom_scientifique = ? WHERE id = ?',
      [nom, description, couleur, nom_scientifique, id]
    );

    // Suppression des anciens effets et liaisons fonction
    await connection.query('DELETE FROM effets WHERE vitamine_id = ?', [id]);
    await connection.query('DELETE FROM vitamine_fonction WHERE vitamine_id = ?', [id]);

    // Réinsertion des effets
    if (Array.isArray(effets) && effets.length) {
      const effData = effets.map(e => [id, e.type, e.description]);
      await connection.query('INSERT INTO effets (vitamine_id, type, description) VALUES ?', [effData]);
    }

    // Réinsertion des fonctions
    if (Array.isArray(fonctions) && fonctions.length) {
      const funcIds = [];
      for (const f of fonctions) {
        const [rows] = await connection.query('SELECT id FROM fonctions WHERE nom = ?', [f.nom]);
        let fid;
        if (rows.length === 0) {
          const [r] = await connection.query(
            'INSERT INTO fonctions (nom, description) VALUES (?, ?)', [f.nom, f.description]
          );
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
    res.json({ message: 'Modifié' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erreur mise à jour' });
  } finally {
    connection.release();
  }
});


// DELETE vitamine
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
    res.json({ message: 'Supprimée' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erreur suppression' });
  } finally {
    connection.release();
  }
});

// Authentification utilisateur
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

// Handler des erreurs non gérées
app.use((err, req, res, next) => {
  console.error('Erreur non gérée :', err);
  res.status(500).json({ message: 'Erreur serveur' });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Serveur API: http://0.0.0.0:${PORT}`));

