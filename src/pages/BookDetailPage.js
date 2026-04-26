import { AuthService } from '../services/AuthService.js';
import { MockDbService } from '../services/MockDbService.js';
import '../explore.css';

/**
 * BookDetailPage — Full page view for a single book.
 * Route: #book?id=N
 * Shows: cover, author, description, chapters list, comment section.
 * Click "Nghe ngay" → navigate to #player?id=N
 */
export class BookDetailPage {
  constructor() {
    this.bookId = null;
    this.book = null;
    this.author = null;
    this.chapters = [];
    this.comments = [];
    this.allComments = [];
    this.isLoading = true;
    this.editingCommentId = null;
  }

  async fetchData(bookId) {
    this.bookId = parseInt(bookId);
    const res = await fetch('/database.json?t=' + Date.now());
    const data = await res.json();

    this.book = data.books.find(b => b.id === this.bookId);
    if (!this.book) { this.isLoading = false; this._reRender(); return; }

    const rel = (data.authorsOfBooks || []).find(r => r.BookId === this.bookId);
    this.author = rel ? (data.author || []).find(a => a.id === rel.AuthorId) : null;

    this.chapters = (data.audioChapter || [])
      .filter(c => c.bookId === this.bookId)
      .sort((a, b) => a.chapterNumber - b.chapterNumber);

    // Comments: gộp DB + localStorage, lọc đã xóa, sắp xếp mới nhất
    const allComments = MockDbService.mergeComments(data.comments || []);
    this.allComments = allComments;
    this.comments = allComments.filter(c => c.bookId === this.bookId);

    // Related users for comment display
    this.users = data.user || [];

    // Lấy trạng thái yêu thích từ MockDbService (bao gồm DB tĩnh)
    const user = AuthService.getUser();
    if (user) {
      const userFavs = (data.userFavorites || []).filter(f => f.userId === user.id).map(f => f.bookId);
      this.isFavorite = MockDbService.isFavorite(user.id, this.bookId, userFavs);
    } else {
      this.isFavorite = false;
    }

    // More books by same author
    const authorBookIds = (data.authorsOfBooks || [])
      .filter(r => r.AuthorId === rel?.AuthorId && r.BookId !== this.bookId)
      .map(r => r.BookId);
    this.moreBooks = data.books.filter(b => authorBookIds.includes(b.id)).slice(0, 4);

    this.isLoading = false;
    this._reRender();
  }

  _fmt(s) {
    if (!s) return '0:00';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  _totalDuration() {
    const total = this.chapters.reduce((s, c) => s + (c.duration || 0), 0);
    if (!total) return '';
    if (total >= 3600) return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m`;
    return `${Math.floor(total / 60)} phút`;
  }

  _starRating(n) {
    const full = Math.round(Math.min(5, Math.max(0, n)));
    return Array(5).fill(0).map((_, i) =>
      `<i class="fa-${i < full ? 'solid' : 'regular'} fa-star" style="color:${i < full ? '#ffd700' : 'var(--text-muted)'};font-size:0.9rem;"></i>`
    ).join('');
  }

  _commentUser(c) {
    return this.users.find(u => u.id === c.userId) || { firstName: 'Ẩn', lastName: 'danh', thumbnailUrl: '' };
  }

  _timeAgo(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr), now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  }

  _reRender() {
    const root = document.getElementById('book-detail-root');
    if (!root) return;

    if (this.isLoading) {
      root.innerHTML = `
        <div style="display:grid;grid-template-columns:320px 1fr;gap:3rem;padding:2rem 0;">
          <div class="skeleton" style="height:460px;border-radius:20px;"></div>
          <div>
            <div class="skeleton" style="height:48px;width:70%;border-radius:8px;margin-bottom:1rem;"></div>
            <div class="skeleton" style="height:24px;width:40%;border-radius:8px;margin-bottom:2rem;"></div>
            <div class="skeleton" style="height:120px;border-radius:12px;margin-bottom:1rem;"></div>
            <div class="skeleton" style="height:120px;border-radius:12px;"></div>
          </div>
        </div>`;
      return;
    }

    if (!this.book) {
      root.innerHTML = `<div style="text-align:center;padding:5rem;color:var(--text-muted);">
        <i class="fa-solid fa-book-open" style="font-size:3rem;margin-bottom:1rem;"></i>
        <p>Không tìm thấy sách này.</p>
        <a href="#explore"><button class="btn btn-primary" style="margin-top:1rem;">Quay lại</button></a>
      </div>`;
      return;
    }

    const b = this.book;
    const auth = this.author;
    const user = AuthService.getUser();
    const avgRating = this.comments.length
      ? (this.comments.reduce((s, c) => s + (c.rating || 4), 0) / this.comments.length).toFixed(1)
      : '–';

    root.innerHTML = `
      <!-- Breadcrumb -->
      <nav style="display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;color:var(--text-muted);margin-bottom:2rem;">
        <a href="#explore" style="color:var(--text-muted);text-decoration:none;transition:color 0.2s;"
          onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--text-muted)'">
          <i class="fa-solid fa-house"></i> Khám phá
        </a>
        <i class="fa-solid fa-chevron-right" style="font-size:0.65rem;"></i>
        <span style="color:var(--text-main);">${b.name}</span>
      </nav>

      <!-- Hero area: cover + main info -->
      <div style="display:grid;grid-template-columns:280px 1fr;gap:3rem;margin-bottom:4rem;align-items:start;">

        <!-- Cover + actions -->
        <div style="position:sticky;top:100px;">
          <div style="position:relative;margin-bottom:1.5rem;">
            <img src="${b.thumbnailUrl}" alt="${b.name}"
              style="width:100%;aspect-ratio:2/3;object-fit:cover;border-radius:20px;
                     box-shadow:0 30px 60px rgba(0,0,0,0.4);" />
            ${this.chapters.length > 0 ? `
              <div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);
                background:var(--color-primary);color:#fff;border-radius:20px;
                padding:4px 16px;font-size:0.72rem;font-weight:700;white-space:nowrap;
                box-shadow:0 4px 14px hsla(260,80%,60%,0.4);">
                <i class="fa-solid fa-headphones"></i> ${this.chapters.length} chương · ${this._totalDuration()}
              </div>
            ` : ''}
          </div>

          <!-- Rating summary -->
          <div style="display:flex;align-items:center;gap:0.75rem;justify-content:center;margin-top:1.25rem;margin-bottom:1.5rem;">
            <span style="font-size:2rem;font-weight:800;color:var(--color-primary);">${avgRating}</span>
            <div>
              <div>${avgRating !== '–' ? this._starRating(parseFloat(avgRating)) : ''}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);">${this.comments.length} đánh giá</div>
            </div>
          </div>

          <!-- Action buttons -->
          <div style="display:flex;flex-direction:column;gap:0.75rem;">
            <button id="listen-btn" data-bookid="${b.id}" class="btn btn-primary" style="width:100%;justify-content:center;padding:0.9rem;">
              <i class="fa-solid fa-headphones"></i> Nghe ngay
            </button>
            ${b.ebookFileUrl ? `
              <button id="read-btn" data-bookid="${b.id}" class="btn" style="
                width:100%;justify-content:center;padding:0.9rem;
                background:var(--bg-panel);border:1px solid var(--glass-border);color:var(--text-main);">
                <i class="fa-solid fa-book-open"></i> Đọc ebook
              </button>
            ` : ''}
            <button id="fav-btn" class="btn" style="
              width:100%;justify-content:center;padding:0.75rem;
              background:${this.isFavorite ? 'rgba(255,71,87,0.1)' : 'transparent'};
              border:1px solid rgba(255,71,87,0.3);
              color:#ff4757;font-size:0.88rem;transition:all 0.2s;">
              <i class="fa-${this.isFavorite ? 'solid' : 'regular'} fa-heart"></i> 
              ${this.isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
            </button>
          </div>
        </div>

        <!-- Main info -->
        <div>
          <!-- Title & meta -->
          <h1 style="font-size:2.4rem;line-height:1.2;margin-bottom:0.5rem;">${b.name}</h1>

          ${auth ? `
            <div style="display:flex;align-items:center;gap:0.875rem;margin-bottom:1.5rem;cursor:pointer;"
              onmouseover="this.querySelector('.auth-name').style.color='var(--color-primary)'"
              onmouseout="this.querySelector('.auth-name').style.color='var(--text-muted)'">
              <img src="${auth.thumbnailUrl || `https://ui-avatars.com/api/?name=${auth.firstName}+${auth.lastName}&background=7c3aed&color=fff`}"
                style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--glass-border);" />
              <div>
                <div class="auth-name" style="font-weight:700;color:var(--text-muted);font-size:0.9rem;transition:color 0.2s;">
                  ${auth.firstName} ${auth.lastName}
                </div>
                <div style="font-size:0.72rem;color:var(--text-muted);">Tác giả</div>
              </div>
            </div>
          ` : ''}

          <!-- Tags -->
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.75rem;">
            ${b.country ? `<span class="meta-tag"><i class="fa-solid fa-globe"></i> ${b.country}</span>` : ''}
            ${b.releaseDate ? `<span class="meta-tag"><i class="fa-regular fa-calendar"></i> ${b.releaseDate}</span>` : ''}
            ${b.pageNumber ? `<span class="meta-tag"><i class="fa-solid fa-file-lines"></i> ${b.pageNumber} trang</span>` : ''}
            ${b.language ? `<span class="meta-tag"><i class="fa-solid fa-language"></i> ${b.language === 'VN' ? 'Tiếng Việt' : 'English'}</span>` : ''}
          </div>

          <!-- Description -->
          <div style="background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:18px;padding:1.75rem;margin-bottom:2rem;">
            <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.875rem;display:flex;align-items:center;gap:0.5rem;">
              <i class="fa-solid fa-align-left" style="color:var(--color-primary);"></i> Giới thiệu
            </h3>
            <p style="font-size:0.9rem;line-height:1.85;color:var(--text-muted);white-space:pre-line;">${(b.description || '').trim()}</p>
          </div>

          <!-- Author info card -->
          ${auth ? `
            <div style="background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:18px;padding:1.75rem;margin-bottom:2rem;display:flex;gap:1.5rem;align-items:flex-start;">
              <img src="${auth.thumbnailUrl || `https://ui-avatars.com/api/?name=${auth.firstName}+${auth.lastName}&background=7c3aed&color=fff`}"
                style="width:80px;height:80px;border-radius:16px;object-fit:cover;flex-shrink:0;border:2px solid var(--glass-border);" />
              <div>
                <h3 style="font-size:1.1rem;margin-bottom:0.25rem;">${auth.firstName} ${auth.lastName}</h3>
                <p style="font-size:0.8rem;color:var(--color-primary);margin-bottom:0.75rem;">
                  ${auth.expertise || auth.nationality || ''}
                </p>
                <p style="font-size:0.85rem;color:var(--text-muted);line-height:1.7;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">
                  ${auth.biography || auth.description || 'Chưa có thông tin tác giả.'}
                </p>
              </div>
            </div>
          ` : ''}

          <!-- Chapters preview -->
          ${this.chapters.length > 0 ? `
            <div style="background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:18px;padding:1.75rem;margin-bottom:2rem;">
              <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
                <i class="fa-solid fa-list-ol" style="color:var(--color-primary);"></i>
                <h3 style="font-size:1rem;font-weight:700;margin:0;">Các chương (${this.chapters.length})</h3>
                <span style="margin-left:auto;font-size:0.75rem;color:var(--text-muted);">${this._totalDuration()} tổng thời lượng</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:0.5rem;max-height:240px;overflow-y:auto;padding-right:4px;">
                ${this.chapters.map((ch, i) => `
                  <div style="display:flex;align-items:center;gap:1rem;padding:0.6rem 0.875rem;border-radius:10px;
                    transition:background 0.2s;cursor:pointer;"
                    onmouseover="this.style.background='var(--bg-main)'" onmouseout="this.style.background='transparent'">
                    <span style="width:26px;height:26px;border-radius:7px;background:var(--bg-main);
                      display:flex;align-items:center;justify-content:center;
                      font-size:0.72rem;font-weight:700;color:var(--text-muted);flex-shrink:0;">${i + 1}</span>
                    <span style="flex:1;font-size:0.85rem;font-weight:500;">${ch.name}</span>
                    <span style="font-size:0.72rem;color:var(--text-muted);">${this._fmt(ch.duration)}</span>
                  </div>
                `).join('')}
              </div>
              <button id="listen-btn-2" data-bookid="${b.id}" class="btn btn-primary" style="width:100%;margin-top:1rem;justify-content:center;">
                <i class="fa-solid fa-play"></i> Bắt đầu nghe
              </button>
            </div>
          ` : ''}

          <!-- More by this author -->
          ${this.moreBooks.length > 0 ? `
            <div style="margin-bottom:2rem;">
              <h3 style="font-size:1rem;font-weight:700;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem;">
                <i class="fa-solid fa-pen-nib" style="color:var(--color-secondary);"></i>
                Sách khác của ${auth ? auth.firstName + ' ' + auth.lastName : ''}
              </h3>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;">
                ${this.moreBooks.map(mb => `
                  <div data-bookid="${mb.id}" class="book-card-sm" style="cursor:pointer;">
                    <div class="cover-wrap"><img src="${mb.thumbnailUrl}" alt="${mb.name}" loading="lazy" /></div>
                    <div style="padding:0.625rem 0.75rem;">
                      <p style="font-size:0.78rem;font-weight:600;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${mb.name}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- ── Comment section ── -->
      <div id="comment-section" style="max-width:860px;">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem;">
          <div style="width:4px;height:28px;background:linear-gradient(var(--color-primary),var(--color-secondary));border-radius:2px;"></div>
          <h2 style="font-size:1.5rem;margin:0;">Bình luận & Đánh giá</h2>
          <span style="background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:20px;padding:2px 12px;font-size:0.8rem;color:var(--text-muted);">
            ${this.comments.length}
          </span>
        </div>

        <!-- Comment form -->
        ${user ? `
          <div style="background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:20px;padding:1.75rem;margin-bottom:2rem;">
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.25rem;">
              <img src="${user.thumbnailUrl || `https://ui-avatars.com/api/?name=${user.firstName||'U'}+${user.lastName||''}&&background=7c3aed&color=fff`}"
                style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid var(--glass-border);" />
              <div>
                <div style="font-weight:700;font-size:0.9rem;">${user.firstName || ''} ${user.lastName || ''}</div>
                <div id="comment-stars" style="display:flex;gap:4px;cursor:pointer;margin-top:2px;">
                  ${[1,2,3,4,5].map(n => `<i class="fa-regular fa-star star-btn" data-val="${n}" style="color:var(--text-muted);font-size:1.1rem;transition:color 0.15s;"></i>`).join('')}
                </div>
              </div>
            </div>
            <textarea id="comment-input" placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..." rows="3"
              style="width:100%;background:var(--bg-main);border:1px solid var(--glass-border);border-radius:12px;
                     padding:0.875rem 1rem;font-size:0.88rem;color:var(--text-main);resize:vertical;
                     font-family:'Outfit',sans-serif;outline:none;transition:border-color 0.2s;"
              onfocus="this.style.borderColor='var(--color-primary)'"
              onblur="this.style.borderColor='var(--glass-border)'"></textarea>
            <div style="display:flex;justify-content:flex-end;margin-top:0.875rem;">
              <button id="submit-comment" class="btn btn-primary" style="padding:0.65rem 1.5rem;font-size:0.88rem;">
                <i class="fa-solid fa-paper-plane"></i> Gửi bình luận
              </button>
            </div>
          </div>
        ` : `
          <div style="background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:20px;padding:2rem;text-align:center;margin-bottom:2rem;">
            <i class="fa-solid fa-comment-slash" style="font-size:2rem;color:var(--text-muted);margin-bottom:0.75rem;"></i>
            <p style="color:var(--text-muted);margin-bottom:1rem;">Đăng nhập để bình luận và đánh giá sách.</p>
            <a href="#login"><button class="btn btn-primary" style="padding:0.65rem 1.5rem;">
              <i class="fa-solid fa-right-to-bracket"></i> Đăng nhập
            </button></a>
          </div>
        `}

        <!-- Comment list -->
        <div id="comments-list">
          ${this.comments.length === 0 ? `
            <div style="text-align:center;padding:3rem;color:var(--text-muted);">
              <i class="fa-regular fa-comments" style="font-size:2.5rem;margin-bottom:0.75rem;"></i>
              <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            </div>
          ` : this.comments.map(c => {
            const cu = this._commentUser(c);
            let canDelete = false;
            let canEdit = false;
            if (user) {
              if (user.id === c.userId) {
                canDelete = true;
                canEdit = true;
              } else if (user.roleId === 1) {
                canDelete = true;
              } else if (user.roleId === 3 && this.author && user.authorId === this.author.id) {
                canDelete = true;
              }
            }
            
            return `
              <div style="display:flex;gap:1rem;padding:1.25rem 0;border-bottom:1px solid var(--glass-border);">
                <img src="${cu.thumbnailUrl || `https://ui-avatars.com/api/?name=${cu.firstName}+${cu.lastName}&background=7c3aed&color=fff`}"
                  style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid var(--glass-border);flex-shrink:0;" />
                <div style="flex:1;">
                  <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.25rem;">
                    <span style="font-weight:700;font-size:0.88rem;">${cu.firstName} ${cu.lastName}</span>
                    ${c.rating ? this._starRating(c.rating) : ''}
                    <span style="font-size:0.72rem;color:var(--text-muted);margin-left:auto;">${this._timeAgo(c.createdAt)}</span>
                    ${canEdit ? `
                      <button class="edit-comment-btn" data-cid="${c.id}" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0 5px;transition:color 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--text-muted)'" title="Sửa bình luận"><i class="fa-solid fa-pen"></i></button>
                    ` : ''}
                    ${canDelete ? `
                      <button class="delete-comment-btn" data-cid="${c.id}" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0 5px;transition:color 0.2s;" onmouseover="this.style.color='#ff4757'" onmouseout="this.style.color='var(--text-muted)'" title="Xóa bình luận"><i class="fa-solid fa-trash"></i></button>
                    ` : ''}
                  </div>
                  <p style="font-size:0.88rem;color:var(--text-muted);line-height:1.7;">${c.content || c.text || ''}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this._attachEvents();
  }

  _confirm(msg, onConfirm) {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
    ov.innerHTML = `
      <div style="background:var(--bg-panel);border:1px solid var(--glass-border);border-radius:16px;padding:2rem;max-width:350px;text-align:center;box-shadow:var(--shadow-lg);transform:scale(0.9);opacity:0;transition:all 0.2s;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size:2.5rem;color:#ff4757;margin-bottom:1rem;"></i>
        <h3 style="margin-bottom:0.75rem;font-size:1.15rem;">Xác nhận xóa</h3>
        <p style="color:var(--text-muted);font-size:0.9rem;line-height:1.5;margin-bottom:1.5rem;">${msg}</p>
        <div style="display:flex;gap:0.75rem;justify-content:center;">
          <button id="cf-cancel" class="btn" style="flex:1;background:var(--bg-main);border:1px solid var(--glass-border);color:var(--text-main);padding:0.6rem;">Hủy</button>
          <button id="cf-ok" class="btn" style="flex:1;background:#ff4757;border:none;color:#fff;padding:0.6rem;">Xóa</button>
        </div>
      </div>
    `;
    document.body.appendChild(ov);
    const box = ov.firstElementChild;
    // Animate in
    setTimeout(() => { box.style.transform = 'scale(1)'; box.style.opacity = '1'; }, 10);
    
    const close = () => {
      box.style.transform = 'scale(0.9)'; box.style.opacity = '0';
      setTimeout(() => ov.remove(), 200);
    };
    
    ov.querySelector('#cf-cancel').onclick = close;
    ov.querySelector('#cf-ok').onclick = () => { close(); onConfirm(); };
  }

  _attachEvents() {
    // Listen buttons → navigate to player
    ['listen-btn', 'listen-btn-2'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', () => {
        window.location.hash = `#player?id=${this.bookId}`;
      });
    });

    // Read ebook → open PDF player
    document.getElementById('read-btn')?.addEventListener('click', () => {
      if (this.book?.ebookFileUrl) {
        window.location.hash = `#player?id=${this.bookId}&mode=pdf`;
      }
    });

    // More books by same author
    document.querySelectorAll('[data-bookid]').forEach(el => {
      if (el.classList.contains('book-card-sm')) {
        el.addEventListener('click', () => {
          window.location.hash = `#book?id=${el.dataset.bookid}`;
        });
      }
    });

    // Star rating interaction
    let selectedRating = 5;
    document.querySelectorAll('.star-btn').forEach(star => {
      star.addEventListener('mouseover', () => {
        const val = parseInt(star.dataset.val);
        document.querySelectorAll('.star-btn').forEach((s, i) => {
          s.className = i < val ? 'fa-solid fa-star star-btn' : 'fa-regular fa-star star-btn';
          s.style.color = i < val ? '#ffd700' : 'var(--text-muted)';
        });
      });
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.val);
      });
      star.addEventListener('mouseleave', () => {
        document.querySelectorAll('.star-btn').forEach((s, i) => {
          s.className = i < selectedRating ? 'fa-solid fa-star star-btn' : 'fa-regular fa-star star-btn';
          s.style.color = i < selectedRating ? '#ffd700' : 'var(--text-muted)';
        });
      });
    });

    // Submit comment
    document.getElementById('submit-comment')?.addEventListener('click', () => {
      const input = document.getElementById('comment-input');
      const text = input?.value.trim();
      if (!text) { input.style.borderColor = '#ff4757'; return; }

      const user = AuthService.getUser();
      if (this.editingCommentId) {
        // Edit mode
        const cid = this.editingCommentId;
        const target = this.comments.find(c => parseInt(c.id, 10) === parseInt(cid, 10));
        if (target) {
          target.content = text;
          target.rating = selectedRating;
          MockDbService.editComment(cid, { content: text, rating: selectedRating });
        }
        this.editingCommentId = null;
        this._toast('Đã cập nhật bình luận!');
      } else {
        // Add new
        const newComment = {
          id: Date.now(),
          bookId: this.bookId,
          userId: user.id,
          content: text,
          rating: selectedRating,
          createdAt: new Date().toISOString()
        };

        this.comments.unshift(newComment);
        MockDbService.addComment(newComment);
        this._toast('Đã gửi bình luận!');
      }

      input.value = '';
      selectedRating = 5;

      // Re-render entirely to apply UI changes and re-attach events
      this._reRender();
    });

    // Edit comment
    document.querySelectorAll('.edit-comment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cid = parseInt(btn.dataset.cid, 10);
        const comment = this.comments.find(c => parseInt(c.id, 10) === cid);
        if (comment) {
          this.editingCommentId = cid;
          const input = document.getElementById('comment-input');
          if (input) {
            input.value = comment.content || comment.text || '';
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // update selected rating
            selectedRating = comment.rating || 5;
            document.querySelectorAll('.star-btn').forEach((s, i) => {
              s.className = i < selectedRating ? 'fa-solid fa-star star-btn' : 'fa-regular fa-star star-btn';
              s.style.color = i < selectedRating ? '#ffd700' : 'var(--text-muted)';
            });

            // Change button text
            const submitBtn = document.getElementById('submit-comment');
            if (submitBtn) {
              submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu thay đổi';
            }
          }
        }
      });
    });

    // Favorite toggle
    document.getElementById('fav-btn')?.addEventListener('click', () => {
      const user = AuthService.getUser();
      if (!user) {
        alert('Vui lòng đăng nhập để thêm vào yêu thích!');
        return;
      }
      this.isFavorite = !this.isFavorite;
      if (this.isFavorite) {
        MockDbService.addFavorite(user.id, this.bookId);
      } else {
        MockDbService.removeFavorite(user.id, this.bookId);
      }
      this._reRender();
      this._toast(this.isFavorite ? 'Đã thêm vào yêu thích!' : 'Đã bỏ yêu thích!');
    });

    // Delete comment
    document.querySelectorAll('.delete-comment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._confirm('Bạn có chắc muốn xóa bình luận này? Hành động này không thể hoàn tác.', () => {
          const cid = parseInt(btn.dataset.cid, 10);
          this.comments = this.comments.filter(c => parseInt(c.id, 10) !== cid);
          MockDbService.deleteComment(cid);
          this._reRender();
          this._toast('Đã xóa bình luận!');
        });
      });
    });
  }

  _toast(msg) {
    const t = document.createElement('div');
    t.style.cssText = `
      position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(20px);
      background:var(--color-primary);color:#fff;padding:0.75rem 1.5rem;border-radius:12px;
      font-size:0.88rem;font-weight:600;box-shadow:var(--shadow-lg);z-index:9999;
      transition:all 0.3s;opacity:0;`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; }, 10);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
  }

  afterRender() {
    const hash = window.location.hash;
    const idMatch = hash.match(/[?&]id=(\d+)/);
    if (idMatch) this.fetchData(idMatch[1]);
  }

  render() {
    return `
      <div class="container" style="padding-top:2rem;padding-bottom:5rem;">
        <!-- Inline meta tag styles -->
        <style>
          .meta-tag {
            background: var(--bg-panel);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 4px 12px;
            font-size: 0.78rem;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            color: var(--text-muted);
          }
        </style>
        <div id="book-detail-root">
          <div style="display:grid;grid-template-columns:280px 1fr;gap:3rem;">
            <div class="skeleton" style="height:420px;border-radius:20px;"></div>
            <div>
              <div class="skeleton" style="height:48px;width:60%;border-radius:8px;margin-bottom:1rem;"></div>
              <div class="skeleton" style="height:24px;width:35%;border-radius:8px;margin-bottom:2rem;"></div>
              <div class="skeleton" style="height:150px;border-radius:12px;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
