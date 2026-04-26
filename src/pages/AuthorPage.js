import { AuthService } from '../services/AuthService.js';

export class AuthorPage {
  constructor() {
    this.authorData = null;
    this.authorBooks = [];
    this.allComments = [];
    this.isLoading = true;
  }

  async fetchData() {
    try {
      const currentUser = AuthService.getUser();
      const res = await fetch('/database.json?t=' + Date.now());
      const data = await res.json();

      // Lấy thông tin tác giả tương ứng với user đang đăng nhập
      this.authorData = data.author.find(a => a.id === currentUser.authorId);
      // Lấy sách của tác giả này
      this.authorBooks = data.books.filter(b => b.authorId === currentUser.authorId);
      // Lấy comment cho sách của tác giả
      const authorBookIds = this.authorBooks.map(b => b.id);
      this.allComments = (data.comments || []).filter(c => authorBookIds.includes(c.bookId));
      this.allBooks = data.books;
      this.allUsers = data.user;
    } catch (err) {
      console.error(err);
    } finally {
      this.isLoading = false;
      this.reRender();
    }
  }

  _totalListens() {
    return this.authorBooks.reduce((sum, b) => sum + (b.weeklyViewCount || Math.floor(Math.random() * 50000) + 500), 0);
  }

  _avgRating() {
    if (this.allComments.length === 0) return 'N/A';
    const avg = this.allComments.reduce((s, c) => s + c.rating, 0) / this.allComments.length;
    return avg.toFixed(1);
  }

  reRender() {
    const container = document.getElementById('author-dashboard');
    if (!container || this.isLoading) return;

    if (!this.authorData) {
      container.innerHTML = `<div class="glass-panel" style="padding:3rem;text-align:center;"><p style="color:#ff4757;"><i class="fa-solid fa-circle-exclamation fa-2x"></i></p><p style="margin-top:1rem;">Không tìm thấy thông tin tác giả cho tài khoản này.</p></div>`;
      return;
    }

    const a = this.authorData;
    const avatarUrl = a.imagineUrl || `https://ui-avatars.com/api/?name=${a.firstName}+${a.lastName}&background=7c3aed&color=fff`;

    container.innerHTML = `
      <!-- Author Profile Header -->
      <div class="glass-panel" style="padding:2rem;display:flex;gap:2rem;align-items:center;margin-bottom:2rem;background:linear-gradient(135deg,hsla(260,50%,15%,0.7),hsla(320,50%,15%,0.7));">
        <img src="${avatarUrl}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid var(--color-primary);box-shadow:var(--shadow-glow);" />
        <div style="flex:1;">
          <h2 style="margin-bottom:0.25rem;">${a.firstName} ${a.lastName}</h2>
          <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:0.75rem;">${a.description ? a.description.substring(0,140) + '...' : ''}</p>
          <span style="background:var(--color-accent);color:#000;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:700;"><i class="fa-solid fa-pen-nib"></i> TÁC GIẢ</span>
        </div>
        <button class="btn btn-primary" onclick="alert('Form đăng sách mới đang xây dựng...')">
          <i class="fa-solid fa-plus"></i> Đăng sách mới
        </button>
      </div>

      <!-- Stats Row -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem;margin-bottom:2rem;">
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(260,80%,60%,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:var(--color-primary);flex-shrink:0;">
            <i class="fa-solid fa-book"></i>
          </div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:2px;">Tổng tác phẩm</p><h3 style="margin:0;font-size:1.6rem;">${this.authorBooks.length}</h3></div>
        </div>
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(320,85%,60%,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:var(--color-secondary);flex-shrink:0;">
            <i class="fa-solid fa-headphones"></i>
          </div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:2px;">Tổng lượt nghe</p><h3 style="margin:0;font-size:1.6rem;">${this._totalListens().toLocaleString()}</h3></div>
        </div>
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(190,90%,50%,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:var(--color-accent);flex-shrink:0;">
            <i class="fa-solid fa-star"></i>
          </div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:2px;">Đánh giá TB</p><h3 style="margin:0;font-size:1.6rem;">${this._avgRating()} <span style="font-size:0.85rem;color:#ffd700;">★</span></h3></div>
        </div>
        <div class="glass-card" style="padding:1.5rem;display:flex;align-items:center;gap:1rem;">
          <div style="width:52px;height:52px;border-radius:14px;background:hsla(50,100%,50%,0.1);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:#ffd700;flex-shrink:0;">
            <i class="fa-solid fa-comments"></i>
          </div>
          <div><p style="color:var(--text-muted);font-size:0.8rem;margin-bottom:2px;">Bình luận</p><h3 style="margin:0;font-size:1.6rem;">${this.allComments.length}</h3></div>
        </div>
      </div>

      <!-- Books Table + Comments -->
      <div style="display:grid;grid-template-columns:3fr 2fr;gap:2rem;">

        <!-- Books table -->
        <div class="glass-panel" style="padding:1.75rem;">
          <h3 style="margin-bottom:1.25rem;"><i class="fa-solid fa-book-open" style="color:var(--color-primary);"></i> Sách của tôi</h3>
          ${this.authorBooks.length === 0
            ? `<p style="color:var(--text-muted);text-align:center;padding:2rem;">Bạn chưa đăng tải sách nào. <br/><button class="btn btn-primary" style="margin-top:1rem;" onclick="alert('...')">Đăng ngay</button></p>`
            : `<table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="border-bottom:1px solid var(--glass-border);">
                  <th style="padding:0.75rem;color:var(--text-muted);font-weight:500;text-align:left;font-size:0.85rem;">Tác phẩm</th>
                  <th style="padding:0.75rem;color:var(--text-muted);font-weight:500;text-align:center;font-size:0.85rem;">Năm</th>
                  <th style="padding:0.75rem;color:var(--text-muted);font-weight:500;text-align:center;font-size:0.85rem;">Trang</th>
                  <th style="padding:0.75rem;color:var(--text-muted);font-weight:500;text-align:right;font-size:0.85rem;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                ${this.authorBooks.map(book => `
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.2s;"
                    onmouseover="this.style.background='var(--bg-main)'" onmouseout="this.style.background='transparent'">
                    <td style="padding:0.875rem;display:flex;align-items:center;gap:0.75rem;">
                      <img src="${book.thumbnailUrl}" style="width:38px;height:56px;object-fit:cover;border-radius:5px;flex-shrink:0;" />
                      <div>
                        <div style="font-weight:600;font-size:0.9rem;">${book.name}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">${book.country || ''}</div>
                      </div>
                    </td>
                    <td style="padding:0.875rem;text-align:center;font-size:0.85rem;">${book.releaseDate || '–'}</td>
                    <td style="padding:0.875rem;text-align:center;font-size:0.85rem;">${book.pageNumber || '–'}</td>
                    <td style="padding:0.875rem;text-align:right;">
                      <button class="btn-icon" style="width:32px;height:32px;font-size:0.8rem;" title="Chỉnh sửa" onclick="alert('Chỉnh sửa: ${book.name.replace(/'/g,"\\'")}')"><i class="fa-solid fa-pen"></i></button>
                      <button class="btn-icon" style="width:32px;height:32px;font-size:0.8rem;color:#ff4757;" title="Xóa" onclick="if(confirm('Xóa sách này?')) alert('Đã xóa (mock)')"><i class="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`
          }
        </div>

        <!-- Comments -->
        <div class="glass-panel" style="padding:1.75rem;">
          <h3 style="margin-bottom:1.25rem;"><i class="fa-solid fa-message" style="color:var(--color-secondary);"></i> Bình luận mới nhất</h3>
          <div style="display:flex;flex-direction:column;gap:0.75rem;max-height:450px;overflow-y:auto;">
            ${this.allComments.length === 0
              ? `<p style="color:var(--text-muted);text-align:center;padding:2rem;">Chưa có bình luận nào.</p>`
              : this.allComments.map(c => {
                  const book = this.allBooks.find(b => b.id === c.bookId);
                  const user = this.allUsers.find(u => u.id === c.userId);
                  const stars = '★'.repeat(Math.floor(c.rating));
                  return `
                    <div style="background:var(--bg-main);padding:0.875rem;border-radius:10px;border-left:3px solid var(--color-primary);">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;">
                        <span style="font-size:0.82rem;font-weight:600;">@${user?.username || 'user'}</span>
                        <span style="color:#ffd700;font-size:0.8rem;">${stars} ${c.rating}</span>
                      </div>
                      <p style="font-size:0.82rem;color:var(--text-main);margin-bottom:0.25rem;font-weight:600;">${c.title}</p>
                      <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.3rem;">${c.content}</p>
                      <p style="font-size:0.72rem;color:var(--color-primary);">📖 ${book?.name || ''}</p>
                    </div>
                  `;
                }).join('')
            }
          </div>
        </div>
      </div>
    `;
  }

  afterRender() {
    this.fetchData();
  }

  render() {
    const user = AuthService.getUser();
    return `
      <div class="container" style="padding-top:2rem;padding-bottom:4rem;">
        <div style="margin-bottom:2rem;" class="animate-slide-up">
          <h1 class="text-gradient">Author Dashboard</h1>
          <p style="color:var(--text-muted);">Quản lý tác phẩm, xem thống kê và tương tác với độc giả của bạn.</p>
        </div>
        <div id="author-dashboard" class="animate-slide-up stagger-1">
          <div style="text-align:center;padding:5rem;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:var(--color-primary);"></i></div>
        </div>
      </div>
    `;
  }
}
