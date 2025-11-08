
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 5000;

const pool = new Pool({
  user: 'postgres',
  host: process.env.PGHOST || 'db', // Change 'localhost' to 'db' for Docker
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

app.use(cors({
  origin: "*",
  credentials: true
}));

const authRouter = require('./auth')(pool);
const accountRouter = require('./account')(pool);
const decksRouter = require('./decks')(pool);
const flashcardsRouter = require('./flashcards')(pool);
const gameRouter = require('./game')(pool);

app.use(express.json());
app.use('/auth', authRouter);
app.use('/account', accountRouter);
app.use('/decks', decksRouter);
app.use('/games', gameRouter);
app.use('/flashcards', flashcardsRouter);

app.get('/api', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.json({ time: result.rows[0].now });
});


app.listen(port, () => {
  console.log(`Backend listening at port: ${port}`);
});
