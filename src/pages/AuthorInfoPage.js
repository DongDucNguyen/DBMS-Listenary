import '../pages.css';

export class AuthorInfoPage {
  constructor() {
    this.authorId = this._getIdFromHash();
    this.author = null;
    this.books = [];
    this.isLoading = true;
  }

  _getIdFromHash() {
    const hash = window.location.hash;
    if (hash.includes('?id=')) {
      return parseInt(hash.split('?id=')[1]);
    }
    return null;
  }

  async fetchData() {
    if (!this.authorId) {
      this.isLoading = false;
      this._reRender();
      return;
    }
    const res = await fetch('/database.json?t=' + Date.now());
    const data = await res.json();
    
    // Find the author
    this.author = data.author.find(a => a.id === this.authorId);
    
    // Find their books
    if (this.author && data.authorsOfBooks) {
      const bookIds = data.authorsOfBooks
        .filter(rel => rel.AuthorId === this.authorId)
        .map(rel => rel.BookId);
      this.books = data.books.filter(b => bookIds.includes(b.id) && (!b.approvalStatus || b.approvalStatus === 'APPROVED'));
    }
    
    this.isLoading = false;
    this._reRender();
  }

  _fmtViews(n) {
    if (!n) return 0;
    return n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? Math.floor(n/1000)+'K' : n;
  }

  _openBook(bookId) {
    window.location.hash = `#book?id=${bookId}`;
  }

  _renderBookCard(book, index) {
    const views = book.weeklyViewCount > 0 ? book.weeklyViewCount : ((book.id * 7919 + book.id * 31) % 78000) + 1200;
    const delay = Math.min(index * 50, 400);
    return `
      <div class="hover-lift" data-bookid="${book.id}" style="
        background:var(--bg-panel);border:1px solid var(--glass-border);
        border-radius:16px;overflow:hidden;cursor:pointer;
        display:flex;flex-direction:column;
        animation:fadeInScale 0.5s ease ${delay}ms both;">
        
        <div style="position:relative;height:240px;overflow:hidden;">
          <img src="${book.thumbnailUrl}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s;"
            onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'"/>
          <div style="position:absolute;inset:0;background:linear-gradient(0deg, var(--bg-panel) 0%, transparent 60%);"></div>
          <button class="play-book-btn" data-bookid="${book.id}" style="
            position:absolute;bottom:15px;right:15px;
            background:var(--color-primary);border:none;color:#fff;
            width:44px;height:44px;border-radius:50%;cursor:pointer;
            display:flex;align-items:center;justify-content:center;
            font-size:1rem;box-shadow:0 8px 20px rgba(0,0,0,0.5);transition:all 0.2s;"
            onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            <i class="fa-solid fa-play"></i>
          </button>
        </div>
        
        <div style="padding:1.25rem;flex:1;display:flex;flex-direction:column;">
          <h4 style="font-size:1.05rem;font-weight:700;margin:0 0 0.5rem;color:var(--text-main);
            display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.3;">
            ${book.name}
          </h4>
          <div style="display:flex;align-items:center;gap:15px;margin-top:auto;font-size:0.75rem;color:var(--text-muted);">
            <span><i class="fa-solid fa-headphones" style="color:var(--color-secondary);"></i> ${this._fmtViews(views)}</span>
            ${book.releaseDate ? `<span><i class="fa-regular fa-calendar" style="color:var(--color-accent);"></i> ${book.releaseDate}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  _reRender() {
    const container = document.getElementById('author-info-root');
    if (!container) return;

    if (this.isLoading) {
      container.innerHTML = `
        <div class="skeleton" style="height:400px;border-radius:24px;margin-bottom:2rem;"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1.5rem;">
          ${Array(5).fill('<div class="skeleton" style="height:320px;border-radius:16px;"></div>').join('')}
        </div>
      `;
      return;
    }

    if (!this.author) {
      container.innerHTML = `
        <div style="text-align:center;padding:5rem 0;">
          <i class="fa-solid fa-user-slash" style="font-size:4rem;color:var(--text-muted);margin-bottom:1.5rem;"></i>
          <h2>Không tìm thấy tác giả</h2>
          <p style="color:var(--text-muted);margin-bottom:2rem;">Tác giả bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <a href="#authors"><button class="btn btn-primary" style="padding:0.75rem 2rem;">Thử xem tác giả khác</button></a>
        </div>
      `;
      return;
    }

    const avatar = this.author.imagineUrl || `https://ui-avatars.com/api/?name=${this.author.firstName}+${this.author.lastName}&background=7c3aed&color=fff&size=256`;
    const totalViews = this.books.reduce((s, b) => s + (b.weeklyViewCount > 0 ? b.weeklyViewCount : ((b.id * 7919 + b.id * 31) % 78000) + 1200), 0);

    container.innerHTML = `
      <!-- Hero Header -->
      <div style="
        position:relative;border-radius:28px;overflow:hidden;
        padding:4rem 3rem;margin-bottom:3rem;display:flex;gap:3rem;align-items:center;
        box-shadow:0 20px 40px rgba(0,0,0,0.4);">
        
        <!-- Background blurring -->
        <div style="position:absolute;inset:0;background:var(--bg-main);"></div>
        <img src="${avatar}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
          filter:blur(30px) saturate(1.5);opacity:0.25;transform:scale(1.1);"/>
        <div style="position:absolute;inset:0;background:linear-gradient(90deg, var(--bg-main) 10%, transparent 100%);"></div>
        
        <img src="${avatar}" style="position:relative;z-index:2;width:220px;height:220px;border-radius:50%;object-fit:cover;
          box-shadow:0 15px 35px rgba(0,0,0,0.3);border:3px solid var(--glass-border);flex-shrink:0;"/>
        
        <div style="position:relative;z-index:2;flex:1;">
          <h1 style="font-family:'Playfair Display',serif;font-size:3.5rem;color:var(--text-main);margin:0 0 0.5rem;line-height:1.1;">
            ${this.author.firstName} ${this.author.lastName}
          </h1>
          <div style="font-size:0.95rem;color:var(--text-muted);margin-bottom:1.5rem;display:flex;gap:1rem;align-items:center;">
            ${this.author.birthday ? `<span style="background:var(--bg-panel);border:1px solid var(--glass-border);padding:4px 12px;border-radius:12px;color:var(--text-main);"><i class="fa-solid fa-cake-candles" style="margin-right:6px;color:var(--color-accent);"></i>${this.author.birthday}</span>` : ''}
            <span style="background:var(--bg-panel);border:1px solid var(--glass-border);padding:4px 12px;border-radius:12px;color:var(--text-main);"><i class="fa-solid fa-book-open" style="margin-right:6px;color:var(--color-primary);"></i>${this.books.length} Tác phẩm</span>
            <span style="background:var(--bg-panel);border:1px solid var(--glass-border);padding:4px 12px;border-radius:12px;color:var(--text-main);"><i class="fa-solid fa-headphones" style="margin-right:6px;color:#ff6b35;"></i>${this._fmtViews(totalViews)} Lượt nghe</span>
          </div>
          
          <p style="font-size:1.05rem;color:var(--text-muted);line-height:1.7;margin-bottom:2rem;max-width:800px;">
            ${this.author.description || 'Chưa có thông tin mô tả chi tiết.'}
          </p>

          <div style="display:flex;gap:1rem;">
            <button class="btn btn-primary" style="padding:0.8rem 2rem;border-radius:24px;font-weight:700;"><i class="fa-solid fa-plus" style="margin-right:8px;"></i>Theo dõi</button>
            <button class="btn" style="background:var(--bg-panel);border:1px solid var(--glass-border);color:var(--text-main);padding:0.8rem 1.5rem;border-radius:24px;">
              <i class="fa-solid fa-share-nodes"></i> Chia sẻ
            </button>
          </div>
        </div>
      </div>

      <!-- Books Grid -->
      <div style="margin-bottom:1.5rem;display:flex;align-items:center;gap:1rem;">
        <h2 style="font-size:1.6rem;color:var(--text-main);margin:0;">Tác Phẩm Của ${this.author.firstName} ${this.author.lastName}</h2>
        <div style="flex:1;height:1px;background:linear-gradient(90deg, var(--glass-border), transparent);"></div>
      </div>
      
      ${this.books.length === 0 ? `
        <div style="padding:4rem;text-align:center;background:var(--bg-panel);border-radius:16px;border:1px dashed var(--glass-border);">
          <i class="fa-solid fa-book" style="font-size:3rem;color:var(--text-muted);margin-bottom:1rem;"></i>
          <p style="color:var(--text-muted);">Hiện tại chưa có tác phẩm nào của tác giả này trên hệ thống.</p>
        </div>
      ` : `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1.5rem;">
          ${this.books.map((b, i) => this._renderBookCard(b, i)).join('')}
        </div>
      `}
    `;

    if (!document.getElementById('author-info-extra-style')) {
      const st = document.createElement('style');
      st.id = 'author-info-extra-style';
      st.textContent = `
        .hover-lift { transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s; }
        .hover-lift:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); border-color: rgba(124,58,237,0.4); }
      `;
      document.head.appendChild(st);
    }

    this._attachEvents();
  }

  _attachEvents() {
    document.querySelectorAll('[data-bookid]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.play-book-btn') && !el.classList.contains('play-book-btn')) return;
        
        const id = parseInt(el.dataset.bookid);
        if (id) {
          if (el.classList.contains('play-book-btn') || e.target.closest('.play-book-btn')) {
            window.location.hash = `#player?id=${id}`;
          } else {
            this._openBook(id);
          }
        }
      });
    });
  }

  afterRender() {
    this._reRender();
    this.fetchData();
  }

  render() {
    return `
      <div class="container" style="padding-top:2rem;padding-bottom:6rem;">
        <div id="author-info-root"></div>
      </div>
    `;
  }
}
