const express = require('express');
const mongoose = require('mongoose');
const resourceRoutes = require('./routes/resources');
const app = express();

app.use(express.json());
app.use('/resources', resourceRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  // Estas opções já não são necessárias com o mongoose mais recente,
  // mas não fazem mal se lá estiverem.
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(3003, () => console.log('Resource service running on port 3003'));
}).catch(err => console.error('MongoDB connection error:', err));
