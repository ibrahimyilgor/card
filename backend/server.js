
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const port = 5000;

const pool = new Pool({
  user: 'postgres',
  host: process.env.PGHOST || 'db',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

app.use(cors({
  origin: "*",
  credentials: true
}));

const authRouter = require('./auth')(pool);
const userRouter = require('./user')(pool);


app.use(express.json());
app.use('/auth', authRouter);
app.use('/user', userRouter);

app.get('/api', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.json({ time: result.rows[0].now });
});


app.get('/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items');
    res.json({ items: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend listening at port: ${port}`);
});
