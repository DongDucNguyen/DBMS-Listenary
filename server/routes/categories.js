const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/categories — Trả về toàn bộ danh sách thể loại
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description FROM category ORDER BY id');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/categories/books — Trả về toàn bộ liên kết sách ↔ thể loại
router.get('/books', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT BookId, CategoryId FROM categoriesofbooks'
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
