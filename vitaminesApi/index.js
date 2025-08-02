require('dotenv').config();
const cors = require('cors');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.js');
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors("*"));
const vitaminesRoutes = require('./routes/vitamines-routes');
const alimentRoutes = require('./routes/aliments-routes');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use('/api', vitaminesRoutes); // route complète = /api/vitamines
app.use('/api',alimentRoutes ); // route complète = /api/aliments


app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});