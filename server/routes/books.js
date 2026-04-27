const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ── GET /api/books  — tất cả sách đã duyệt ──────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vw_BookDetails WHERE approvalStatus = "APPROVED" AND isHidden = FALSE'
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/books/newest ────────────────────────────────────
router.get('/newest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const [rows] = await pool.query('SELECT * FROM vw_NewestBooks LIMIT ?', [limit]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/books/trending ──────────────────────────────────
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const [rows] = await pool.query('SELECT * FROM vw_TrendingBooks LIMIT ?', [limit]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/books/:id ───────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vw_BookDetails WHERE bookId = ?', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Không tìm thấy sách' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/books/:id/chapters ──────────────────────────────
router.get('/:id/chapters', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM audiochapter WHERE bookId = ? ORDER BY chapterNumber', [req.params.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── POST /api/books/submit — Tác giả nộp sách (PENDING) ─────
router.post('/submit', async (req, res) => {
  try {
    const {
      name, description, thumbnailUrl, country, language,
      pageNumber, releaseDate, ebookFileUrl, audioFileUrl,
      copyrightFileUrl, copyrightUrl,          // hỗ trợ cả 2 tên field
      authorId,
      categoryId,
      submittedByUserId, submittedBy,          // hỗ trợ cả 2 tên field
      chapters = []
    } = req.body;

    const finalCopyright   = copyrightFileUrl || copyrightUrl || '';
    const finalSubmittedBy = submittedByUserId || submittedBy || null;

    if (!name) return res.status(400).json({ success: false, error: 'Tên sách không được để trống' });

    // Gọi stored proc tạo sách
    await pool.query(
      'CALL sp_AddNewBook(?,?,?,?,?,?,?,?,?,?,?,?,?,@newId,@msg)',
      [name, description || '', thumbnailUrl || '', country || '', language || 'VN',
       parseInt(pageNumber) || 0, releaseDate || null, ebookFileUrl || '', audioFileUrl || '',
       finalCopyright, authorId || null, categoryId || null, finalSubmittedBy]
    );
    const [[out]] = await pool.query('SELECT @newId AS newId, @msg AS message');
    const msg    = out?.message || '';
    const newId  = out?.newId;

    if (!newId || newId <= 0 || msg.startsWith('ERROR')) {
      return res.status(400).json({ success: false, error: msg.replace('ERROR: ', '') || 'Không thể tạo sách' });
    }

    // Lưu chapters vào audiochapter
    if (Array.isArray(chapters) && chapters.length > 0) {
      for (let i = 0; i < chapters.length; i++) {
        const c = chapters[i];
        await pool.query(
          'INSERT INTO audiochapter (bookId, chapterNumber, name, audiobookUrl, duration) VALUES (?,?,?,?,?)',
          [newId, c.chapterNumber || (i + 1), c.name || c.chapterName || `Chương ${i + 1}`, c.audiobookUrl || audioFileUrl || '', c.duration || 0]
        );
      }
    }

    res.json({ success: true, bookId: newId, message: msg });
  } catch (e) {
    console.error('Submit book error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── POST /api/books/:id/approve ──────────────────────────────────────────
router.post('/:id/approve', async (req, res) => {
  try {
    const adminId = req.body.adminId || 1;
    await pool.query('CALL sp_UpdateBookApproval(?,?,?,@msg)', [req.params.id, 'APPROVED', adminId]);
    const [[out]] = await pool.query('SELECT @msg AS message');
    const msg = out?.message || '';
    if (msg.startsWith('ERROR')) {
      return res.status(400).json({ success: false, error: msg.replace('ERROR: ', '') });
    }
    res.json({ success: true, message: msg });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ── POST /api/books/:id/reject ────────────────────────────────────────────
router.post('/:id/reject', async (req, res) => {
  try {
    const adminId = req.body.adminId || 1;
    await pool.query('CALL sp_UpdateBookApproval(?,?,?,@msg)', [req.params.id, 'REJECTED', adminId]);
    const [[out]] = await pool.query('SELECT @msg AS message');
    const msg = out?.message || '';
    if (msg.startsWith('ERROR')) {
      return res.status(400).json({ success: false, error: msg.replace('ERROR: ', '') });
    }
    res.json({ success: true, message: msg });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// ── POST /api/books/:id/view — Tăng lượt xem ────────────────
router.post('/:id/view', async (req, res) => {
  try {
    await pool.query('UPDATE books SET viewCount = viewCount + 1 WHERE id = ?', [req.params.id]);
    const [[row]] = await pool.query('SELECT viewCount FROM books WHERE id = ?', [req.params.id]);
    res.json({ success: true, viewCount: row?.viewCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── DELETE /api/books/:id — Xóa sách ────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { userId, password } = req.body;
    const [[user]] = await pool.query('SELECT * FROM user WHERE id = ?', [userId]);
    if (!user || user.encryptedPassword !== password) {
      return res.status(401).json({ error: 'Mật khẩu không đúng' });
    }
    await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── PUT /api/books/:id/edit ──────────────────────────────────
router.put('/:id/edit', async (req, res) => {
  try {
    const bookId = req.params.id;
    const { name, description, country, language, pageNumber,
            releaseDate, thumbnailUrl, ebookFileUrl, audioFileUrl,
            copyrightFileUrl, categoryId } = req.body;

    await pool.query(`UPDATE books SET
      name=COALESCE(?,name), description=COALESCE(?,description),
      country=COALESCE(?,country), language=COALESCE(?,language),
      pageNumber=COALESCE(?,pageNumber), releaseDate=COALESCE(?,releaseDate),
      thumbnailUrl=COALESCE(?,thumbnailUrl), ebookFileUrl=COALESCE(?,ebookFileUrl),
      audioFileUrl=COALESCE(?,audioFileUrl), copyrightFileUrl=COALESCE(?,copyrightFileUrl),
      approvalStatus='PENDING', updatedAt=NOW()
      WHERE id=?`,
      [name, description, country, language, pageNumber, releaseDate,
       thumbnailUrl, ebookFileUrl, audioFileUrl, copyrightFileUrl, bookId]
    );
    if (categoryId) {
      await pool.query('DELETE FROM categoriesofbooks WHERE BookId = ?', [bookId]);
      await pool.query('INSERT INTO categoriesofbooks (BookId,CategoryId) VALUES (?,?)', [bookId, categoryId]);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
