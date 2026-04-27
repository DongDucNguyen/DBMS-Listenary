const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ── POST /api/favorites — Thêm/xóa yêu thích (toggle) ───────
router.post('/', async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    if (!userId || parseInt(userId) <= 0)
      return res.status(400).json({ error: 'userId không hợp lệ' });
    await pool.query('CALL sp_ToggleFavorite(?,?,@action,@msg)', [userId, bookId]);
    const [[out]] = await pool.query('SELECT @action AS action, @msg AS message');
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── DELETE /api/favorites/:userId/:bookId ────────────────────
router.delete('/:userId/:bookId', async (req, res) => {
  try {
    await pool.query('DELETE FROM userfavorites WHERE userId=? AND bookId=?',
      [req.params.userId, req.params.bookId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/favorites/:userId — Danh sách yêu thích ────────
router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.bookId AS bookId, b.bookName AS bookName, b.thumbnailUrl,
              b.authorFullName
       FROM userfavorites f
       JOIN vw_BookDetails b ON b.bookId = f.bookId
       WHERE f.userId = ?
       GROUP BY b.bookId`, [req.params.userId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
