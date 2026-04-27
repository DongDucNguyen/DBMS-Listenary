require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use('/api/books',        require('./routes/books'));
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/history',      require('./routes/history'));
app.use('/api/comments',     require('./routes/comments'));
app.use('/api/favorites',    require('./routes/favorites'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/categories',   require('./routes/categories'));

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

// ── 404 fallback ─────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Endpoint không tồn tại: ${req.method} ${req.url}` }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`));
