const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./user_route.js');

const app = express();
const PORT = process.env.PORT || 3001; // Using port 3001

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add a root route handler for easy verification
app.get('/', (req, res) => {
  res.status(200).send('Xerox Print Server API is running');
});

// Routes
app.use('/api', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Print Server running on port ${PORT}`);
});