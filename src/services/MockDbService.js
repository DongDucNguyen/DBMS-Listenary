/**
 * MockDbService — Giờ chuyển hướng tất cả sang ApiService (MySQL backend).
 * Giữ nguyên interface để không cần sửa các trang đang dùng MockDbService.
 */
import { ApiService } from './ApiService.js';

export const MockDbService = {

  // ─── VIEWS (Lượt xem) ─────────────────────────────────────────────
  getViewCount(book) {
    return book?.viewCount || 0;
  },

  incrementView(bookId) {
    ApiService.incrementView(bookId).catch(console.error);
  },

  // ─── READING HISTORY ──────────────────────────────────────────────
  updateReadingProgress(userId, bookId, progressPct, totalDurationSec = 0) {
    if (!userId || !bookId) return;
    const isFinished = progressPct >= 95;
    ApiService.upsertHistory(userId, bookId, null, Math.round(progressPct), isFinished)
      .catch(console.error);
  },

  // ─── FAVORITES ────────────────────────────────────────────────────
  addFavorite(userId, bookId) {
    ApiService.toggleFavorite(userId, bookId).catch(console.error);
  },

  removeFavorite(userId, bookId) {
    ApiService.removeFavorite(userId, bookId).catch(console.error);
  },

  isFavorite(userId, bookId, dbFavIds = []) {
    return dbFavIds.includes(bookId);
  },

  // ─── COMMENTS ─────────────────────────────────────────────────────
  mergeComments(dbComments = []) {
    return [...dbComments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  addComment(comment) {
    ApiService.addComment(comment).catch(console.error);
  },

  editComment(commentId, payload) {
    ApiService.editComment(parseInt(commentId, 10), payload).catch(console.error);
  },

  deleteComment(commentId) {
    ApiService.deleteComment(parseInt(commentId, 10)).catch(console.error);
  },
};
