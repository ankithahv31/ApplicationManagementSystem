import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const conn = await pool.getConnection();
  const rows = await conn.query('SELECT * FROM applications');
  conn.release();
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, owner } = req.body;
  const conn = await pool.getConnection();
  await conn.query('INSERT INTO applications (name, owner) VALUES (?, ?)', [name, owner]);
  conn.release();
  res.status(201).json({ message: 'Application added' });
});

router.get('/:id', async (req, res) => {
  const conn = await pool.getConnection();
  const rows = await conn.query('SELECT * FROM applications WHERE id = ?', [req.params.id]);
  conn.release();
  res.json(rows[0]);
});

router.put('/:id', async (req, res) => {
  const { name, owner } = req.body;
  const conn = await pool.getConnection();
  await conn.query('UPDATE applications SET name = ?, owner = ? WHERE id = ?', [name, owner, req.params.id]);
  conn.release();
  res.json({ message: 'Application updated' });
});

export default router;
