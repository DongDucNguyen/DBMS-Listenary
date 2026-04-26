import { AuthService } from '../services/AuthService.js';

export class AdminPage {
  constructor() {
    this.users = [];
    this.authors = [];
    this.books = [];
    this.comments = [];
    this.isLoading = true;
    this.activeTab = 'users';
  }

  async fetchData() {
    try {
      const res = await fetch('/database.json?t=' + Date.now());
      const data = await res.json();
      this.users = data.user;
      this.authors = data.author;
      this.books = data.books;
      this.comments = data.comments || [];
      this.roles = data.role;
    } catch (err) {
      console.error(err);
    } finally {
      this.isLoading = false;
      this.reRender();
    }
  }

  _getRoleName(roleId) {
    const role = this.roles?.find(r => r.id === roleId);
    return role ? role.name.replace('ROLE_', '') : 'USER';
  }

  _getRoleColor(roleId) {
    if (roleId === 1) return '#ffd700';
    if (roleId === 3) return 'var(--color-accent)';
    return 'var(--color-primary)';
  }

  _effectivePlan(user) {
    return user.roleId === 1 || user.roleId === 3
      ? 'PREMIUM'
      : (user.subscriptionPlan || 'FREE');
  }

  _buildUsersTab() {
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:1rem;">
        <h3 style="margin:0;"><i class="fa-solid fa-users" style="color:var(--color-primary);"></i> Quản lý tài khoản</h3>
        <div style="display:flex;gap:0.75rem;align-items:center;">
          <input type="text" id="user-search" placeholder="Tìm kiếm..." style="padding:0.5rem 1rem;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);outline:none;" oninput="window._filterUsers(this.value)" />
          <select id="role-filter" style="padding:0.5rem 1rem;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);cursor:pointer;" onchange="window._filterUsers(document.getElementById('user-search').value)">
            <option value="">Tất cả vai trò</option>
            <option value="1">Admin</option>
            <option value="2">User</option>
            <option value="3">Author</option>
          </select>
        </div>
      </div>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;" id="users-table">
          <thead>
            <tr style="border-bottom:1px solid var(--glass-border);">
              <th style="padding:0.875rem;text-align:left;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Tài khoản</th>
              <th style="padding:0.875rem;text-align:center;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Vai trò</th>
              <th style="padding:0.875rem;text-align:center;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Gói</th>
              <th style="padding:0.875rem;text-align:center;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Ngày tạo</th>
              <th style="padding:0.875rem;text-align:center;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Trạng thái</th>
              <th style="padding:0.875rem;text-align:right;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Thao tác</th>
            </tr>
          </thead>
          <tbody id="users-tbody">
            ${this._renderUserRows(this.users)}
          </tbody>
        </table>
      </div>
    `;
  }

  _renderUserRows(users) {
    return users.map(user => {
      const avatarUrl = user.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.firstName||'?')+'+')}&background=444&color=fff&size=64`;
      const roleName = this._getRoleName(user.roleId);
      const roleColor = this._getRoleColor(user.roleId);
      const plan = this._effectivePlan(user);
      return `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.15s;" onmouseover="this.style.background='var(--bg-main)'" onmouseout="this.style.background='transparent'" data-roleid="${user.roleId}" data-name="${user.username} ${user.email}">
          <td style="padding:0.875rem;">
            <div style="display:flex;align-items:center;gap:0.875rem;">
              <img src="${avatarUrl}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;" />
              <div>
                <div style="font-weight:600;font-size:0.9rem;">${user.firstName} ${user.lastName}</div>
                <div style="font-size:0.78rem;color:var(--text-muted);">@${user.username} &bull; ${user.email}</div>
              </div>
            </div>
          </td>
          <td style="padding:0.875rem;text-align:center;">
            <span style="background:${roleColor}22;color:${roleColor};border:1px solid ${roleColor}55;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:700;">${roleName}</span>
          </td>
          <td style="padding:0.875rem;text-align:center;font-size:0.82rem;">
            <span style="color:${plan==='PREMIUM'?'#ffd700':'var(--text-muted)'}">${plan}</span>
          </td>
          <td style="padding:0.875rem;text-align:center;font-size:0.82rem;color:var(--text-muted);">${user.createdAt || '–'}</td>
          <td style="padding:0.875rem;text-align:center;"><span style="color:#2ed573;font-size:0.8rem;"><i class="fa-solid fa-circle" style="font-size:0.5rem;"></i> Hoạt động</span></td>
          <td style="padding:0.875rem;text-align:right;">
            <button class="btn-icon" style="width:30px;height:30px;font-size:0.75rem;" title="Xem chi tiết" onclick="alert('Chi tiết: ${user.username}')"><i class="fa-solid fa-eye"></i></button>
            <button class="btn-icon" style="width:30px;height:30px;font-size:0.75rem;" title="Chỉnh sửa" onclick="alert('Chỉnh sửa: ${user.username}')"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon" style="width:30px;height:30px;font-size:0.75rem;color:#ff4757;" title="Khóa tài khoản" onclick="if(confirm('Khóa tài khoản ${user.username}?')) alert('Đã khóa (mock)')"><i class="fa-solid fa-lock"></i></button>
          </td>
        </tr>
      `;
    }).join('');
  }

  _buildBooksTab() {
    return `
      <h3 style="margin-bottom:1.25rem;"><i class="fa-solid fa-book" style="color:var(--color-secondary);"></i> Quản lý sách</h3>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:1px solid var(--glass-border);">
              <th style="padding:0.875rem;text-align:left;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Tên sách</th>
              <th style="padding:0.875rem;text-align:center;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Tác giả ID</th>
              <th style="padding:0.875rem;text-align:center;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Năm</th>
              <th style="padding:0.875rem;text-align:right;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${this.books.slice(0, 15).map(book => `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.15s;" onmouseover="this.style.background='var(--bg-main)'" onmouseout="this.style.background='transparent'">
                <td style="padding:0.875rem;display:flex;align-items:center;gap:0.75rem;">
                  <img src="${book.thumbnailUrl}" style="width:36px;height:52px;object-fit:cover;border-radius:4px;" />
                  <span style="font-weight:500;font-size:0.9rem;">${book.name}</span>
                </td>
                <td style="padding:0.875rem;text-align:center;font-size:0.85rem;">${book.authorId || '–'}</td>
                <td style="padding:0.875rem;text-align:center;font-size:0.85rem;">${book.releaseDate || '–'}</td>
                <td style="padding:0.875rem;text-align:right;">
                  <button class="btn-icon" style="width:30px;height:30px;font-size:0.75rem;color:#ff4757;" title="Ẩn sách" onclick="alert('Đã ẩn (mock)')"><i class="fa-solid fa-eye-slash"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="color:var(--text-muted);font-size:0.82rem;margin-top:1rem;text-align:center;">Hiển thị 15/${this.books.length} sách</p>
      </div>
    `;
  }

  _buildCommentsTab() {
    return `
      <h3 style="margin-bottom:1.25rem;"><i class="fa-solid fa-comments" style="color:var(--color-accent);"></i> Quản lý bình luận</h3>
      ${this.comments.length === 0
        ? `<p style="color:var(--text-muted);text-align:center;padding:3rem;">Chưa có bình luận nào.</p>`
        : `<div style="display:flex;flex-direction:column;gap:0.75rem;">
          ${this.comments.map(c => {
            const book = this.books.find(b => b.id === c.bookId);
            const user = this.users.find(u => u.id === c.userId);
            const stars = '★'.repeat(Math.floor(c.rating));
            return `
              <div style="background:var(--bg-main);padding:1rem;border-radius:12px;display:flex;gap:1.25rem;align-items:flex-start;">
                <img src="${user?.thumbnailUrl || `https://ui-avatars.com/api/?name=${user?.username||'?'}&background=444&color=fff`}" style="width:36px;height:36px;border-radius:50%;flex-shrink:0;" />
                <div style="flex:1;">
                  <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.3rem;">
                    <span style="font-weight:600;font-size:0.85rem;">@${user?.username || 'user'}</span>
                    <div style="display:flex;gap:0.5rem;align-items:center;">
                      <span style="color:#ffd700;font-size:0.85rem;">${stars} ${c.rating}</span>
                      <span style="font-size:0.75rem;color:var(--text-muted);">${c.createdAt}</span>
                    </div>
                  </div>
                  <p style="font-size:0.82rem;font-weight:600;">${c.title}</p>
                  <p style="font-size:0.82rem;color:var(--text-muted);">${c.content}</p>
                  <p style="font-size:0.75rem;color:var(--color-primary);margin-top:0.3rem;">📖 ${book?.name || `Sách #${c.bookId}`}</p>
                </div>
                <button class="btn-icon" style="width:30px;height:30px;font-size:0.75rem;color:#ff4757;flex-shrink:0;" title="Xóa bình luận" onclick="if(confirm('Xóa bình luận này?')) alert('Đã xóa (mock)')"><i class="fa-solid fa-trash"></i></button>
              </div>
            `;
          }).join('')}
        </div>`
      }
    `;
  }

  _switchTab(tab) {
    this.activeTab = tab;
    const content = document.getElementById('admin-tab-content');
    if (!content) return;
    ['users', 'books', 'comments'].forEach(t => {
      const btn = document.getElementById(`tab-${t}`);
      if (btn) {
        btn.style.borderBottom = t === tab ? '2px solid var(--color-primary)' : '2px solid transparent';
        btn.style.color = t === tab ? 'var(--color-primary)' : 'var(--text-muted)';
      }
    });
    if (tab === 'users') content.innerHTML = this._buildUsersTab();
    else if (tab === 'books') content.innerHTML = this._buildBooksTab();
    else content.innerHTML = this._buildCommentsTab();
    this._attachTabEvents();
  }

  _attachTabEvents() {
    window._filterUsers = (query) => {
      const roleFilter = document.getElementById('role-filter')?.value;
      const rows = document.querySelectorAll('#users-tbody tr');
      rows.forEach(row => {
        const nameMatch = row.dataset.name?.toLowerCase().includes(query.toLowerCase());
        const roleMatch = !roleFilter || row.dataset.roleid === roleFilter;
        row.style.display = nameMatch && roleMatch ? '' : 'none';
      });
    };
  }

  reRender() {
    const container = document.getElementById('admin-dashboard');
    if (!container || this.isLoading) return;

    container.innerHTML = `
      <!-- Stats Row -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem;margin-bottom:2rem;">
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;cursor:pointer;" onclick="window._adminSwitchTab('users')">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(260,80%,60%,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:var(--color-primary);flex-shrink:0;"><i class="fa-solid fa-users"></i></div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;">Tổng người dùng</p><h3 style="margin:0;font-size:1.7rem;">${this.users.length}</h3></div>
        </div>
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;cursor:pointer;" onclick="window._adminSwitchTab('books')">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(320,85%,60%,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:var(--color-secondary);flex-shrink:0;"><i class="fa-solid fa-book"></i></div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;">Tổng sách</p><h3 style="margin:0;font-size:1.7rem;">${this.books.length}</h3></div>
        </div>
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(190,90%,50%,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:var(--color-accent);flex-shrink:0;"><i class="fa-solid fa-pen-nib"></i></div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;">Tác giả</p><h3 style="margin:0;font-size:1.7rem;">${this.authors.length}</h3></div>
        </div>
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;cursor:pointer;" onclick="window._adminSwitchTab('comments')">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(50,100%,50%,0.1);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:#ffd700;flex-shrink:0;"><i class="fa-solid fa-comments"></i></div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;">Bình luận</p><h3 style="margin:0;font-size:1.7rem;">${this.comments.length}</h3></div>
        </div>
      </div>

      <!-- Tab Panel -->
      <div class="glass-panel" style="padding:2rem;">
        <div style="display:flex;gap:2rem;border-bottom:1px solid var(--glass-border);margin-bottom:1.5rem;">
          <button id="tab-users" style="background:none;border:none;border-bottom:2px solid var(--color-primary);color:var(--color-primary);padding:0.5rem 0;font-size:0.95rem;font-weight:600;font-family:var(--font-sans);cursor:pointer;">Tài khoản</button>
          <button id="tab-books" style="background:none;border:none;border-bottom:2px solid transparent;color:var(--text-muted);padding:0.5rem 0;font-size:0.95rem;font-weight:500;font-family:var(--font-sans);cursor:pointer;">Sách</button>
          <button id="tab-comments" style="background:none;border:none;border-bottom:2px solid transparent;color:var(--text-muted);padding:0.5rem 0;font-size:0.95rem;font-weight:500;font-family:var(--font-sans);cursor:pointer;">Bình luận</button>
        </div>
        <div id="admin-tab-content">
          ${this._buildUsersTab()}
        </div>
      </div>
    `;

    // Tab click events
    ['users', 'books', 'comments'].forEach(tab => {
      const btn = document.getElementById(`tab-${tab}`);
      if (btn) btn.addEventListener('click', () => this._switchTab(tab));
    });

    window._adminSwitchTab = (tab) => this._switchTab(tab);
    this._attachTabEvents();
  }

  afterRender() {
    this.fetchData();
  }

  render() {
    return `
      <div class="container" style="padding-top:2rem;padding-bottom:4rem;">
        <div style="margin-bottom:2rem;" class="animate-slide-up">
          <h1 class="text-gradient">Admin Dashboard</h1>
          <p style="color:var(--text-muted);">Tổng quan hệ thống và quản trị toàn bộ hoạt động của Listenary.</p>
        </div>
        <div id="admin-dashboard" class="animate-slide-up stagger-1">
          <div style="text-align:center;padding:5rem;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:var(--color-primary);"></i></div>
        </div>
      </div>
    `;
  }
}
