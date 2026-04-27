const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ── POST /api/subscription — Mua gói / Hủy gói ──────────────
router.post('/', async (req, res) => {
  try {
    const { userId, plan, paymentInfo, action, endDate } = req.body;

    if (!userId || parseInt(userId) <= 0)
      return res.status(400).json({ error: 'userId không hợp lệ' });

    if (action === 'CANCEL') {
      await pool.query('DELETE FROM usersubscriptions WHERE userId = ?', [userId]);
      await pool.query("UPDATE user SET subscriptionPlan = 'FREE' WHERE id = ?", [userId]);
      return res.json({ success: true, data: { subscriptionPlan: 'FREE', subscriptionEndDate: null } });
    }

    // SUBSCRIBE
    const payJson = JSON.stringify(paymentInfo || {});
    // Gọi stored proc — 3 input params + 1 OUT param
    await pool.query('CALL sp_UserSubscribe(?, ?, ?, @p_message)', [userId, plan, payJson]);
    const [[out]] = await pool.query('SELECT @p_message AS message');
    const msg = out?.message || '';

    if (msg.startsWith('ERROR')) {
      return res.status(400).json({ success: false, error: msg.replace('ERROR: ', '') });
    }

    // Lấy thông tin subscription vừa tạo
    const [[sub]] = await pool.query(
      'SELECT * FROM usersubscriptions WHERE userId = ? ORDER BY startDate DESC LIMIT 1', [userId]
    );

    // Cập nhật subscriptionPlan trong bảng user
    await pool.query('UPDATE user SET subscriptionPlan = ? WHERE id = ?', [plan, userId]);

    res.json({
      success: true,
      data: {
        subscriptionPlan: plan,
        subscriptionEndDate: sub?.endDate || endDate || null,
        paymentInfo: paymentInfo,
      }
    });
  } catch (e) {
    console.error('Subscription error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── GET /api/subscription/:userId ────────────────────────────
router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM usersubscriptions WHERE userId = ? ORDER BY startDate DESC',
      [req.params.userId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
