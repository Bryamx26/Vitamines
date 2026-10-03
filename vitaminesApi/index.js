require('dotenv').config();
const cors = require('cors');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.js');
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const app = express();

app.disable('x-powered-by');

// Derrière un reverse proxy (Caddy, nginx…), req.ip doit être l'IP du client (limiteur de /auth)
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', /^\d+$/.test(process.env.TRUST_PROXY) ? Number(process.env.TRUST_PROXY) : process.env.TRUST_PROXY);
}

// En-têtes de sécurité (l'API ne renvoie que du JSON)
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Cross-Origin-Resource-Policy': 'same-site',
  });
  if (IS_PRODUCTION) res.set('Strict-Transport-Security', 'max-age=31536000');
  next();
});

// CORS : uniquement les origines du front (liste séparée par des virgules dans CORS_ORIGINS)
const DEFAULT_ORIGINS = [
  'https://vitamines.bryamsilva.online',
  'http://localhost',
  'http://localhost:5173',
  'http://localhost:5174',
];
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : DEFAULT_ORIGINS;
app.use(cors({ origin: allowedOrigins }));

app.use(express.json({ limit: '1mb' }));

const vitaminesRoutes = require('./routes/vitamines-routes');
const alimentRoutes = require('./routes/aliments-routes');
const userRoutes = require('./routes/user-routes');
const nutrimentsRoutes = require('./routes/nutriments-routes');

// Documentation Swagger : désactivée en production sauf API_DOCS=true
if (!IS_PRODUCTION || process.env.API_DOCS === 'true') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use('/api', vitaminesRoutes); // route complète = /api/vitamines
app.use('/api', alimentRoutes); // route complète = /api/aliments
app.use('/api', userRoutes);
app.use('/api', nutrimentsRoutes); // /api/nutriments, /api/categories, /api/aliments/:id/nutriments




app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
