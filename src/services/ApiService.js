/**
 * ApiService — Lớp trung gian gọi MySQL backend
 * Dùng đường dẫn tương đối /api để Vite proxy chuyển đến http://localhost:3001
 */

const BASE = '/api';

async function _call(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${BASE}${path}`, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  } catch (e) {
    console.warn(`[ApiService] ${method} ${path} →`, e.message);
    throw e;
  }
}

export const ApiService = {
  // ─── BOOKS ─────────────────────────────────────────────────────────
  getAllBooks()               { return _call('GET',  '/books'); },
  getNewestBooks(limit = 6)  { return _call('GET',  `/books/newest?limit=${limit}`); },
  getTrendingBooks(limit=20) { return _call('GET',  `/books/trending?limit=${limit}`); },
  getBook(id)                { return _call('GET',  `/books/${id}`); },
  getBookChapters(bookId)    { return _call('GET',  `/books/${bookId}/chapters`); },
  incrementView(bookId)      { return _call('POST', `/books/${bookId}/view`); },
  submitBook(data)           { return _call('POST', '/books/submit', data); },
  approveBook(id, adminId)   { return _call('POST', `/books/${id}/approve`, { adminId }); },
  rejectBook(id, adminId)    { return _call('POST', `/books/${id}/reject`,  { adminId }); },
  editBook(id, data)         { return _call('PUT',  `/books/${id}/edit`, data); },
  deleteBook(id, userId, password) { return _call('DELETE', `/books/${id}`, { userId, password }); },

  // ─── AUTH / USERS ───────────────────────────────────────────────────
  login(username, password)  { return _call('POST', '/auth/login',    { username, password }); },
  register(u, e, p)          { return _call('POST', '/auth/register', { username: u, email: e, password: p }); },
  getAllUsers()               { return _call('GET',  '/auth/users'); },
  getUser(id)                { return _call('GET',  `/auth/users/${id}`); },
  updateProfile(userId, data) {
    return _call('PUT', `/auth/users/${userId}/profile`, data);
  },
  updatePassword(userId, oldPassword, newPassword) {
    return _call('POST', '/auth/users/update-password', { userId, oldPassword, newPassword });
  },
  deleteAccount(userId, password) {
    return _call('POST', '/auth/users/delete', { userId, password });
  },

  // ─── ADMIN ──────────────────────────────────────────────────────────
  getAuthorStats()           { return _call('GET',  '/admin/authors'); },
  getPendingBooks()          { return _call('GET',  '/admin/pending'); },
  getAdminUsers()            { return _call('GET',  '/admin/users'); },
  createUser(data)           { return _call('POST', '/admin/users/create', data); },
  toggleLockUser(userId)     { return _call('POST', `/admin/users/${userId}/toggleLock`); },
  deleteUser(userId)         { return _call('DELETE', `/admin/users/${userId}`); },
  adminCreateBook(data)      { return _call('POST', '/admin/books/create', data); },
  toggleHideBook(bookId)     { return _call('POST', `/admin/books/${bookId}/toggleHide`); },
  adminDeleteBook(bookId)    { return _call('DELETE', `/admin/books/${bookId}`); },

  // ─── HISTORY ────────────────────────────────────────────────────────
  upsertHistory(userId, bookId, chapterId, audioTimeline, isFinished) {
    return _call('POST', '/history', { userId, bookId, audioChapterId: chapterId, audioTimeline, isFinished });
  },
  getHistory(userId, limit = 20) {
    return _call('GET', `/history/${userId}?limit=${limit}`);
  },

  // ─── COMMENTS ───────────────────────────────────────────────────────
  getAllComments(limit = 500) { return _call('GET',  `/comments?limit=${limit}`); },
  getComments(bookId)        { return _call('GET',  `/comments/${bookId}`); },
  getUserComments(userId)    { return _call('GET',  `/comments/user/${userId}`); },
  addComment(data)           { return _call('POST', '/comments', data); },
  editComment(id, data)      { return _call('PUT',  `/comments/${id}`, data); },
  deleteComment(id)          { return _call('DELETE', `/comments/${id}`); },

  // ─── FAVORITES ──────────────────────────────────────────────────────
  toggleFavorite(userId, bookId) { return _call('POST', '/favorites', { userId, bookId }); },
  getFavorites(userId)           { return _call('GET',  `/favorites/${userId}`); },
  removeFavorite(userId, bookId) { return _call('DELETE', `/favorites/${userId}/${bookId}`); },

  // ─── SUBSCRIPTION ───────────────────────────────────────────────────
  subscribe(userId, plan, paymentInfo) {
    return _call('POST', '/subscription', { userId, plan, paymentInfo, action: 'SUBSCRIBE' });
  },
  cancelSubscription(userId) {
    return _call('POST', '/subscription', { userId, action: 'CANCEL' });
  },
  getSubscription(userId) { return _call('GET', `/subscription/${userId}`); },
};
