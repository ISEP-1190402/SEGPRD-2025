const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const resourceRoutes = require('./routes/resources');
const app = express();


app.use(express.json());
app.use('/resources', resourceRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(3003, () => console.log('Resource service running on port 3003'));
}).catch(err => console.error('MongoDB connection error:', err));
