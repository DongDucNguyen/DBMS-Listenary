// Auth Service - quản lý session người dùng toàn ứng dụng
export const AuthService = {
  STORAGE_KEY: 'listenary_user',
  LISTEN_KEY: 'listenary_monthly_listens', // { month: 'YYYY-MM', bookIds: [] }
  MOCK_DB_KEY: 'listenary_mock_users',

  _normalizeUser(user) {
    if (!user) return null;
    if (user.roleId === 1 || user.roleId === 3) {
      return { ...user, subscriptionPlan: 'PREMIUM' };
    }
    return { ...user, subscriptionPlan: user.subscriptionPlan || 'FREE' };
  },

  async login(username, password) {
    const res = await fetch('/database.json?t=' + Date.now());
    const data = await res.json();
    let user = data.user.find(u => u.username === username && u.encryptedPassword === password);
    if (!user) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
    if (user.hasLocked) throw new Error('Tài khoản của bạn đã bị vô hiệu hóa.');
    
    // Khôi phục dữ liệu đã chỉnh sửa từ localStorage (mock backend)
    const mockUsers = JSON.parse(localStorage.getItem(this.MOCK_DB_KEY) || '{}');
    if (mockUsers[user.id]) {
      user = { ...user, ...mockUsers[user.id] };
    } else {
      // Find active subscription from userSubscriptions
      const activeSub = (data.userSubscriptions || []).find(s => s.userId === user.id);
      if (activeSub) {
        user.subscriptionPlan = activeSub.planId;
        user.subscriptionEndDate = activeSub.endDate;
        user.paymentInfo = activeSub.paymentInfo;
      } else {
        user.subscriptionPlan = 'FREE';
        user.subscriptionEndDate = null;
        user.paymentInfo = null;
      }
    }

    const role = data.role.find(r => r.id === user.roleId);
    const sessionUser = this._normalizeUser({ ...user, roleName: role?.name });
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  async register(username, email, password) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Có lỗi xảy ra khi tạo tài khoản.');
    }
    // Return newly created user object, so UI can automatically login or prompt to login
    return data.user;
  },

  logout() {
    window.dispatchEvent(new CustomEvent('listenary:logout'));
    sessionStorage.removeItem(this.STORAGE_KEY);
    window.location.hash = '#login';
  },

  getUser() {
    const raw = sessionStorage.getItem(this.STORAGE_KEY);
    return raw ? this._normalizeUser(JSON.parse(raw)) : null;
  },

  updateUser(updates) {
    const current = this.getUser();
    if (!current) return null;
    const next = this._normalizeUser({ ...current, ...updates });
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(next));
    
    // Lưu tạm vào localStorage để không mất khi đăng xuất (mock backend)
    const mockUsers = JSON.parse(localStorage.getItem(this.MOCK_DB_KEY) || '{}');
    mockUsers[next.id] = next;
    localStorage.setItem(this.MOCK_DB_KEY, JSON.stringify(mockUsers));

    window.dispatchEvent(new CustomEvent('listenary:user-updated', { detail: next }));
    return next;
  },

  cancelSubscription() {
    return this.updateUser({ subscriptionPlan: 'FREE', subscriptionEndDate: null, paymentInfo: null });
  },

  isLoggedIn() {
    return !!this.getUser();
  },

  isAdmin() {
    return this.getUser()?.roleId === 1;
  },

  isAuthor() {
    return this.getUser()?.roleId === 3;
  },

  isUser() {
    return this.getUser()?.roleId === 2;
  },

  // ── Plan helpers ───────────────────────────────────────────────────
  /** Trả về plan object từ danh sách plans đã load */
  getPlan() {
    return this.getUser()?.subscriptionPlan || 'FREE';
  },

  /** Trả về true nếu user có quyền nghe full (không bị 30s demo) */
  canListenFull() {
    const user = this.getUser();
    if (!user) return false; // khách → demo
    const plan = user.subscriptionPlan || 'FREE';
    return plan === 'BASIC' || plan === 'PREMIUM';
  },

  /** Trả về true nếu user có thể tua / chọn chương */
  canSeek() {
    const user = this.getUser();
    if (!user) return false;
    const plan = user.subscriptionPlan || 'FREE';
    return plan === 'PREMIUM';
  },

  // ── Monthly listen tracking (BASIC plan: 10 sách/tháng) ────────────
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
    // New month or not found
    const fresh = { month, bookIds: [] };
    localStorage.setItem(this.LISTEN_KEY, JSON.stringify(fresh));
    return fresh;
  },

  /** Số sách đã nghe tháng này */
  getMonthlyListenCount() {
    return this._getListenRecord().bookIds.length;
  },

  /** Kiểm tra có thể nghe bookId không (trả về { allowed, reason }) */
  checkCanListen(bookId) {
    const user = this.getUser();
    if (!user) return { allowed: false, reason: 'demo' };

    const plan = user.subscriptionPlan || 'FREE';
    if (plan === 'PREMIUM') return { allowed: true };
    if (plan === 'FREE') return { allowed: false, reason: 'demo' };

    // BASIC: 10 sách/tháng
    const record = this._getListenRecord();
    if (record.bookIds.includes(bookId)) return { allowed: true }; // đã nghe rồi → không tính thêm
    if (record.bookIds.length >= 10) {
      return { allowed: false, reason: 'limit', count: record.bookIds.length, limit: 10 };
    }
    return { allowed: true };
  },

  /** Ghi nhận user bắt đầu nghe bookId trong tháng này */
  recordListen(bookId) {
    const user = this.getUser();
    if (!user) return;
    const plan = user.subscriptionPlan || 'FREE';
    if (plan !== 'BASIC') return; // Chỉ track cho BASIC
    const record = this._getListenRecord();
    if (!record.bookIds.includes(bookId)) {
      record.bookIds.push(bookId);
      localStorage.setItem(this.LISTEN_KEY, JSON.stringify(record));
    }
  },

  // Trả về hash route mặc định theo role
  defaultRouteForRole(roleId) {
    if (roleId === 1) return '#admin';
    if (roleId === 3) return '#author';
    return '#explore';
  }
};
