require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const path = require('path');
const { MongoClient } = require('mongodb');

const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');

// Create Express app
const app = express();

// Connect to MongoDB
let db;
const client = new MongoClient(process.env.MONGO_URI);

async function connectToDb() {
  try {
    await client.connect();
    db = client.db(); // default to database from the URI
    console.log('Connected to MongoDB');
    app.set('db', db);
  } catch (err) {
    console.error('Failed to connect to DB', err);
  }
}

// Passport config
const initializePassport = require('./config/passportConfig');
initializePassport(passport, () => db);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Serve the client’s build folder (production build)
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// For any other route, serve React's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

// Start the server after DB connection
connectToDb().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});
