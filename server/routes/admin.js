const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ── GET /api/admin/authors — Thống kê tác giả ───────────────
router.get('/authors', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_AuthorStats ORDER BY totalViews DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/admin/books — TẤT CẢ sách (kể cả ẩn, pending) ──
router.get('/books', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.id AS bookId, b.name AS bookName, b.description, b.thumbnailUrl,
             b.country, b.language, b.pageNumber, b.releaseDate,
             b.ebookFileUrl, b.audioFileUrl, b.copyrightFileUrl,
             b.viewCount, b.weeklyViewCount, b.isHidden,
             b.approvalStatus, b.submittedByUserId, b.createdAt, b.updatedAt,
             a.id AS authorId, CONCAT(a.firstName,' ',a.lastName) AS authorFullName
      FROM books b
      LEFT JOIN authorsofbooks aob ON aob.BookId = b.id
      LEFT JOIN author a ON a.id = aob.AuthorId
      ORDER BY b.createdAt DESC
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});



// ── GET /api/admin/pending — Sách chờ duyệt ─────────────────
router.get('/pending', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_PendingBooks');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/admin/users — Tất cả người dùng ────────────────
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_UserProfile ORDER BY userCreatedAt DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/admin/users/create ─────────────────────────────
router.post('/users/create', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, roleId, phoneNumber, addresses, birthday } = req.body;
    if (!username || !email || !password || !roleId)
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });

    const [[dup]] = await pool.query('SELECT id FROM user WHERE username=? OR email=?', [username, email]);
    if (dup) return res.status(400).json({ error: 'Username hoặc Email đã tồn tại' });

    let authorId = 0;
    if (parseInt(roleId) === 3) {
      const [aRes] = await pool.query(
        'INSERT INTO author (firstName, lastName, birthday, imagineUrl, description) VALUES (?,?,?,?,?)',
        [firstName || '', lastName || '', birthday || null, '', 'Tác giả mới']
      );
      authorId = aRes.insertId;
    }

    const [result] = await pool.query(
      `INSERT INTO user (username, encryptedPassword, firstName, lastName, email,
        phoneNumber, addresses, birthday, loginFailedAttempts, hasLocked,
        createdAt, updatedAt, roleId, subscriptionPlan, thumbnailUrl, authorId)
       VALUES (?,?,?,?,?,?,?,?,0,FALSE,NOW(),NOW(),?,?,?,?)`,
      [username, password, firstName||'', lastName||'', email,
       phoneNumber||null, addresses||null, birthday||null,
       roleId, 'FREE', '', authorId]
    );
    const [[newUser]] = await pool.query('SELECT * FROM vw_UserProfile WHERE userId = ?', [result.insertId]);
    res.json({ success: true, user: newUser });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/admin/users/:id/toggleLock ────────────────────
router.post('/users/:id/toggleLock', async (req, res) => {
  try {
    const [[u]] = await pool.query('SELECT hasLocked FROM user WHERE id = ?', [req.params.id]);
    if (!u) return res.status(404).json({ success: false, error: 'Không tìm thấy user' });

    const newLockState = !u.hasLocked; // đảo trạng thái
    await pool.query('CALL sp_LockUnlockUser(?,?,@msg)', [req.params.id, newLockState]);
    const [[out]] = await pool.query('SELECT @msg AS message');
    const msg = out?.message || '';

    if (msg.startsWith('ERROR')) {
      return res.status(400).json({ success: false, error: msg.replace('ERROR: ', '') });
    }
    res.json({ success: true, hasLocked: newLockState, message: msg });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ── DELETE /api/admin/users/:id ──────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    const [[u]] = await pool.query('SELECT roleId FROM user WHERE id = ?', [req.params.id]);
    if (!u) return res.status(404).json({ error: 'User not found' });
    if (u.roleId === 1) return res.status(403).json({ error: 'Không thể xóa Admin' });
    await pool.query('DELETE FROM user WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/admin/books/create ─────────────────────────────
router.post('/books/create', async (req, res) => {
  try {
    const { name, description, thumbnailUrl, country, language,
            pageNumber, releaseDate, ebookFileUrl, audioFileUrl,
            copyrightFileUrl, authorId, newAuthorName, categoryId,
            submittedByUserId, chapters = [] } = req.body;

    if (!name) return res.status(400).json({ success: false, error: 'Tên sách không được để trống' });

    let finalAuthorId = authorId ? parseInt(authorId) : null;
    let createdAuthor = null;
    if (authorId === 'NEW' && newAuthorName) {
      const parts = newAuthorName.trim().split(' ');
      const ln = parts.pop(); const fn = parts.join(' ');
      const [aRes] = await pool.query(
        'INSERT INTO author (firstName, lastName, imagineUrl, description) VALUES (?,?,?,?)',
        [fn, ln, '', 'Tác giả mới']
      );
      finalAuthorId = aRes.insertId;
      createdAuthor = { id: finalAuthorId, firstName: fn, lastName: ln };
    }

    const [bRes] = await pool.query(
      `INSERT INTO books (name, description, thumbnailUrl, country, language,
        pageNumber, releaseDate, ebookFileUrl, audioFileUrl, copyrightFileUrl,
        approvalStatus, isHidden, submittedByUserId, viewCount, weeklyViewCount, createdAt, updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,'APPROVED',FALSE,?,0,0,NOW(),NOW())`,
      [name, description||'', thumbnailUrl||'', country||'', language||'VN',
       parseInt(pageNumber)||0, releaseDate||null, ebookFileUrl||'', audioFileUrl||'',
       copyrightFileUrl||'', submittedByUserId||null]
    );
    const newId = bRes.insertId;
    if (finalAuthorId) await pool.query('INSERT INTO authorsofbooks (AuthorId,BookId) VALUES (?,?)', [finalAuthorId, newId]);
    if (categoryId)    await pool.query('INSERT INTO categoriesofbooks (BookId,CategoryId) VALUES (?,?)', [newId, categoryId]);

    // Lưu chapters
    if (Array.isArray(chapters) && chapters.length > 0) {
      for (let i = 0; i < chapters.length; i++) {
        const c = chapters[i];
        await pool.query(
          'INSERT INTO audiochapter (bookId, chapterNumber, name, audiobookUrl, duration) VALUES (?,?,?,?,?)',
          [newId, c.chapterNumber || (i+1), c.name || c.chapterName || `Chương ${i+1}`, c.audiobookUrl || audioFileUrl || '', c.duration || 0]
        );
      }
    }

    const [[book]] = await pool.query('SELECT * FROM vw_BookDetails WHERE bookId = ?', [newId]);
    res.json({ success: true, book, createdAuthor });
  } catch (e) {
    console.error('Admin create book error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── POST /api/admin/books/:id/toggleHide ────────────────────
router.post('/books/:id/toggleHide', async (req, res) => {
  try {
    const [[b]] = await pool.query('SELECT isHidden FROM books WHERE id = ?', [req.params.id]);
    if (!b) return res.status(404).json({ error: 'Book not found' });
    await pool.query('UPDATE books SET isHidden = ? WHERE id = ?', [!b.isHidden, req.params.id]);
    res.json({ success: true, isHidden: !b.isHidden });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── DELETE /api/admin/books/:id ──────────────────────────────
router.delete('/books/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
