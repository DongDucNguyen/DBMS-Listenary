// Auth Service - quản lý session người dùng toàn ứng dụng
import { ApiService } from './ApiService.js';

export const AuthService = {
  STORAGE_KEY: 'listenary_user',
  LISTEN_KEY:  'listenary_monthly_listens',

  _normalizeUser(user) {
    if (!user) return null;
    if (user.roleId === 1 || user.roleId === 3) {
      return { ...user, subscriptionPlan: 'PREMIUM' };
    }
    return { ...user, subscriptionPlan: user.subscriptionPlan || user.currentPlanId || 'FREE' };
  },

  async login(username, password) {
    const data = await ApiService.login(username, password);
    const raw = data.user || data;
    const userId = raw.userId || raw.id;
    // Guard: reject invalid userId (0 or null)
    if (!userId || parseInt(userId) <= 0) {
      throw new Error('Tài khoản không hợp lệ (userId=0). Vui lòng liên hệ Admin.');
    }
    const sessionUser = this._normalizeUser({
      ...raw,
      id: userId,
      subscriptionPlan: raw.currentPlanId || raw.subscriptionPlan || 'FREE',
    });
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  async register(username, email, password) {
    const data = await ApiService.register(username, email, password);
    if (data.error) throw new Error(data.error);
    return data.user;
  },

  logout() {
    window.dispatchEvent(new CustomEvent('listenary:logout'));
    sessionStorage.removeItem(this.STORAGE_KEY);
    window.location.hash = '#login';
  },

  getUser() {
    const raw = sessionStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    const user = this._normalizeUser(JSON.parse(raw));
    // Guard: invalid session with id=0
    if (!user || !user.id || parseInt(user.id) <= 0) {
      sessionStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
    return user;
  },

  updateUser(updates) {
    const current = this.getUser();
    if (!current) return null;
    const next = this._normalizeUser({ ...current, ...updates });
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('listenary:user-updated', { detail: next }));
    return next;
  },

  cancelSubscription() {
    const user = this.getUser();
    if (user) ApiService.cancelSubscription(user.id).catch(console.error);
    return this.updateUser({ subscriptionPlan: 'FREE', subscriptionEndDate: null, paymentInfo: null });
  },

  isLoggedIn() { return !!this.getUser(); },
  isAdmin()    { return this.getUser()?.roleId === 1; },
  isAuthor()   { return this.getUser()?.roleId === 3; },
  isUser()     { return this.getUser()?.roleId === 2; },
  getPlan()    { return this.getUser()?.subscriptionPlan || 'FREE'; },

  canListenFull() {
    const user = this.getUser();
    if (!user) return false;
    const plan = user.subscriptionPlan || 'FREE';
    return plan === 'BASIC' || plan === 'PREMIUM';
  },

  canSeek() {
    const user = this.getUser();
    if (!user) return false;
    return (user.subscriptionPlan || 'FREE') === 'PREMIUM';
  },

  _getListenRecord() {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const raw = localStorage.getItem(this.LISTEN_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.month === month) return parsed;
      } catch (_) {}
    }
    const fresh = { month, bookIds: [] };
    localStorage.setItem(this.LISTEN_KEY, JSON.stringify(fresh));
    return fresh;
  },

  getMonthlyListenCount() { return this._getListenRecord().bookIds.length; },

  checkCanListen(bookId) {
    const user = this.getUser();
    if (!user) return { allowed: false, reason: 'demo' };
    const plan = user.subscriptionPlan || 'FREE';
    if (plan === 'PREMIUM') return { allowed: true };
    if (plan === 'FREE')    return { allowed: false, reason: 'demo' };
    const record = this._getListenRecord();
    if (record.bookIds.includes(bookId)) return { allowed: true };
    if (record.bookIds.length >= 10) {
      return { allowed: false, reason: 'limit', count: record.bookIds.length, limit: 10 };
    }
    return { allowed: true };
  },

  recordListen(bookId) {
    const user = this.getUser();
    if (!user) return;
    if ((user.subscriptionPlan || 'FREE') !== 'BASIC') return;
    const record = this._getListenRecord();
    if (!record.bookIds.includes(bookId)) {
      record.bookIds.push(bookId);
      localStorage.setItem(this.LISTEN_KEY, JSON.stringify(record));
    }
  },

  defaultRouteForRole(roleId) {
    if (roleId === 1) return '#admin';
    if (roleId === 3) return '#author';
    return '#explore';
  }
};
