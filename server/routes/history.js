const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ── POST /api/history — Ghi/cập nhật lịch sử nghe ───────────
router.post('/', async (req, res) => {
  try {
    const { userId, bookId, audioChapterId, audioTimeline, isFinished } = req.body;
    // Guard: chỉ lưu khi userId hợp lệ (> 0)
    if (!userId || parseInt(userId) <= 0) {
      return res.json({ message: 'Skipped: no valid user session' });
    }
    await pool.query('CALL sp_UpsertListeningHistory(?,?,?,?,?,@msg)',
      [userId, bookId, audioChapterId||1, audioTimeline||0, isFinished||false]);
    const [[out]] = await pool.query('SELECT @msg AS message');
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/history/:userId — Lịch sử nghe của user ────────
router.get('/:userId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const [rows] = await pool.query(
      'SELECT * FROM vw_ListeningHistory WHERE userId = ? ORDER BY lastListenedAt DESC LIMIT ?',
      [req.params.userId, limit]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
