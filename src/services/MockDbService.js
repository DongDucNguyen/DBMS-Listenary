/**
 * MockDbService — Lưu trữ toàn bộ dữ liệu người dùng thay đổi vào localStorage
 * Thay thế cho server API thực khi chưa có backend.
 *
 * Các key trong localStorage:
 *   listenary_reading_history_{userId}  → [{ bookId, progress, lastListened, totalDuration }]
 *   listenary_view_counts               → { [bookId]: number }
 *   listenary_mock_comments             → Comment[]  (đã có)
 *   listenary_deleted_comments          → number[]   (đã có)
 *   listenary_favs_{userId}             → number[]   (đã có)
 *   listenary_favs_{userId}_meta        → [{bookId, addedAt}] (đã có)
 */

export const MockDbService = {
  // ─── READING HISTORY ──────────────────────────────────────────────────────
  // Lịch sử nghe giờ được lưu trực tiếp bằng API
  updateReadingProgress(userId, bookId, progressPct, totalDurationSec = 0) {
    if (!userId || !bookId) return;
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        bookId,
        progress: Math.min(100, Math.max(0, Math.round(progressPct))),
        lastListened: new Date().toISOString()
      })
    }).catch(e => console.error(e));
  },

  // ─── VIEWS (Lượt nghe) ───────────────────────────────────────────────────
  // Dữ liệu lượt nghe hiện đã được đồng bộ chuẩn với database.json
  getViewCount(book) {
    return book?.viewCount || 0;
  },

  incrementView(bookId) {
    fetch(`/api/books/${bookId}/view`, { method: 'POST' })
      .catch(e => console.error(e));
  },

  // ─── FAVORITES ────────────────────────────────────────────────────────────
  // API Calls (Fire-and-forget, since UI updates optimistic local state)
  addFavorite(userId, bookId) {
    fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, bookId })
    }).catch(e => console.error(e));
  },

  removeFavorite(userId, bookId) {
    fetch(`/api/favorites/${userId}/${bookId}`, { method: 'DELETE' })
      .catch(e => console.error(e));
  },

  isFavorite(userId, bookId, dbFavIds = []) {
    return dbFavIds.includes(bookId);
  },

  // ─── COMMENTS ─────────────────────────────────────────────────────────────
  // Do server API lưu thẳng vào database.json, không cần merge
  mergeComments(dbComments = []) {
    return [...dbComments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  addComment(comment) {
    if (comment && comment.id) comment.id = parseInt(comment.id, 10);
    fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    }).catch(e => console.error(e));
  },

  editComment(commentId, payload) {
    const cid = parseInt(commentId, 10);
    fetch(`/api/comments/${cid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(e => console.error(e));
  },

  deleteComment(commentId) {
    const cid = parseInt(commentId, 10);
    fetch(`/api/comments/${cid}`, { method: 'DELETE' })
      .catch(e => console.error(e));
  },
};
