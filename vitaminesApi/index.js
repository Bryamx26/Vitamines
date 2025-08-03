require('dotenv').config();
const cors = require('cors');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.js');
const PORT = process.env.PORT || 3000;
const app = express();
const {cacheMiddleware } = require('./middlewares/cache-middleware');

app.use(cors("*"));
app.use(express.json());
app.use(cacheMiddleware(21600));
const vitaminesRoutes = require('./routes/vitamines-routes');
const alimentRoutes = require('./routes/aliments-routes');
const userRoutes = require('./routes/user-routes');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', vitaminesRoutes); // route complète = /api/vitamines
app.use('/api',alimentRoutes ); // route complète = /api/aliments
app.use('/api', userRoutes);




app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});