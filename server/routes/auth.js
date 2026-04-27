const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ── GET /api/auth/users — Toàn bộ tài khoản (Admin) ─────────
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_UserProfile');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/auth/users/:id ──────────────────────────────────
router.get('/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vw_UserProfile WHERE userId = ?', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── PUT /api/auth/users/:id/profile — Cập nhật hồ sơ ────────
router.put('/users/:id/profile', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, birthday, thumbnailUrl, addresses } = req.body;
    await pool.query(
      `UPDATE user SET
        firstName    = COALESCE(NULLIF(?,  ''), firstName),
        lastName     = COALESCE(NULLIF(?,  ''), lastName),
        email        = COALESCE(NULLIF(?,  ''), email),
        phoneNumber  = COALESCE(NULLIF(?,  ''), phoneNumber),
        birthday     = COALESCE(NULLIF(?,  ''), birthday),
        thumbnailUrl = COALESCE(NULLIF(?,  ''), thumbnailUrl),
        addresses    = COALESCE(NULLIF(?,  ''), addresses),
        updatedAt    = NOW()
       WHERE id = ?`,
      [firstName, lastName, email, phoneNumber, birthday, thumbnailUrl, addresses, req.params.id]
    );
    const [[updated]] = await pool.query('SELECT * FROM vw_UserProfile WHERE userId = ?', [req.params.id]);
    res.json({ success: true, user: updated });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query(
      'SELECT * FROM vw_UserProfile WHERE username = ?', [username]
    );
    if (!rows.length) return res.status(401).json({ error: 'Tài khoản không tồn tại' });
    const user = rows[0];

    // Lấy password từ bảng user gốc
    const [[u]] = await pool.query('SELECT encryptedPassword, hasLocked FROM user WHERE id = ?', [user.userId]);
    if (u.hasLocked) return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
    if (u.encryptedPassword !== password) return res.status(401).json({ error: 'Mật khẩu không đúng' });

    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/auth/register ──────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email)
      return res.status(400).json({ error: 'Vui lòng nhập đủ thông tin' });

    const [[dup]] = await pool.query(
      'SELECT id FROM user WHERE username = ? OR email = ?', [username, email]
    );
    if (dup) return res.status(400).json({ error: 'Username hoặc email đã tồn tại' });

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=7c3aed&color=fff`;
    const [result] = await pool.query(
      `INSERT INTO user (username, encryptedPassword, firstName, lastName, email,
        loginFailedAttempts, hasLocked, createdAt, roleId, thumbnailUrl, authorId)
       VALUES (?,?,?,''  ,?,0,FALSE,NOW(),2,?,0)`,
      [username, password, username, email, avatarUrl]
    );
    const [[newUser]] = await pool.query('SELECT * FROM vw_UserProfile WHERE userId = ?', [result.insertId]);
    res.json({ success: true, user: newUser });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/auth/users/update-password ────────────────────
router.post('/users/update-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    const [[u]] = await pool.query('SELECT encryptedPassword FROM user WHERE id = ?', [userId]);
    if (!u || u.encryptedPassword !== oldPassword)
      return res.status(400).json({ error: 'Mật khẩu cũ không chính xác' });
    await pool.query('UPDATE user SET encryptedPassword = ? WHERE id = ?', [newPassword, userId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/auth/users/delete ──────────────────────────────
router.post('/users/delete', async (req, res) => {
  try {
    const { userId, password } = req.body;
    const [[u]] = await pool.query('SELECT * FROM user WHERE id = ?', [userId]);
    if (!u) return res.status(404).json({ error: 'User not found' });
    if (u.encryptedPassword !== password) return res.status(400).json({ error: 'Mật khẩu không chính xác' });
    if (u.roleId === 1) return res.status(403).json({ error: 'Không thể xóa Admin' });
    await pool.query('DELETE FROM user WHERE id = ?', [userId]); // triggers sẽ cascade
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
