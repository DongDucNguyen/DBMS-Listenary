import { AuthService } from '../services/AuthService.js';

export class Navbar {
  constructor(currentPath, toggleTheme, currentTheme, currentUser) {
    this.currentPath = currentPath;
    this.toggleTheme = toggleTheme;
    this.currentTheme = currentTheme;
    this.currentUser = currentUser;
  }

  _isActive(hash) {
    return this.currentPath === hash
      ? 'color:var(--color-primary);font-weight:700;'
      : 'color:var(--text-main);';
  }

  _escape(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  _navLinksForRole() {
    const user = this.currentUser;
    const publicLinks = `
      <a href="#explore" style="${this._isActive('#explore')}">Khám Phá</a>
      <a href="#trending" style="${this._isActive('#trending')}"><i class="fa-solid fa-fire" style="color:#ff6b35;"></i> Trending</a>
      <a href="#authors" style="${this._isActive('#authors')}"><i class="fa-solid fa-pen-nib"></i> Tác giả</a>
      <a href="#genres" style="${this._isActive('#genres')}"><i class="fa-solid fa-layer-group"></i> Thể loại</a>
    `;
    if (!user) return publicLinks;
    if (user.roleId === 1) return publicLinks + `<a href="#admin" style="${this._isActive('#admin')}"><i class="fa-solid fa-shield-halved"></i> Quản trị</a>`;
    if (user.roleId === 3) return publicLinks + `<a href="#author" style="${this._isActive('#author')}"><i class="fa-solid fa-chart-pie"></i> Dashboard</a>`;
    return publicLinks;
  }

  _rightSection() {
    const user = this.currentUser;

    const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const searchValue = this.currentPath === '#search' ? (searchParams.get('q') || '') : '';

    const searchBar = `
      <form id="global-search-form" style="position:relative;margin:0;">
        <input id="global-search-input" type="search" value="${this._escape(searchValue)}" placeholder="Tìm sách, tác giả..." style="
          background:var(--bg-panel);
          border:1px solid var(--glass-border);
          padding:0.5rem 2.5rem 0.5rem 2.5rem;
          border-radius:20px;
          color:var(--text-main);
          outline:none;
          width:220px;
          font-family:var(--font-sans);
          transition:all var(--transition-fast);
        "
        onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='0 0 0 3px hsla(260,80%,60%,0.15)'"
        onblur="this.style.borderColor='var(--glass-border)';this.style.boxShadow='none'">
        <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:0.85rem;"></i>
        <button type="submit" title="Tìm kiếm" style="
          position:absolute;right:5px;top:50%;transform:translateY(-50%);
          width:30px;height:30px;border-radius:50%;border:0;
          background:var(--color-primary);color:#fff;cursor:pointer;
          display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-arrow-right" style="font-size:0.75rem;"></i>
        </button>
      </form>
    `;

    const themeBtn = `
      <button id="theme-toggle" class="btn-icon" title="${this.currentTheme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}">
        <i class="fa-solid ${this.currentTheme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
      </button>
    `;

    if (!user) {
      return `
        ${searchBar}
        ${themeBtn}
        <a href="#login" class="btn btn-primary" style="padding:0.5rem 1.25rem;font-size:0.9rem;">
          <i class="fa-solid fa-right-to-bracket"></i> Đăng nhập
        </a>
      `;
    }

    const roleTag = user.roleId === 1
      ? `<span style="background:#ffd700;color:#000;padding:1px 6px;border-radius:4px;font-size:0.65rem;font-weight:700;">ADMIN</span>`
      : user.roleId === 3
      ? `<span style="background:var(--color-accent);color:#000;padding:1px 6px;border-radius:4px;font-size:0.65rem;font-weight:700;">AUTHOR</span>`
      : `<span style="background:var(--color-primary);color:#fff;padding:1px 6px;border-radius:4px;font-size:0.65rem;font-weight:700;">USER</span>`;

    const avatarUrl = user.thumbnailUrl
      ? user.thumbnailUrl
      : `https://ui-avatars.com/api/?name=${encodeURIComponent((user.firstName || '') + '+' + (user.lastName || ''))}&background=7c3aed&color=fff`;

    const userProfileLink = '#user';

    return `
      ${searchBar}
      ${themeBtn}
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <a href="${userProfileLink}" style="display:flex;align-items:center;gap:0.75rem;text-decoration:none;padding:0.4rem 1rem 0.4rem 0.4rem;background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:50px;transition:all var(--transition-fast);"
          onmouseover="this.style.borderColor='var(--color-primary)'"
          onmouseout="this.style.borderColor='var(--glass-border)'">
          <img src="${avatarUrl}" alt="${user.username}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;" />
          <div style="line-height:1.2;">
            <div style="font-size:0.85rem;font-weight:600;color:var(--text-main);">${user.firstName || user.username}</div>
            <div>${roleTag}</div>
          </div>
        </a>
        <button id="logout-btn" class="btn-icon" title="Đăng xuất" style="color:#ff4757;">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    `;
  }

  render() {
    const nav = document.createElement('header');
    nav.className = 'glass-panel';
    Object.assign(nav.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100%', height: '72px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      zIndex: '1000',
      borderRadius: '0 0 20px 20px',
    });

    nav.innerHTML = `
      <a href="#explore" style="font-size:1.4rem;font-weight:800;font-family:var(--font-serif);display:flex;align-items:center;gap:0.5rem;text-decoration:none;" class="text-gradient">
        <i class="fa-solid fa-headphones"></i> LISTENARY
      </a>

      <nav style="display:flex;gap:1.75rem;align-items:center;font-size:0.95rem;font-weight:500;">
        ${this._navLinksForRole()}
      </nav>

      <div style="display:flex;gap:0.75rem;align-items:center;">
        ${this._rightSection()}
      </div>
    `;

    // Events
    const themeBtn = nav.querySelector('#theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', this.toggleTheme);

    const searchForm = nav.querySelector('#global-search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = nav.querySelector('#global-search-input')?.value.trim() || '';
        window.location.hash = query ? `#search?q=${encodeURIComponent(query)}` : '#search';
      });
    }

    const logoutBtn = nav.querySelector('#logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => AuthService.logout());

    return nav;
  }
}
