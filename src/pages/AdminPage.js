import { AuthService } from '../services/AuthService.js';
import { MockDbService } from '../services/MockDbService.js';

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
      this.categories = data.category || [];
      this.userSubscriptions = data.userSubscriptions || [];
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
    if (user.roleId === 1 || user.roleId === 3) return 'PREMIUM';
    const activeSub = this.userSubscriptions?.find(s => s.userId === user.id);
    if (activeSub) return activeSub.planId;
    return user.subscriptionPlan || 'FREE';
  }

  _getAuthorName(authorId) {
    const a = this.authors.find(x => x.id === authorId);
    return a ? `${a.firstName} ${a.lastName}`.trim() : `Author #${authorId}`;
  }

  _statusBadge(status) {
    const configs = {
      'APPROVED': { bg: 'rgba(46,213,115,0.15)', color: '#2ed573', border: 'rgba(46,213,115,0.4)', icon: 'fa-check-circle', label: 'Đã duyệt' },
      'PENDING': { bg: 'rgba(255,165,0,0.15)', color: '#ffa500', border: 'rgba(255,165,0,0.4)', icon: 'fa-clock', label: 'Chờ duyệt' },
      'REJECTED': { bg: 'rgba(255,71,87,0.15)', color: '#ff4757', border: 'rgba(255,71,87,0.4)', icon: 'fa-times-circle', label: 'Từ chối' },
    };
    const c = configs[status] || configs['APPROVED'];
    return `<span style="background:${c.bg};color:${c.color};border:1px solid ${c.border};padding:3px 10px;border-radius:20px;font-size:0.72rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><i class="fa-solid ${c.icon}" style="font-size:0.6rem;"></i>${c.label}</span>`;
  }

  _escapeAttr(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  _buildUsersTab() {
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:1rem;">
        <div style="display:flex;align-items:center;gap:1.5rem;">
          <h3 style="margin:0;"><i class="fa-solid fa-users" style="color:var(--color-primary);"></i> Quản lý tài khoản</h3>
          <button class="btn btn-primary" onclick="window._openCreateUserModal()" style="font-size:0.85rem;padding:0.4rem 1rem;">
            <i class="fa-solid fa-plus"></i> Tạo tài khoản
          </button>
        </div>
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
          <td style="padding:0.875rem;text-align:center;">
            ${user.hasLocked 
              ? `<span style="color:#ff4757;font-size:0.8rem;"><i class="fa-solid fa-circle-xmark" style="font-size:0.5rem;"></i> Bị khóa</span>`
              : `<span style="color:#2ed573;font-size:0.8rem;"><i class="fa-solid fa-circle-check" style="font-size:0.5rem;"></i> Hoạt động</span>`
            }
          </td>
          <td style="padding:0.875rem;text-align:right;">
            <button class="btn-icon" style="width:30px;height:30px;font-size:0.75rem;" title="Xem chi tiết" onclick="window._openViewUserModal(${user.id})"><i class="fa-solid fa-eye"></i></button>
            ${user.roleId === 1 ? '' : `
            <button class="btn-icon" style="width:30px;height:30px;font-size:0.75rem;color:${user.hasLocked ? '#2ed573' : '#ffa500'};" title="${user.hasLocked ? 'Mở khóa' : 'Khóa'} tài khoản" onclick="window._adminToggleLockUser(${user.id}, '${user.username}')"><i class="fa-solid ${user.hasLocked ? 'fa-unlock' : 'fa-lock'}"></i></button>
            <button class="btn-icon" style="width:30px;height:30px;font-size:0.75rem;color:#ff4757;" title="Xóa tài khoản" onclick="window._adminDeleteUser(${user.id}, '${user.username}')"><i class="fa-solid fa-trash"></i></button>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }

  _buildBooksTab() {
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:1rem;">
        <div style="display:flex;align-items:center;gap:1.5rem;">
          <h3 style="margin:0;"><i class="fa-solid fa-book" style="color:var(--color-secondary);"></i> Quản lý sách
            <span id="admin-book-count" style="font-size:0.75rem;font-weight:400;color:var(--text-muted);margin-left:8px;">${this.books.length} sách</span>
          </h3>
          <button class="btn btn-primary" onclick="window._openAddBookModal()" style="font-size:0.85rem;padding:0.4rem 1rem;">
            <i class="fa-solid fa-plus"></i> Thêm sách
          </button>
        </div>
        <div style="display:flex;gap:0.75rem;align-items:center;">
          <input type="text" id="book-search" placeholder="Tìm theo tên sách, tác giả..."
            style="padding:0.5rem 1rem;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.85rem;outline:none;min-width:260px;" />
        </div>
      </div>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:1px solid var(--glass-border);">
              <th style="padding:0.875rem;text-align:left;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Tên sách</th>
              <th style="padding:0.875rem;text-align:center;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Tác giả</th>
              <th style="padding:0.875rem;text-align:center;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Năm</th>
              <th style="padding:0.875rem;text-align:center;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Trạng thái</th>
              <th style="padding:0.875rem;text-align:right;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${this.books.map(book => {
              const authorName = this._getAuthorName(book.authorId);
              return `
                <tr class="admin-book-row" id="admin-book-${book.id}" data-search="${this._escapeAttr(book.name + ' ' + authorName).toLowerCase()}" style="border-bottom:1px solid rgba(255,255,255,0.04);transition:all 0.3s; ${book.isHidden ? 'opacity:0.5;' : ''}" onmouseover="this.style.background='var(--bg-main)'" onmouseout="this.style.background='transparent'">
                  <td style="padding:0.875rem;display:flex;align-items:center;gap:0.75rem;">
                    <div style="position:relative;">
                      <img src="${book.thumbnailUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(book.name) + '&background=333&color=fff'}" style="width:36px;height:52px;object-fit:cover;border-radius:4px;" />
                      ${book.isHidden ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;border-radius:4px;"><i class="fa-solid fa-eye-slash" style="color:#fff;font-size:0.8rem;"></i></div>` : ''}
                    </div>
                    <span style="font-weight:500;font-size:0.9rem;">${book.name}</span>
                  </td>
                  <td style="padding:0.875rem;text-align:center;font-size:0.85rem;">${authorName}</td>
                  <td style="padding:0.875rem;text-align:center;font-size:0.85rem;">${book.releaseDate || '–'}</td>
                  <td style="padding:0.875rem;text-align:center;">${this._statusBadge(book.approvalStatus || 'APPROVED')}</td>
                  <td style="padding:0.875rem;text-align:right;">
                    <button class="btn-icon admin-view-book-btn" onclick="window._openViewBookModal(${book.id})" style="width:30px;height:30px;font-size:0.75rem;color:var(--color-primary);" title="Xem chi tiết">
                      <i class="fa-solid fa-circle-info"></i>
                    </button>
                    <button class="btn-icon admin-toggle-hide-btn" data-bookid="${book.id}" style="width:30px;height:30px;font-size:0.75rem;color:var(--text-muted);" title="${book.isHidden ? 'Hiện sách' : 'Ẩn sách'}">
                      <i class="fa-solid ${book.isHidden ? 'fa-eye' : 'fa-eye-slash'}"></i>
                    </button>
                    <button class="btn-icon admin-delete-book-btn" data-bookid="${book.id}" data-bookname="${this._escapeAttr(book.name)}" style="width:30px;height:30px;font-size:0.75rem;color:#ff4757;" title="Xóa sách">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  _buildAuthorsTab() {
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:1rem;">
        <div style="display:flex;align-items:center;gap:1.5rem;">
          <h3 style="margin:0;"><i class="fa-solid fa-pen-nib" style="color:var(--color-accent);"></i> Thống kê tác giả
            <span id="admin-author-count" style="font-size:0.75rem;font-weight:400;color:var(--text-muted);margin-left:8px;">${this.authors.length} tác giả</span>
          </h3>
        </div>
        <div style="display:flex;gap:0.75rem;align-items:center;">
          <input type="text" id="author-search" placeholder="Tìm theo tên tác giả..."
            style="padding:0.5rem 1rem;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.85rem;outline:none;min-width:260px;" />
        </div>
      </div>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:1px solid var(--glass-border);">
              <th class="author-sort-header" data-sort="name" style="padding:0.875rem;text-align:left;color:var(--text-muted);font-size:0.82rem;font-weight:500;cursor:pointer;transition:color 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--text-muted)'">Tác giả <i class="fa-solid fa-sort" style="font-size:0.7rem;margin-left:4px;"></i></th>
              <th class="author-sort-header" data-sort="books" style="padding:0.875rem;text-align:center;color:var(--text-muted);font-size:0.82rem;font-weight:500;cursor:pointer;transition:color 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--text-muted)'">Số tác phẩm <i class="fa-solid fa-sort" style="font-size:0.7rem;margin-left:4px;"></i></th>
              <th class="author-sort-header" data-sort="views" style="padding:0.875rem;text-align:center;color:var(--text-muted);font-size:0.82rem;font-weight:500;cursor:pointer;transition:color 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--text-muted)'">Tổng lượt xem <i class="fa-solid fa-sort" style="font-size:0.7rem;margin-left:4px;"></i></th>
              <th class="author-sort-header" data-sort="avgviews" style="padding:0.875rem;text-align:center;color:var(--text-muted);font-size:0.82rem;font-weight:500;cursor:pointer;transition:color 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--text-muted)'">Xem trung bình <i class="fa-solid fa-sort" style="font-size:0.7rem;margin-left:4px;"></i></th>
              <th class="author-sort-header" data-sort="rating" style="padding:0.875rem;text-align:center;color:var(--text-muted);font-size:0.82rem;font-weight:500;cursor:pointer;transition:color 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--text-muted)'">Rating trung bình <i class="fa-solid fa-sort" style="font-size:0.7rem;margin-left:4px;"></i></th>
              <th style="padding:0.875rem;text-align:right;color:var(--text-muted);font-size:0.82rem;font-weight:500;">Chi tiết</th>
            </tr>
          </thead>
          <tbody id="admin-authors-tbody">
            ${this.authors.map(author => {
              const authorBooks = this.books.filter(b => b.authorId === author.id);
              const totalViews = authorBooks.reduce((sum, b) => sum + (b.viewCount || b.weeklyViewCount || 0), 0);
              const avgViews = authorBooks.length > 0 ? Math.round(totalViews / authorBooks.length) : 0;
              
              const authorComments = this.comments.filter(c => authorBooks.some(b => b.id === c.bookId));
              const avgRating = authorComments.length > 0 ? (authorComments.reduce((sum, c) => sum + c.rating, 0) / authorComments.length).toFixed(1) : '–';
              
              const avatarUrl = author.imagineUrl || author.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent((author.firstName||'?')+'+')}&background=444&color=fff&size=64`;
              const authorSubtext = author.username ? `@${author.username}` : (author.birthday || 'Tác giả');
              
              return `
                <tr class="admin-author-row" 
                    data-search="${this._escapeAttr(author.firstName + ' ' + author.lastName + ' ' + (author.username||'')).toLowerCase()}"
                    data-name="${this._escapeAttr(author.firstName + ' ' + author.lastName).toLowerCase()}"
                    data-books="${authorBooks.length}"
                    data-views="${totalViews}"
                    data-avgviews="${avgViews}"
                    data-rating="${avgRating !== '–' ? parseFloat(avgRating) : 0}"
                    style="border-bottom:1px solid rgba(255,255,255,0.04);transition:all 0.3s;" onmouseover="this.style.background='var(--bg-main)'" onmouseout="this.style.background='transparent'">
                  <td style="padding:0.875rem;display:flex;align-items:center;gap:0.75rem;">
                    <img src="${avatarUrl}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;" />
                    <div>
                      <div style="font-weight:600;font-size:0.9rem;">${author.firstName} ${author.lastName}</div>
                      <div style="font-size:0.78rem;color:var(--text-muted);">${authorSubtext}</div>
                    </div>
                  </td>
                  <td style="padding:0.875rem;text-align:center;font-size:0.9rem;font-weight:600;color:var(--color-primary);">${authorBooks.length}</td>
                  <td style="padding:0.875rem;text-align:center;font-size:0.85rem;">${totalViews.toLocaleString()}</td>
                  <td style="padding:0.875rem;text-align:center;font-size:0.85rem;">${avgViews.toLocaleString()}</td>
                  <td style="padding:0.875rem;text-align:center;font-size:0.85rem;color:#ffd700;font-weight:600;">${avgRating !== '–' ? '<i class="fa-solid fa-star"></i> ' + avgRating : '–'}</td>
                  <td style="padding:0.875rem;text-align:right;">
                    <button class="btn-icon" onclick="window._openViewUserModal(${author.id})" style="width:30px;height:30px;font-size:0.75rem;color:var(--color-accent);" title="Xem chi tiết">
                      <i class="fa-solid fa-address-card"></i>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  _buildPendingTab() {
    const pendingBooks = this.books.filter(b => b.approvalStatus === 'PENDING');
    const rejectedBooks = this.books.filter(b => b.approvalStatus === 'REJECTED');

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
        <h3 style="margin:0;"><i class="fa-solid fa-clock-rotate-left" style="color:#ffa500;"></i> Duyệt sách xuất bản</h3>
        <div style="display:flex;gap:0.75rem;align-items:center;">
          <span style="background:rgba(255,165,0,0.15);color:#ffa500;border:1px solid rgba(255,165,0,0.3);padding:4px 14px;border-radius:20px;font-size:0.78rem;font-weight:700;">
            <i class="fa-solid fa-clock"></i> ${pendingBooks.length} chờ duyệt
          </span>
          ${rejectedBooks.length > 0 ? `
            <span style="background:rgba(255,71,87,0.15);color:#ff4757;border:1px solid rgba(255,71,87,0.3);padding:4px 14px;border-radius:20px;font-size:0.78rem;font-weight:700;">
              <i class="fa-solid fa-times-circle"></i> ${rejectedBooks.length} đã từ chối
            </span>
          ` : ''}
        </div>
      </div>

      ${pendingBooks.length === 0 
        ? `<div style="text-align:center;padding:4rem 2rem;">
            <div style="width:80px;height:80px;border-radius:50%;background:rgba(46,213,115,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;font-size:2rem;">
              <i class="fa-solid fa-check-double" style="color:#2ed573;"></i>
            </div>
            <h3 style="margin:0 0 0.5rem;font-size:1.1rem;">Không có sách nào chờ duyệt</h3>
            <p style="color:var(--text-muted);font-size:0.85rem;margin:0;">Tất cả sách đã được xử lý. 🎉</p>
          </div>`
        : `<div style="display:flex;flex-direction:column;gap:1.25rem;" id="pending-books-list">
            ${pendingBooks.map(book => {
              const author = this._getAuthorName(book.authorId);
              const submitter = this.users.find(u => u.id === book.submittedByUserId);
              return `
                <div id="pending-book-${book.id}" style="background:var(--bg-main);border:1px solid rgba(255,165,0,0.2);border-radius:18px;padding:1.5rem;transition:all 0.3s;position:relative;overflow:hidden;">
                  <!-- Orange accent -->
                  <div style="position:absolute;top:0;left:0;width:4px;height:100%;background:linear-gradient(180deg,#ffa500,#ff6b35);border-radius:4px 0 0 4px;"></div>
                  
                  <div style="display:flex;gap:1.25rem;align-items:flex-start;padding-left:0.5rem;">
                    <!-- Book cover -->
                    <div style="flex-shrink:0;position:relative;">
                      <img src="${book.thumbnailUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(book.name) + '&background=7c3aed&color=fff&size=120'}" 
                        style="width:80px;height:115px;object-fit:cover;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);" />
                      <div style="position:absolute;top:-6px;right:-6px;width:24px;height:24px;border-radius:50%;background:#ffa500;display:flex;align-items:center;justify-content:center;font-size:0.6rem;color:#fff;font-weight:800;box-shadow:0 2px 8px rgba(255,165,0,0.5);">
                        <i class="fa-solid fa-clock"></i>
                      </div>
                    </div>
                    
                    <!-- Book info -->
                    <div style="flex:1;min-width:0;">
                      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:0.5rem;">
                        <div>
                          <h4 style="margin:0 0 0.25rem;font-size:1.05rem;font-weight:700;">${book.name}</h4>
                          <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
                            <span style="font-size:0.78rem;color:var(--color-secondary);">
                              <i class="fa-solid fa-pen-nib" style="font-size:0.65rem;margin-right:3px;"></i> ${author}
                            </span>
                            ${book.country ? `<span style="font-size:0.72rem;color:var(--text-muted);">· ${book.country}</span>` : ''}
                            ${book.pageNumber ? `<span style="font-size:0.72rem;color:var(--text-muted);">· ${book.pageNumber} trang</span>` : ''}
                            ${book.releaseDate ? `<span style="font-size:0.72rem;color:var(--text-muted);">· ${book.releaseDate}</span>` : ''}
                          </div>
                        </div>
                        ${this._statusBadge('PENDING')}
                      </div>
                      
                      <!-- Description -->
                      <p style="font-size:0.8rem;color:var(--text-muted);margin:0.5rem 0;line-height:1.55;
                        display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                        ${book.description || 'Không có mô tả.'}
                      </p>

                      <!-- File badges -->
                      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin:0.75rem 0;">
                        ${book.ebookFileUrl ? `
                          <span style="background:rgba(124,58,237,0.12);color:var(--color-primary);border:1px solid rgba(124,58,237,0.25);padding:3px 10px;border-radius:10px;font-size:0.68rem;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
                            <i class="fa-solid fa-file-pdf" style="font-size:0.6rem;"></i> PDF
                          </span>` : ''}
                        ${book.audioFileUrl ? `
                          <span style="background:rgba(236,72,153,0.12);color:var(--color-secondary);border:1px solid rgba(236,72,153,0.25);padding:3px 10px;border-radius:10px;font-size:0.68rem;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
                            <i class="fa-solid fa-headphones" style="font-size:0.6rem;"></i> Audio: ${book.audioFileUrl}
                          </span>` : ''}
                        ${book.copyrightFileUrl ? `
                          <span style="background:rgba(255,165,0,0.12);color:#ffa500;border:1px solid rgba(255,165,0,0.25);padding:3px 10px;border-radius:10px;font-size:0.68rem;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
                            <i class="fa-solid fa-file-zipper" style="font-size:0.6rem;"></i> Bản quyền: ${book.copyrightFileUrl}
                          </span>` : ''}
                      </div>

                      <!-- Meta -->
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.75rem;flex-wrap:wrap;gap:0.5rem;">
                        <div style="font-size:0.72rem;color:var(--text-muted);">
                          ${submitter ? `<i class="fa-solid fa-user" style="margin-right:3px;"></i> Gửi bởi: @${submitter.username}` : ''}
                          ${book.submittedAt ? ` · <i class="fa-regular fa-clock" style="margin-right:3px;"></i>${new Date(book.submittedAt).toLocaleDateString('vi-VN')}` : ''}
                        </div>
                        <!-- Action buttons -->
                        <div style="display:flex;gap:0.5rem;">
                          <a href="#book?id=${book.id}" class="btn view-book-btn"
                            style="background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.3);color:var(--color-primary);padding:6px 16px;border-radius:10px;font-size:0.78rem;font-weight:700;text-decoration:none;display:flex;align-items:center;gap:5px;transition:all 0.2s;font-family:var(--font-sans);"
                            onmouseover="this.style.background='var(--color-primary)';this.style.color='#fff'"
                            onmouseout="this.style.background='rgba(124,58,237,0.12)';this.style.color='var(--color-primary)'">
                            <i class="fa-solid fa-eye"></i> Xem chi tiết
                          </a>
                          <button class="btn approve-book-btn" 
                            data-bookid="${book.id}" data-bookname="${book.name.replace(/"/g, '&quot;')}"
                            style="background:rgba(46,213,115,0.15);border:1px solid rgba(46,213,115,0.35);color:#2ed573;padding:6px 16px;border-radius:10px;font-size:0.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all 0.2s;font-family:var(--font-sans);"
                            onmouseover="this.style.background='#2ed573';this.style.color='#fff'"
                            onmouseout="this.style.background='rgba(46,213,115,0.15)';this.style.color='#2ed573'">
                            <i class="fa-solid fa-check"></i> Duyệt
                          </button>
                          <button class="btn reject-book-btn"
                            data-bookid="${book.id}" data-bookname="${book.name.replace(/"/g, '&quot;')}"
                            style="background:rgba(255,71,87,0.12);border:1px solid rgba(255,71,87,0.3);color:#ff4757;padding:6px 16px;border-radius:10px;font-size:0.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all 0.2s;font-family:var(--font-sans);"
                            onmouseover="this.style.background='#ff4757';this.style.color='#fff'"
                            onmouseout="this.style.background='rgba(255,71,87,0.12)';this.style.color='#ff4757'">
                            <i class="fa-solid fa-xmark"></i> Từ chối
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>`
      }
    `;
  }

  _buildCommentsTab() {
    const totalCount = this.comments.length;
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:1rem;">
        <h3 style="margin:0;"><i class="fa-solid fa-comments" style="color:var(--color-accent);"></i> Quản lý bình luận
          <span id="admin-comment-count" style="font-size:0.75rem;font-weight:400;color:var(--text-muted);margin-left:8px;">${totalCount} bình luận</span>
        </h3>
        <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
          <input type="text" id="comment-search" placeholder="Tìm theo user, sách, nội dung..."
            style="padding:0.45rem 1rem;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);font-size:0.82rem;outline:none;min-width:220px;" />
          <select id="comment-rating-filter"
            style="padding:0.45rem 0.75rem;border-radius:10px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-family:var(--font-sans);cursor:pointer;font-size:0.82rem;">
            <option value="">Tất cả sao</option>
            <option value="5">5 ★</option>
            <option value="4">4 ★</option>
            <option value="3">3 ★</option>
            <option value="2">2 ★</option>
            <option value="1">1 ★</option>
          </select>
        </div>
      </div>
      ${this.comments.length === 0
        ? `<p style="color:var(--text-muted);text-align:center;padding:3rem;">Chưa có bình luận nào.</p>`
        : `<div id="admin-comments-list" style="display:flex;flex-direction:column;gap:0.75rem;">
          ${this.comments.map(c => {
            const book = this.books.find(b => b.id === c.bookId);
            const user = this.users.find(u => u.id === c.userId);
            const stars = '★'.repeat(Math.floor(c.rating)) + '☆'.repeat(5 - Math.floor(c.rating));
            const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : c.createdAt || '';
            const avatarUrl = user?.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username||'?')}&background=444&color=fff`;
            return `
              <div class="admin-comment-row" id="admin-comment-${c.id}"
                data-cid="${c.id}"
                data-search="${((user?.username||'') + ' ' + (book?.name||'') + ' ' + (c.title||'') + ' ' + (c.content||'')).toLowerCase()}"
                data-rating="${c.rating}"
                style="background:var(--bg-main);padding:1rem 1.25rem;border-radius:14px;display:flex;gap:1.25rem;align-items:flex-start;border:1px solid var(--glass-border);transition:all 0.2s;">
                <img src="${avatarUrl}" style="width:38px;height:38px;border-radius:50%;flex-shrink:0;object-fit:cover;" />
                <div style="flex:1;min-width:0;">
                  <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.3rem;">
                    <span style="font-weight:700;font-size:0.88rem;">@${user?.username || 'user'}</span>
                    <div style="display:flex;gap:0.75rem;align-items:center;">
                      <span style="color:#ffd700;font-size:0.82rem;letter-spacing:1px;">${stars}</span>
                      <span style="font-size:0.72rem;color:var(--text-muted);">${dateStr}</span>
                    </div>
                  </div>
                  ${c.title ? `<p style="font-size:0.85rem;font-weight:600;margin:0 0 0.2rem;">${c.title}</p>` : ''}
                  <p style="font-size:0.82rem;color:var(--text-muted);margin:0 0 0.3rem;line-height:1.55;">${c.content}</p>
                  <p style="font-size:0.72rem;color:var(--color-primary);margin:0;">📖 ${book?.name || `Sách #${c.bookId}`}</p>
                </div>
                <button class="btn-icon admin-delete-comment-btn" data-cid="${c.id}"
                  style="width:32px;height:32px;font-size:0.78rem;color:#ff4757;flex-shrink:0;background:rgba(255,71,87,0.08);border-radius:8px;transition:all 0.2s;"
                  title="Xóa bình luận"
                  onmouseover="this.style.background='rgba(255,71,87,0.2)'"
                  onmouseout="this.style.background='rgba(255,71,87,0.08)'">
                  <i class="fa-solid fa-trash"></i>
                </button>
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
    ['users', 'books', 'pending', 'authors', 'comments'].forEach(t => {
      const btn = document.getElementById(`tab-${t}`);
      if (btn) {
        btn.style.borderBottom = t === tab ? '2px solid var(--color-primary)' : '2px solid transparent';
        btn.style.color = t === tab ? 'var(--color-primary)' : 'var(--text-muted)';
        btn.style.fontWeight = t === tab ? '600' : '500';
      }
    });
    if (tab === 'users') content.innerHTML = this._buildUsersTab();
    else if (tab === 'books') content.innerHTML = this._buildBooksTab();
    else if (tab === 'pending') content.innerHTML = this._buildPendingTab();
    else if (tab === 'authors') content.innerHTML = this._buildAuthorsTab();
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

    // Book search filter
    const applyBookSearch = () => {
      const q = (document.getElementById('book-search')?.value || '').toLowerCase();
      const rows = document.querySelectorAll('.admin-book-row');
      let visible = 0;
      rows.forEach(row => {
        const matchText = !q || (row.dataset.search && row.dataset.search.includes(q));
        row.style.display = matchText ? '' : 'none';
        if (matchText) visible++;
      });
      const countEl = document.getElementById('admin-book-count');
      if (countEl) countEl.textContent = `${visible} sách`;
    };
    document.getElementById('book-search')?.addEventListener('input', applyBookSearch);

    // Author search filter
    const applyAuthorSearch = () => {
      const q = (document.getElementById('author-search')?.value || '').toLowerCase();
      const rows = document.querySelectorAll('.admin-author-row');
      let visible = 0;
      rows.forEach(row => {
        const matchText = !q || (row.dataset.search && row.dataset.search.includes(q));
        row.style.display = matchText ? '' : 'none';
        if (matchText) visible++;
      });
      const countEl = document.getElementById('admin-author-count');
      if (countEl) countEl.textContent = `${visible} tác giả`;
    };
    document.getElementById('author-search')?.addEventListener('input', applyAuthorSearch);

    // Author sorting logic
    let authorSortField = null;
    let authorSortDir = -1; // -1 for descending, 1 for ascending
    document.querySelectorAll('.author-sort-header').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (authorSortField === field) {
          authorSortDir *= -1;
        } else {
          authorSortField = field;
          authorSortDir = field === 'name' ? 1 : -1; // Default: asc for name, desc for numbers
        }
        
        // Reset and update icons
        document.querySelectorAll('.author-sort-header i').forEach(icon => {
          icon.className = 'fa-solid fa-sort';
          icon.style.color = 'var(--text-muted)';
        });
        const currentIcon = th.querySelector('i');
        currentIcon.className = authorSortDir === 1 ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
        currentIcon.style.color = 'var(--color-primary)';

        const tbody = document.getElementById('admin-authors-tbody');
        if (!tbody) return;
        const rows = Array.from(tbody.querySelectorAll('.admin-author-row'));
        rows.sort((a, b) => {
          let valA = a.dataset[field];
          let valB = b.dataset[field];
          
          if (field === 'name') {
            return valA.localeCompare(valB) * authorSortDir;
          } else {
            return (parseFloat(valA) - parseFloat(valB)) * authorSortDir;
          }
        });
        
        // Append sorted rows (moves them in the DOM)
        rows.forEach(r => tbody.appendChild(r));
      });
    });

    // Comment search + filter
    const applyCommentFilters = () => {
      const q = (document.getElementById('comment-search')?.value || '').toLowerCase();
      const r = document.getElementById('comment-rating-filter')?.value || '';
      const rows = document.querySelectorAll('.admin-comment-row');
      let visible = 0;
      rows.forEach(row => {
        const matchText = !q || row.dataset.search?.includes(q);
        const matchRating = !r || Math.floor(parseFloat(row.dataset.rating)) === parseInt(r);
        const show = matchText && matchRating;
        row.style.display = show ? 'flex' : 'none';
        if (show) visible++;
      });
      const countEl = document.getElementById('admin-comment-count');
      if (countEl) countEl.textContent = `${visible} bình luận`;
    };
    document.getElementById('comment-search')?.addEventListener('input', applyCommentFilters);
    document.getElementById('comment-rating-filter')?.addEventListener('change', applyCommentFilters);

    // Admin delete comment buttons
    document.querySelectorAll('.admin-delete-comment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cid = parseInt(btn.dataset.cid, 10);
        if (!confirm('Xóa bình luận này? Hành động không thể hoàn tác.')) return;

        // Animate out
        const row = document.getElementById(`admin-comment-${cid}`);
        if (row) {
          row.style.transition = 'all 0.35s ease';
          row.style.opacity = '0';
          row.style.transform = 'translateX(30px)';
          row.style.maxHeight = row.offsetHeight + 'px';
          setTimeout(() => {
            row.style.maxHeight = '0';
            row.style.padding = '0';
            row.style.margin = '0';
            row.style.overflow = 'hidden';
            setTimeout(() => row.remove(), 350);
          }, 300);
        }

        // Persist
        MockDbService.deleteComment(cid);
        this.comments = this.comments.filter(c => parseInt(c.id, 10) !== cid);

        // Cập nhật count
        const countEl = document.getElementById('admin-comment-count');
        if (countEl) {
          const remaining = document.querySelectorAll('.admin-comment-row:not([style*="display: none"])').length - 1;
          countEl.textContent = `${remaining} bình luận`;
        }

        this._toast('Đã xóa bình luận!');
      });
    });

    // Admin delete book from books tab
    document.querySelectorAll('.admin-delete-book-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const bookId = parseInt(btn.dataset.bookid, 10);
        const bookName = btn.dataset.bookname;
        if (!confirm(`Xóa hoàn toàn sách "${bookName}" khỏi hệ thống?\nHành động này không thể hoàn tác.`)) return;

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btn.disabled = true;

        try {
          const res = await fetch(`/api/admin/books/${bookId}`, { method: 'DELETE' });
          const result = await res.json();
          if (result.success) {
            const row = document.getElementById(`admin-book-${bookId}`);
            if (row) {
              row.style.opacity = '0';
              row.style.transform = 'translateX(30px)';
              setTimeout(() => row.remove(), 300);
            }
            this.books = this.books.filter(b => b.id !== bookId);
            this._toast('Đã xóa sách!');
            // Update counts in stats
            this.reRender();
          } else {
            alert('Lỗi: ' + (result.error || 'Không thể xóa sách'));
            btn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            btn.disabled = false;
          }
        } catch (err) {
          console.error(err);
          alert('Có lỗi xảy ra khi xóa sách.');
          btn.innerHTML = '<i class="fa-solid fa-trash"></i>';
          btn.disabled = false;
        }
      });
    });

    // Admin toggle hide book
    document.querySelectorAll('.admin-toggle-hide-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const bookId = parseInt(btn.dataset.bookid, 10);
        
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btn.disabled = true;

        try {
          const res = await fetch(`/api/admin/books/${bookId}/toggleHide`, { method: 'POST' });
          const result = await res.json();
          if (result.success) {
            const book = this.books.find(b => b.id === bookId);
            if (book) book.isHidden = result.isHidden;
            this._toast(result.isHidden ? 'Đã ẩn sách!' : 'Đã hiện sách!');
            this._switchTab('books'); // refresh tab to reflect changes
          } else {
            alert('Lỗi: ' + (result.error || 'Không thể thao tác'));
            this._switchTab('books');
          }
        } catch (err) {
          console.error(err);
          alert('Có lỗi xảy ra.');
          this._switchTab('books');
        }
      });
    });

    // Approve book buttons
    document.querySelectorAll('.approve-book-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const bookId = parseInt(btn.dataset.bookid);
        const bookName = btn.dataset.bookname;
        if (!confirm(`Xác nhận duyệt sách "${bookName}"?`)) return;

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang duyệt...';
        btn.disabled = true;

        try {
          const res = await fetch(`/api/books/${bookId}/approve`, { method: 'POST' });
          const result = await res.json();
          if (result.success) {
            // Animate out the pending card
            const card = document.getElementById(`pending-book-${bookId}`);
            if (card) {
              card.style.transition = 'all 0.5s ease';
              card.style.borderColor = 'rgba(46,213,115,0.5)';
              card.style.background = 'rgba(46,213,115,0.08)';
              card.querySelector('.approve-book-btn').outerHTML = `
                <span style="color:#2ed573;font-size:0.82rem;font-weight:700;display:flex;align-items:center;gap:4px;">
                  <i class="fa-solid fa-check-circle"></i> Đã duyệt
                </span>
              `;
              const rejectBtn = card.querySelector('.reject-book-btn');
              if (rejectBtn) rejectBtn.remove();
              
              setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateX(30px)';
                setTimeout(() => card.remove(), 400);
              }, 1500);
            }
            // Update local book data
            const book = this.books.find(b => b.id === bookId);
            if (book) book.approvalStatus = 'APPROVED';
            
            // Update pending count badge
            this._updatePendingCount();
          }
        } catch (err) {
          console.error(err);
          alert('Có lỗi xảy ra khi duyệt sách.');
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Duyệt';
          btn.disabled = false;
        }
      });
    });

    // Reject book buttons
    document.querySelectorAll('.reject-book-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const bookId = parseInt(btn.dataset.bookid);
        const bookName = btn.dataset.bookname;
        const reason = prompt(`Lý do từ chối sách "${bookName}":`);
        if (reason === null) return; // User cancelled

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
        btn.disabled = true;

        try {
          const res = await fetch(`/api/books/${bookId}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
          });
          const result = await res.json();
          if (result.success) {
            const card = document.getElementById(`pending-book-${bookId}`);
            if (card) {
              card.style.transition = 'all 0.5s ease';
              card.style.borderColor = 'rgba(255,71,87,0.5)';
              card.style.background = 'rgba(255,71,87,0.06)';
              card.querySelector('.reject-book-btn').outerHTML = `
                <span style="color:#ff4757;font-size:0.82rem;font-weight:700;display:flex;align-items:center;gap:4px;">
                  <i class="fa-solid fa-times-circle"></i> Đã từ chối
                </span>
              `;
              const approveBtn = card.querySelector('.approve-book-btn');
              if (approveBtn) approveBtn.remove();
              
              setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateX(30px)';
                setTimeout(() => card.remove(), 400);
              }, 1500);
            }
            const book = this.books.find(b => b.id === bookId);
            if (book) book.approvalStatus = 'REJECTED';
            
            this._updatePendingCount();
          }
        } catch (err) {
          console.error(err);
          alert('Có lỗi xảy ra khi từ chối sách.');
          btn.innerHTML = '<i class="fa-solid fa-xmark"></i> Từ chối';
          btn.disabled = false;
        }
      });
    });
  }

  _buildCreateUserModal() {
    return `
      <div id="admin-create-user-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);z-index:99999;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;">
        <div style="background:var(--bg-panel-solid);border:1px solid var(--glass-border);border-radius:16px;width:90%;max-width:550px;max-height:85vh;overflow-y:auto;transform:scale(0.95);transition:transform 0.2s;">
          <div style="padding:1.5rem;border-bottom:1px solid var(--glass-border);display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:var(--bg-panel-solid);z-index:10;">
            <h3 style="margin:0;font-size:1.15rem;"><i class="fa-solid fa-user-plus" style="color:var(--color-primary);"></i> Tạo tài khoản mới</h3>
            <button onclick="window._closeCreateUserModal()" style="background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form id="admin-create-user-form" style="padding:1.5rem;display:grid;gap:1.25rem;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
                Username (*)
                <input type="text" name="username" required style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
              </label>
              <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
                Email (*)
                <input type="email" name="email" required style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
              </label>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
                Mật khẩu (*)
                <input type="password" name="password" required style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
              </label>
              <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
                Vai trò (*)
                <select name="roleId" required style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;">
                  <option value="2">User</option>
                  <option value="3">Author</option>
                  <option value="1">Admin</option>
                </select>
              </label>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
                Họ hoặc Tên đệm
                <input type="text" name="firstName" style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
              </label>
              <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
                Tên
                <input type="text" name="lastName" style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
              </label>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
                Số điện thoại
                <input type="text" name="phoneNumber" style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
              </label>
              <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
                Ngày sinh
                <input type="date" name="birthday" style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);color-scheme:dark;outline:none;" />
              </label>
            </div>
            <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
              Địa chỉ
              <input type="text" name="addresses" style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
            </label>
            <div style="display:flex;justify-content:flex-end;gap:1rem;margin-top:0.75rem;">
              <button type="button" class="btn" style="background:var(--bg-main);border:1px solid var(--glass-border);color:var(--text-main);" onclick="window._closeCreateUserModal()">Hủy</button>
              <button type="submit" class="btn btn-primary" id="btn-admin-submit-create-user">
                <i class="fa-solid fa-plus"></i> Tạo tài khoản
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  _buildViewUserModal() {
    return `
      <div id="admin-view-user-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);z-index:99999;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;">
        <div style="background:var(--bg-panel-solid);border:1px solid var(--glass-border);border-radius:16px;width:90%;max-width:550px;max-height:85vh;overflow-y:auto;transform:scale(0.95);transition:transform 0.2s;">
          <div style="padding:1.5rem;border-bottom:1px solid var(--glass-border);display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:var(--bg-panel-solid);z-index:10;">
            <h3 style="margin:0;font-size:1.15rem;"><i class="fa-solid fa-address-card" style="color:var(--color-primary);"></i> Chi tiết tài khoản</h3>
            <button onclick="window._closeViewUserModal()" style="background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div id="admin-view-user-content" style="padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem;">
            <!-- Render dynamically -->
          </div>
        </div>
      </div>
    `;
  }

  _buildAddBookModal() {
    return `
      <div id="admin-add-book-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);z-index:99999;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;">
        <div style="background:var(--bg-panel-solid);border:1px solid var(--glass-border);border-radius:16px;width:90%;max-width:600px;max-height:85vh;overflow-y:auto;transform:scale(0.95);transition:transform 0.2s;">
          <div style="padding:1.5rem;border-bottom:1px solid var(--glass-border);display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:var(--bg-panel-solid);z-index:10;">
            <h3 style="margin:0;font-size:1.15rem;"><i class="fa-solid fa-book-medical" style="color:var(--color-primary);"></i> Thêm sách mới</h3>
            <button onclick="window._closeAddBookModal()" style="background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form id="admin-add-book-form" style="padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem;">
            <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
              Tên sách (*)
              <input type="text" name="name" required style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
            </label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
                Tác giả (*)
                <select name="authorId" required style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" onchange="document.getElementById('admin-book-new-author').style.display = this.value === 'NEW' ? 'block' : 'none'; if(this.value !== 'NEW') document.getElementById('admin-book-new-author').value='';">
                  <option value="">Lựa chọn tác giả</option>
                  ${this.authors.map(a => `<option value="${a.id}">${a.firstName} ${a.lastName}</option>`).join('')}
                  <option value="NEW">✨ + Thêm tác giả mới</option>
                </select>
                <input type="text" id="admin-book-new-author" name="newAuthorName" placeholder="Nhập Họ và Tên tác giả mới..." style="display:none;margin-top:0.5rem;padding:0.75rem;border-radius:8px;border:1px dashed var(--color-primary);background:var(--bg-main);color:var(--text-main);outline:none;" />
              </label>
              <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
                Thể loại (*)
                <select name="categoryId" required style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;">
                  <option value="">Lựa chọn thể loại</option>
                  ${this.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </label>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
                Quốc gia
                <input type="text" name="country" style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
              </label>
              <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
                Năm phát hành
                <input type="number" name="releaseDate" style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
              </label>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
                Thumbnail URL
                <input type="url" name="thumbnailUrl" style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
              </label>
              <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
                Ebook URL (Không bắt buộc nếu upload file)
                <input type="url" id="admin-pub-ebook-url" name="ebookFileUrl" style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;" />
              </label>
            </div>

            <!-- File Upload Grid -->
            <style>
              .admin-upload-zone.drag-over { border-color: var(--color-primary) !important; background: rgba(108,92,231,0.05) !important; }
              .admin-upload-zone.has-file { border-color: #2ed573 !important; border-style: solid !important; }
              .admin-upload-zone.has-file .upload-icon { color: #2ed573 !important; background: rgba(46,213,115,0.15) !important; }
            </style>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:0.5rem;">
              <!-- PDF -->
              <div class="admin-upload-zone" id="admin-zone-pdf" style="border:2px dashed var(--glass-border);border-radius:12px;padding:1rem;text-align:center;cursor:pointer;background:var(--bg-main);transition:all 0.3s;">
                <input type="file" id="admin-file-pdf" accept=".pdf" style="display:none;" />
                <div class="upload-icon" style="font-size:1.5rem;color:var(--color-primary);margin-bottom:0.5rem;width:48px;height:48px;border-radius:50%;background:rgba(108,92,231,0.1);display:inline-flex;align-items:center;justify-content:center;transition:all 0.3s;"><i class="fa-solid fa-file-pdf"></i></div>
                <div id="admin-pdf-label" style="font-size:0.8rem;color:var(--text-main);font-weight:600;">Ebook (PDF)</div>
              </div>

              <!-- Audio -->
              <div class="admin-upload-zone" id="admin-zone-audio" style="border:2px dashed var(--glass-border);border-radius:12px;padding:1rem;text-align:center;cursor:pointer;background:var(--bg-main);transition:all 0.3s;">
                <input type="file" id="admin-file-audio" accept="audio/*" style="display:none;" />
                <div class="upload-icon" style="font-size:1.5rem;color:var(--color-secondary);margin-bottom:0.5rem;width:48px;height:48px;border-radius:50%;background:rgba(253,121,168,0.1);display:inline-flex;align-items:center;justify-content:center;transition:all 0.3s;"><i class="fa-solid fa-file-audio"></i></div>
                <div id="admin-audio-label" style="font-size:0.8rem;color:var(--text-main);font-weight:600;">Audio sách</div>
              </div>

              <!-- Copyright -->
              <div class="admin-upload-zone" id="admin-zone-copyright" style="border:2px dashed var(--glass-border);border-radius:12px;padding:1rem;text-align:center;cursor:pointer;background:var(--bg-main);transition:all 0.3s;">
                <input type="file" id="admin-file-copyright" accept=".zip,.rar,.7z" style="display:none;" />
                <div class="upload-icon" style="font-size:1.5rem;color:#ffa500;margin-bottom:0.5rem;width:48px;height:48px;border-radius:50%;background:rgba(255,165,0,0.1);display:inline-flex;align-items:center;justify-content:center;transition:all 0.3s;"><i class="fa-solid fa-file-zipper"></i></div>
                <div id="admin-copyright-label" style="font-size:0.8rem;color:var(--text-main);font-weight:600;">Hồ sơ bản quyền</div>
              </div>
            </div>
            <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
              Mô tả sách
              <textarea name="description" rows="4" style="padding:0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);outline:none;resize:vertical;"></textarea>
            </label>

            <label style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.85rem;color:var(--text-muted);font-weight:600;">
              Danh sách chương (*)
              <div id="admin-add-book-chapters-container" style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:0.5rem;"></div>
              <button type="button" id="admin-add-book-add-chapter-btn" class="btn" style="background:var(--bg-main);border:1px dashed var(--color-primary);color:var(--color-primary);width:100%;padding:0.75rem;border-radius:12px;">
                <i class="fa-solid fa-plus"></i> Thêm chương mới
              </button>
            </label>
            
            <div style="display:flex;justify-content:flex-end;gap:1rem;margin-top:0.75rem;">
              <button type="button" class="btn" style="background:var(--bg-main);border:1px solid var(--glass-border);color:var(--text-main);" onclick="window._closeAddBookModal()">Hủy</button>
              <button type="submit" class="btn btn-primary" id="btn-admin-submit-add-book">
                <i class="fa-solid fa-plus"></i> Thêm sách
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  _buildViewBookModal() {
    return `
      <div id="admin-view-book-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);z-index:99999;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;">
        <div id="admin-view-book-content" style="background:var(--bg-panel-solid);border:1px solid var(--glass-border);border-radius:16px;width:90%;max-width:700px;max-height:85vh;overflow-y:auto;transform:scale(0.95);transition:transform 0.2s;position:relative;">
        </div>
      </div>
    `;
  }

  _attachCreateUserEvents() {
    window._openCreateUserModal = () => {
      const modal = document.getElementById('admin-create-user-modal');
      const form = document.getElementById('admin-create-user-form');
      if(form) form.reset();
      if(modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
          modal.style.opacity = '1';
          modal.firstElementChild.style.transform = 'scale(1)';
        }, 10);
      }
    };
    window._closeCreateUserModal = () => {
      const modal = document.getElementById('admin-create-user-modal');
      if(modal) {
        modal.style.opacity = '0';
        modal.firstElementChild.style.transform = 'scale(0.95)';
        setTimeout(() => modal.style.display = 'none', 200);
      }
    };

    const form = document.getElementById('admin-create-user-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const payload = Object.fromEntries(fd.entries());
        
        const btn = document.getElementById('btn-admin-submit-create-user');
        const ogHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tạo...';
        btn.disabled = true;

        try {
          const raw = await fetch('/api/admin/users/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const res = await raw.json();
          if (res.success) {
            this._toast('Thêm tài khoản thành công', 'success');
            window._closeCreateUserModal();
            this.users.unshift(res.user);
            if (this.currentTab === 'users') {
              this._reRenderTab();
            }
          } else {
            this._toast('Lỗi: ' + (res.error || 'Cập nhật thất bại'), 'error');
          }
        } catch (e) {
          console.error(e);
          this._toast('Lỗi hệ thống khi tạo tài khoản', 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = ogHtml;
        }
      });
    }

    // Toggle Lock User
    window._adminToggleLockUser = async (id, name) => {
      if(!confirm(`Xác nhận thay đổi trạng thái khóa tài khoản của ${name}?`)) return;
      try {
        const res = await fetch(`/api/admin/users/${id}/toggleLock`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          const uIdx = this.users.findIndex(u => u.id === id);
          if(uIdx > -1) {
            this.users[uIdx].hasLocked = data.hasLocked;
            this._toast(data.hasLocked ? 'Đã vô hiệu hóa tài khoản' : 'Đã mở khóa tài khoản', 'success');
            if(this.currentTab === 'users') this._reRenderTab();
          }
        } else {
          this._toast('Lỗi: ' + (data.error || 'Cập nhật thất bại'), 'error');
        }
      } catch (err) {
        console.error(err);
        this._toast('Lỗi mạng', 'error');
      }
    };

    // Delete User
    window._adminDeleteUser = async (id, name) => {
      if(!confirm(`Bạn CÓ CHẮC CHẮN muốn XÓA VĨNH VIỄN tài khoản ${name} không? Dữ liệu không thể khôi phục.`)) return;
      try {
        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          this.users = this.users.filter(u => u.id !== id);
          this._toast('Đã xóa tài khoản vĩnh viễn', 'success');
          if(this.currentTab === 'users') this._reRenderTab();
          this.reRender(); // render thong ke
        } else {
          this._toast('Lỗi: ' + (data.error || 'Xóa thất bại'), 'error');
        }
      } catch (err) {
        console.error(err);
        this._toast('Lỗi mạng', 'error');
      }
    };
    // View User Modal
    window._openViewUserModal = (id) => {
      const user = this.users.find(u => u.id === id);
      if(!user) return;
      
      const roleName = this._getRoleName(user.roleId);
      const roleColor = this._getRoleColor(user.roleId);
      const plan = this._effectivePlan(user);
      const avatarUrl = user.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.firstName||'?')+'+')}&background=444&color=fff&size=80`;
      
      const content = document.getElementById('admin-view-user-content');
      if(content) {
        content.innerHTML = `
          <div style="display:flex;align-items:center;gap:1.5rem;padding-bottom:1rem;border-bottom:1px dashed var(--glass-border);">
            <img src="${avatarUrl}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;box-shadow:0 4px 12px rgba(0,0,0,0.3);" />
            <div>
              <h2 style="margin:0 0 0.25rem;font-size:1.4rem;">${user.firstName} ${user.lastName}</h2>
              <div style="color:var(--text-muted);font-size:0.9rem;margin-bottom:0.75rem;">@${user.username}</div>
              <div style="display:flex;gap:0.75rem;">
                <span style="background:${roleColor}22;color:${roleColor};border:1px solid ${roleColor}55;padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;">${roleName}</span>
                <span style="background:hsla(50,100%,50%,0.15);color:#ffd700;border:1px solid hsla(50,100%,50%,0.3);padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;">${plan}</span>
              </div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;font-size:0.9rem;">
            <div>
              <div style="color:var(--text-muted);margin-bottom:0.2rem;font-size:0.8rem;">Email</div>
              <div style="font-weight:500;">${user.email} ${user.emailVerifiedAt ? '<i class="fa-solid fa-check-circle" style="color:#2ed573;margin-left:4px;font-size:0.7rem;" title="Đã xác thực"></i>' : ''}</div>
            </div>
            <div>
              <div style="color:var(--text-muted);margin-bottom:0.2rem;font-size:0.8rem;">Số điện thoại</div>
              <div style="font-weight:500;">${user.phoneNumber || '<em>Chưa cập nhật</em>'}</div>
            </div>
            <div>
              <div style="color:var(--text-muted);margin-bottom:0.2rem;font-size:0.8rem;">Ngày sinh</div>
              <div style="font-weight:500;">${user.birthday || '<em>Chưa cập nhật</em>'}</div>
            </div>
            <div>
              <div style="color:var(--text-muted);margin-bottom:0.2rem;font-size:0.8rem;">Ngày tham gia</div>
              <div style="font-weight:500;">${new Date(user.createdAt || Date.now()).toLocaleDateString('vi-VN')}</div>
            </div>
            <div style="grid-column:1 / -1;">
              <div style="color:var(--text-muted);margin-bottom:0.2rem;font-size:0.8rem;">Địa chỉ liên hệ</div>
              <div style="font-weight:500;">${user.addresses || '<em>Chưa cập nhật</em>'}</div>
            </div>
            <div style="grid-column:1 / -1;">
              <div style="color:var(--text-muted);margin-bottom:0.2rem;font-size:0.8rem;">Trạng thái tài khoản</div>
              ${user.hasLocked 
                ? `<div style="font-weight:700;color:#ff4757;background:rgba(255,71,87,0.1);padding:0.5rem 1rem;border-radius:8px;display:inline-block;"><i class="fa-solid fa-lock"></i> Đã bị vô hiệu hóa</div>`
                : `<div style="font-weight:700;color:#2ed573;background:rgba(46,213,115,0.1);padding:0.5rem 1rem;border-radius:8px;display:inline-block;"><i class="fa-solid fa-check-circle"></i> Đang hoạt động bình thường</div>`
              }
            </div>
          </div>
        `;
      }
      
      const viewModal = document.getElementById('admin-view-user-modal');
      if(viewModal) {
        viewModal.style.display = 'flex';
        setTimeout(() => {
          viewModal.style.opacity = '1';
          viewModal.firstElementChild.style.transform = 'scale(1)';
        }, 10);
      }
    };
    
    window._closeViewUserModal = () => {
      const viewModal = document.getElementById('admin-view-user-modal');
      if(viewModal) {
        viewModal.style.opacity = '0';
        viewModal.firstElementChild.style.transform = 'scale(0.95)';
        setTimeout(() => viewModal.style.display = 'none', 200);
      }
    };

    window._openViewBookModal = (bookId) => {
      const book = this.books.find(b => b.id === bookId);
      if (!book) return;
      const authorName = this._getAuthorName(book.authorId);
      const cat = this.categories.find(c => c.id === book.categoryId) || {name: 'Chưa cập nhật'};
      const subs = this.users.find(u => u.id === book.submittedByUserId);
      const submitterName = subs ? subs.firstName + ' ' + subs.lastName : 'N/A';
      const cDate = new Date(book.createdAt).toLocaleString('vi-VN');

      const modal = document.getElementById('admin-view-book-modal');
      const content = document.getElementById('admin-view-book-content');
      if (content) {
        content.innerHTML = `
          <div style="padding:1.5rem;border-bottom:1px solid var(--glass-border);display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:var(--bg-panel-solid);z-index:10;">
            <h3 style="margin:0;font-size:1.15rem;"><i class="fa-solid fa-book-open" style="color:var(--color-primary);"></i> Chi tiết sách: #${book.id}</h3>
            <button onclick="window._closeViewBookModal()" style="background:none;border:none;color:var(--text-muted);font-size:1.2rem;cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1.5rem;">
            <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
              <img src="${book.thumbnailUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(book.name) + '&background=333&color=fff'}" style="width:120px;height:180px;object-fit:cover;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.5);" />
              <div style="flex:1;min-width:260px;">
                <h2 style="margin:0 0 0.5rem;font-size:1.4rem;">${this._escapeAttr(book.name)}</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.9rem;color:var(--text-muted);">
                  <div><b>Tác giả:</b> <span style="color:var(--text-main);">${authorName}</span></div>
                  <div><b>Thể loại:</b> <span style="color:var(--text-main);">${cat.name}</span></div>
                  <div><b>Trạng thái:</b> ${this._statusBadge(book.approvalStatus || 'APPROVED')}</div>
                  <div><b>Hiển thị:</b> <span style="color:var(--text-main);">${book.isHidden ? 'Đang bị ẩn 🔴' : 'Công khai 🟢'}</span></div>
                  <div><b>Lượt xem/nghe:</b> <span style="color:var(--text-main);">${book.viewCount || 0}</span></div>
                  <div><b>Quốc gia:</b> <span style="color:var(--text-main);">${book.country || 'N/A'}</span></div>
                  <div><b>Năm XB:</b> <span style="color:var(--text-main);">${book.releaseDate || 'N/A'}</span></div>
                  <div><b>Ngôn ngữ:</b> <span style="color:var(--text-main);">${book.language || 'VN'}</span></div>
                </div>
              </div>
            </div>
            
            <div style="background:var(--bg-main);padding:1rem;border-radius:12px;border:1px solid var(--glass-border);">
              <h4 style="margin:0 0 0.75rem;font-size:0.95rem;">Mô tả nội dung</h4>
              <p style="margin:0;font-size:0.85rem;line-height:1.5;color:var(--text-muted);">${book.description ? this._escapeAttr(book.description).replace(/\n/g, '<br/>') : 'Chưa có mô tả.'}</p>
            </div>

            <div style="background:var(--bg-main);padding:1rem;border-radius:12px;border:1px solid var(--glass-border);">
              <h4 style="margin:0 0 0.75rem;font-size:0.95rem;">Thông tin hệ thống</h4>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.85rem;color:var(--text-muted);">
                <div><b>Người tải lên:</b> <span style="color:var(--text-main);">${submitterName}</span></div>
                <div><b>Ngày tạo:</b> <span style="color:var(--text-main);">${cDate}</span></div>
                <div style="grid-column:1/-1;overflow:hidden;text-overflow:ellipsis;"><b>Ebook URL:</b> <a href="${book.ebookFileUrl}" target="_blank" style="color:var(--color-primary);">${book.ebookFileUrl || 'N/A'}</a></div>
                <div style="grid-column:1/-1;overflow:hidden;text-overflow:ellipsis;"><b>Audio URL:</b> <a href="${book.audioFileUrl}" target="_blank" style="color:var(--color-secondary);">${book.audioFileUrl || 'N/A'}</a></div>
              </div>
            </div>
          </div>
        `;
      }

      if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
          modal.style.opacity = '1';
          modal.firstElementChild.style.transform = 'scale(1)';
        }, 10);
      }
    };

    window._closeViewBookModal = () => {
      const modal = document.getElementById('admin-view-book-modal');
      if (modal) {
        modal.style.opacity = '0';
        modal.firstElementChild.style.transform = 'scale(0.95)';
        setTimeout(() => modal.style.display = 'none', 200);
      }
    };

    // Add Book Events
    const renderAdminChapterRow = (container, index) => {
      const div = document.createElement('div');
      div.className = 'admin-chapter-item-form';
      div.style.display = 'flex';
      div.style.gap = '0.75rem';
      div.innerHTML = 
        `<input type="text" class="admin-chapter-name" placeholder="Tên chương ${index + 1}" style="flex:1;padding:0.5rem 0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-size:0.85rem;outline:none;" />` +
        `<input type="number" class="admin-chapter-duration" placeholder="Giây (VD: 300)" min="0" style="width:120px;padding:0.5rem 0.75rem;border-radius:8px;border:1px solid var(--glass-border);background:var(--bg-main);color:var(--text-main);font-size:0.85rem;outline:none;text-align:right;" />` + 
        `<button type="button" onclick="this.parentElement.remove()" style="background:none;border:none;color:#ff4757;cursor:pointer;padding:0 0.5rem;"><i class="fa-solid fa-trash"></i></button>`;
      container.appendChild(div);
    };

    window._openAddBookModal = () => {
      const modal = document.getElementById('admin-add-book-modal');
      const form = document.getElementById('admin-add-book-form');
      if (form) form.reset();
      
      const chapContainer = document.getElementById('admin-add-book-chapters-container');
      if (chapContainer) {
        chapContainer.innerHTML = '';
        renderAdminChapterRow(chapContainer, 0);
      }

      if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
          modal.style.opacity = '1';
          modal.firstElementChild.style.transform = 'scale(1)';
        }, 10);
      }
    };

    window._closeAddBookModal = () => {
      const modal = document.getElementById('admin-add-book-modal');
      if (modal) {
        modal.style.opacity = '0';
        modal.firstElementChild.style.transform = 'scale(0.95)';
        setTimeout(() => modal.style.display = 'none', 200);
      }
    };

    this._setupUploadZone('admin-zone-pdf', 'admin-file-pdf', 'admin-pdf-label');
    this._setupUploadZone('admin-zone-audio', 'admin-file-audio', 'admin-audio-label');
    this._setupUploadZone('admin-zone-copyright', 'admin-file-copyright', 'admin-copyright-label');

    const addChapBtn = document.getElementById('admin-add-book-add-chapter-btn');
    if (addChapBtn) {
      addChapBtn.addEventListener('click', () => {
        const c = document.getElementById('admin-add-book-chapters-container');
        if (c) renderAdminChapterRow(c, c.children.length);
      });
    }

    const bookForm = document.getElementById('admin-add-book-form');
    if (bookForm) {
      bookForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(bookForm);
        const payload = Object.fromEntries(fd.entries());
        payload.submittedByUserId = AuthService.getUser()?.id || 1;

        // Xử lý thu thập chapters array
        const chapters = [];
        document.querySelectorAll('#admin-add-book-form .admin-chapter-item-form').forEach((el) => {
          const name = el.querySelector('.admin-chapter-name')?.value?.trim() || '';
          const duration = parseInt(el.querySelector('.admin-chapter-duration')?.value) || 0;
          if (name || duration > 0) chapters.push({ name, duration });
        });

        const btn = document.getElementById('btn-admin-submit-add-book');
        const ogHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang thêm...';
        btn.disabled = true;

        try {
          const pdfFile = document.getElementById('admin-file-pdf')?.files?.[0];
          const audioFile = document.getElementById('admin-file-audio')?.files?.[0];
          const copyrightFile = document.getElementById('admin-file-copyright')?.files?.[0];
    
          const ebookFileUrl = pdfFile ? URL.createObjectURL(pdfFile) : (document.getElementById('admin-pub-ebook-url')?.value?.trim() || '');
          let audioFileUrl = '';
          let finalChapters = chapters;

          if (audioFile) {
            if (chapters.length > 0 && chapters.some(c => c.duration > 0)) {
              btn.innerHTML = '<i class="fa-solid fa-scissors fa-spin"></i> Đang cắt audio...';
              try {
                finalChapters = await this._splitAudio(audioFile, chapters);
                audioFileUrl = finalChapters[0]?.audiobookUrl || URL.createObjectURL(audioFile);
              } catch(e) {
                console.warn('Split audio failed, using full file:', e);
                audioFileUrl = URL.createObjectURL(audioFile);
              }
            } else {
              audioFileUrl = URL.createObjectURL(audioFile);
            }
          }
          btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi...';

          payload.chapters = finalChapters;
          payload.ebookFileUrl = ebookFileUrl;
          payload.audioFileUrl = audioFileUrl;
          const raw = await fetch('/api/admin/books/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const res = await raw.json();
          if (res.success) {
            this._toast('Thêm sách mới thành công', 'success');
            window._closeAddBookModal();
            if (res.createdAuthor) {
              this.authors.push(res.createdAuthor);
              this._toast(`Đã tạo tác giả: ${res.createdAuthor.firstName} ${res.createdAuthor.lastName}`, 'success');
            }
            this.books.unshift(res.book);
            if (this.currentTab === 'books') {
              this._reRenderTab();
            }
            this.reRender(); // Update stats
          } else {
            this._toast('Lỗi: ' + (res.error || 'Thêm sách thất bại'), 'error');
          }
        } catch (err) {
          console.error(err);
          this._toast('Lỗi mạng', 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = ogHtml;
        }
      });
    }
  }

  _setupUploadZone(zoneId, inputId, labelId) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    const label = document.getElementById(labelId);
    if (!zone || !input) return;

    zone.addEventListener('click', () => input.click());

    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) {
        input.files = e.dataTransfer.files;
        this._updateFileLabel(zone, label, e.dataTransfer.files[0]);
      }
    });

    input.addEventListener('change', () => {
      if (input.files.length > 0) {
        this._updateFileLabel(zone, label, input.files[0]);
      }
    });
  }

  _updateFileLabel(zone, label, file) {
    if (!label || !file) return;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    label.innerHTML = `<i class="fa-solid fa-check-circle" style="color:#2ed573;margin-right:4px;"></i> ${file.name.length > 15 ? file.name.substring(0,12) + '...' : file.name} <span style="color:var(--text-muted);font-size:0.65rem;">(${sizeMB}MB)</span>`;
    zone.classList.add('has-file');
  }

  async _splitAudio(audioFile, chapters) {
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    await audioCtx.close();

    const sampleRate = audioBuffer.sampleRate;
    const numChannels = audioBuffer.numberOfChannels;
    const totalSamples = audioBuffer.length;

    const result = [];
    let offsetSamples = 0;

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      const durationSec = ch.duration || 0;
      let frameCount;

      if (i === chapters.length - 1) {
        frameCount = totalSamples - offsetSamples;
      } else {
        frameCount = Math.round(durationSec * sampleRate);
      }

      frameCount = Math.max(1, Math.min(frameCount, totalSamples - offsetSamples));

      const offCtx = new OfflineAudioContext(numChannels, frameCount, sampleRate);
      const segBuffer = offCtx.createBuffer(numChannels, frameCount, sampleRate);
      for (let c = 0; c < numChannels; c++) {
        const srcData = audioBuffer.getChannelData(c);
        const dstData = segBuffer.getChannelData(c);
        for (let s = 0; s < frameCount; s++) {
          dstData[s] = srcData[offsetSamples + s] || 0;
        }
      }

      const wavBlob = this._encodeWav(segBuffer);
      const audiobookUrl = URL.createObjectURL(wavBlob);

      result.push({ name: ch.name, duration: durationSec, audiobookUrl });
      offsetSamples += frameCount;
    }

    return result;
  }

  _encodeWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const numFrames = buffer.length;
    const bytesPerSample = 2; // 16-bit
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = numFrames * blockAlign;
    const ab = new ArrayBuffer(44 + dataSize);
    const view = new DataView(ab);
    const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // bitDepth
    writeStr(36, 'data');
    view.setUint32(40, dataSize, true);
    let offset = 44;
    for (let i = 0; i < numFrames; i++) {
      for (let c = 0; c < numChannels; c++) {
        const s = buffer.getChannelData(c)[i];
        const clamped = Math.max(-1, Math.min(1, s));
        view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF, true);
        offset += 2;
      }
    }
    return new Blob([ab], { type: 'audio/wav' });
  }

  _toast(msg, color = 'var(--color-primary)') {
    const existing = document.getElementById('admin-toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.id = 'admin-toast';
    t.style.cssText = `position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(20px);
      background:${color};color:#fff;padding:0.75rem 1.5rem;border-radius:12px;
      font-size:0.88rem;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,0.4);
      z-index:99999;transition:all 0.3s;opacity:0;white-space:nowrap;`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; }, 10);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
  }

  _updatePendingCount() {
    const count = this.books.filter(b => b.approvalStatus === 'PENDING').length;
    const badge = document.getElementById('pending-count-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
    // Update stats card
    const statEl = document.getElementById('pending-stat-count');
    if (statEl) statEl.textContent = count;
  }

  reRender() {
    const container = document.getElementById('admin-dashboard');
    if (!container || this.isLoading) return;

    const pendingCount = this.books.filter(b => b.approvalStatus === 'PENDING').length;

    container.innerHTML = `
      <!-- Stats Row -->
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:1.25rem;margin-bottom:2rem;">
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;cursor:pointer;" onclick="window._adminSwitchTab('users')">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(260,80%,60%,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:var(--color-primary);flex-shrink:0;"><i class="fa-solid fa-users"></i></div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;">Tổng người dùng</p><h3 style="margin:0;font-size:1.7rem;">${this.users.length}</h3></div>
        </div>
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;cursor:pointer;" onclick="window._adminSwitchTab('books')">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(320,85%,60%,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:var(--color-secondary);flex-shrink:0;"><i class="fa-solid fa-book"></i></div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;">Tổng sách</p><h3 style="margin:0;font-size:1.7rem;">${this.books.length}</h3></div>
        </div>
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;cursor:pointer;" onclick="window._adminSwitchTab('pending')">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(38,100%,50%,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:#ffa500;flex-shrink:0;position:relative;">
            <i class="fa-solid fa-clock-rotate-left"></i>
            ${pendingCount > 0 ? `<span id="pending-count-badge" style="position:absolute;top:-4px;right:-4px;width:20px;height:20px;border-radius:50%;background:#ff4757;color:#fff;font-size:0.62rem;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(255,71,87,0.5);">${pendingCount}</span>` : ''}
          </div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;">Chờ duyệt</p><h3 style="margin:0;font-size:1.7rem;" id="pending-stat-count">${pendingCount}</h3></div>
        </div>
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;cursor:pointer;" onclick="window._adminSwitchTab('authors')">
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
          <button id="tab-pending" style="background:none;border:none;border-bottom:2px solid transparent;color:var(--text-muted);padding:0.5rem 0;font-size:0.95rem;font-weight:500;font-family:var(--font-sans);cursor:pointer;display:flex;align-items:center;gap:6px;">
            Duyệt sách
            ${pendingCount > 0 ? `<span style="background:#ff4757;color:#fff;font-size:0.62rem;font-weight:800;padding:2px 6px;border-radius:10px;min-width:18px;text-align:center;">${pendingCount}</span>` : ''}
          </button>
          <button id="tab-authors" style="background:none;border:none;border-bottom:2px solid transparent;color:var(--text-muted);padding:0.5rem 0;font-size:0.95rem;font-weight:500;font-family:var(--font-sans);cursor:pointer;">Tác giả</button>
          <button id="tab-comments" style="background:none;border:none;border-bottom:2px solid transparent;color:var(--text-muted);padding:0.5rem 0;font-size:0.95rem;font-weight:500;font-family:var(--font-sans);cursor:pointer;">Bình luận</button>
        </div>
        <div id="admin-tab-content">
          ${this._buildUsersTab()}
        </div>
      </div>
    `;

    // Handle modals outside the transformed container
    let modalsWrapper = document.getElementById('admin-modals-wrapper');
    if (!modalsWrapper) {
      modalsWrapper = document.createElement('div');
      modalsWrapper.id = 'admin-modals-wrapper';
      document.body.appendChild(modalsWrapper);
    }
    modalsWrapper.innerHTML = `
      ${this._buildCreateUserModal()}
      ${this._buildViewUserModal()}
      ${this._buildAddBookModal()}
      ${this._buildViewBookModal()}
    `;

    // Tab click events
    ['users', 'books', 'pending', 'comments'].forEach(tab => {
      const btn = document.getElementById(`tab-${tab}`);
      if (btn) btn.addEventListener('click', () => this._switchTab(tab));
    });

    window._adminSwitchTab = (tab) => this._switchTab(tab);
    this._attachTabEvents();
    this._attachCreateUserEvents();
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
