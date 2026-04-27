const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ── GET /api/comments — Tất cả bình luận (Admin) ────────────
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 500;
    const [rows] = await pool.query(
      `SELECT c.*, b.name AS bookName, u.username, u.firstName, u.lastName,
              u.thumbnailUrl AS userAvatar
       FROM comments c
       JOIN books b ON b.id = c.bookId
       JOIN user u ON u.id = c.userId
       ORDER BY c.createdAt DESC LIMIT ?`, [limit]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/comments/user/:userId — Bình luận của user ─────
router.get('/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, b.name AS bookName, b.thumbnailUrl AS bookThumbnail
       FROM comments c
       JOIN books b ON b.id = c.bookId
       WHERE c.userId = ? ORDER BY c.createdAt DESC`, [req.params.userId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/comments/:bookId — Lấy bình luận theo sách ─────
router.get('/:bookId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.username, u.thumbnailUrl AS userAvatar
       FROM comments c JOIN user u ON u.id = c.userId
       WHERE c.bookId = ? ORDER BY c.createdAt DESC`, [req.params.bookId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/comments — Thêm đánh giá ──────────────────────
router.post('/', async (req, res) => {
  try {
    const { userId, bookId, rating, title, content } = req.body;

    // Validate
    if (!userId || parseInt(userId) <= 0)
      return res.status(400).json({ success: false, message: 'ERROR: Người dùng không hợp lệ.' });
    if (!bookId || parseInt(bookId) <= 0)
      return res.status(400).json({ success: false, message: 'ERROR: Sách không hợp lệ.' });
    if (!rating || parseInt(rating) < 1 || parseInt(rating) > 5)
      return res.status(400).json({ success: false, message: 'ERROR: Rating phải từ 1 đến 5.' });
    if (!content || content.toString().trim() === '')
      return res.status(400).json({ success: false, message: 'ERROR: Nội dung bình luận không được để trống.' });

    // INSERT trực tiếp — cho phép nhiều comment/user/book
    const [result] = await pool.query(
      'INSERT INTO comments (userId, bookId, rating, title, content, createdAt) VALUES (?,?,?,?,?,NOW())',
      [userId, bookId, parseInt(rating), title || '', content.toString().trim()]
    );

    // Trả về comment vừa tạo kèm thông tin user
    const [[newComment]] = await pool.query(
      `SELECT c.*, u.username, u.firstName, u.lastName, u.thumbnailUrl AS userAvatar
       FROM comments c JOIN user u ON u.id = c.userId
       WHERE c.id = ?`, [result.insertId]
    );

    res.json({ success: true, message: 'SUCCESS: Đã thêm đánh giá thành công.', comment: newComment });
  } catch (e) {
    console.error('Add comment error:', e);
    res.status(500).json({ success: false, message: 'ERROR: ' + e.message });
  }
});

// ── PUT /api/comments/:id — Sửa đánh giá ────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { content, rating } = req.body;
    await pool.query('UPDATE comments SET content=?, rating=? WHERE id=?', [content, rating, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── DELETE /api/comments/:id — Xóa đánh giá ─────────────────
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
